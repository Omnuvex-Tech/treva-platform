import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import type { AuthUser } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ClientListQueryDto,
  CreateClientDto,
  UpdateClientDto,
} from './dto/clients.dto';

const CLIENT_NOT_FOUND = {
  message: 'Client not found',
  code: 'not_found',
} as const;

const withBroker = {
  broker: { select: { fullName: true } },
} satisfies Prisma.ClientInclude;

type ClientRow = Prisma.ClientGetPayload<{ include: typeof withBroker }>;

/**
 * treva-broker's `Client` (apps/treva-broker/src/features/clients/types.ts):
 * dates as ISO strings and the broker's name alongside the id. Change both
 * together.
 */
function toClient(row: ClientRow) {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    additionalPhones: row.additionalPhones,
    email: row.email,
    brokerId: row.brokerId,
    brokerName: row.broker.fullName,
    objectOfInterest: row.objectOfInterest,
    developerBrand: row.developerBrand,
    website: row.website,
    comments: row.comments,
    status: row.status,
    approvedUntil: row.approvedUntil?.toISOString() ?? null,
    consent: row.consent,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Who sees and touches which clients — treva-broker's permission matrix
 * (src/lib/auth/permissions.ts), enforced here from the token rather than
 * trusted from the query string:
 *
 *  - a broker works their own book only;
 *  - a top broker (`clients:read_all`, `clients:assign`, `clients:delete`)
 *    works their whole team, which is their company;
 *  - an admin works every client.
 */
@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  private async scope(user: AuthUser): Promise<Prisma.ClientWhereInput> {
    if (user.role === 'admin') return {};

    if (user.role === 'top_broker') {
      const me = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });

      // A top broker outside any company has no team to see beyond themself.
      if (me?.companyId) return { broker: { companyId: me.companyId } };
    }

    return { brokerId: user.id };
  }

  private async findScoped(user: AuthUser, id: string) {
    const row = await this.prisma.client.findFirst({
      where: { AND: [await this.scope(user), { id }] },
      include: withBroker,
    });

    if (!row) throw new NotFoundException(CLIENT_NOT_FOUND);
    return row;
  }

  /**
   * The broker a lead is filed under. Everyone may keep it on themself; only a
   * role that assigns clients may name someone else, and that someone has to
   * be inside the caller's own scope.
   */
  private async resolveBroker(
    user: AuthUser,
    requested: string | undefined,
    fallback: string,
  ): Promise<string> {
    if (!requested || requested === fallback) return fallback;
    if (requested === user.id) return requested;

    if (user.role === 'broker') {
      throw new ForbiddenException(
        'You cannot assign clients to other brokers',
      );
    }

    const broker = await this.prisma.user.findUnique({
      where: { id: requested },
      select: { id: true, companyId: true, isActive: true },
    });

    if (!broker?.isActive) {
      throw new BadRequestException('That broker does not exist');
    }

    if (user.role === 'top_broker') {
      const me = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });

      if (!me?.companyId || me.companyId !== broker.companyId) {
        throw new ForbiddenException(
          'You can only assign clients within your team',
        );
      }
    }

    return broker.id;
  }

  private assertCanReview(user: AuthUser, status: string | undefined) {
    if (status !== undefined && user.role !== 'admin') {
      throw new ForbiddenException('Only an admin can change a lead’s status');
    }
  }

  async list(user: AuthUser, query: ClientListQueryDto) {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 8;
    const search = query.search;

    const where: Prisma.ClientWhereInput = {
      AND: [
        await this.scope(user),
        query.status ? { status: query.status } : {},
        query.brokerId ? { brokerId: query.brokerId } : {},
        search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                {
                  objectOfInterest: { contains: search, mode: 'insensitive' },
                },
                {
                  broker: {
                    fullName: { contains: search, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
        where,
        include: withBroker,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      items: rows.map(toClient),
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  async detail(user: AuthUser, id: string) {
    return toClient(await this.findScoped(user, id));
  }

  async create(user: AuthUser, dto: CreateClientDto) {
    // "Submit for approval": a lead always starts under review, whoever sends it.
    if (dto.status !== undefined && dto.status !== 'pending') {
      this.assertCanReview(user, dto.status);
    }

    if (!dto.consent) {
      throw new BadRequestException({
        message: 'Confirm the client acknowledged the Privacy policy',
        code: 'consent_required',
      });
    }

    const brokerId = await this.resolveBroker(user, dto.brokerId, user.id);

    const row = await this.prisma.client.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        additionalPhones: dto.additionalPhones,
        email: dto.email,
        objectOfInterest: dto.objectOfInterest,
        developerBrand: dto.developerBrand,
        website: dto.website,
        comments: dto.comments,
        consent: dto.consent,
        status: dto.status ?? 'pending',
        brokerId,
      },
      include: withBroker,
    });

    return toClient(row);
  }

  async update(user: AuthUser, id: string, dto: UpdateClientDto) {
    const existing = await this.findScoped(user, id);

    // The edit form sends the status it loaded; only a change is a review.
    const statusChanges =
      dto.status !== undefined && dto.status !== existing.status;
    if (statusChanges) this.assertCanReview(user, dto.status);

    if (dto.consent === false) {
      throw new BadRequestException({
        message: 'Confirm the client acknowledged the Privacy policy',
        code: 'consent_required',
      });
    }

    const brokerId = await this.resolveBroker(
      user,
      dto.brokerId,
      existing.brokerId,
    );

    const row = await this.prisma.client.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        additionalPhones: dto.additionalPhones,
        email: dto.email,
        objectOfInterest: dto.objectOfInterest,
        developerBrand: dto.developerBrand,
        website: dto.website,
        comments: dto.comments,
        consent: dto.consent,
        brokerId,
        ...(statusChanges
          ? {
              status: dto.status,
              // An approval outside this form carries its own date; leaving
              // "approved" drops it.
              ...(dto.status === 'approved' ? {} : { approvedUntil: null }),
            }
          : {}),
      },
      include: withBroker,
    });

    return toClient(row);
  }

  async remove(user: AuthUser, id: string) {
    await this.findScoped(user, id);
    await this.prisma.client.delete({ where: { id } });
  }

  /** All-or-nothing: an id the caller cannot see fails the whole request. */
  async removeMany(user: AuthUser, ids: string[]) {
    const unique = [...new Set(ids)];
    if (!unique.length) return;

    const where: Prisma.ClientWhereInput = {
      AND: [await this.scope(user), { id: { in: unique } }],
    };

    const visible = await this.prisma.client.count({ where });
    if (visible !== unique.length)
      throw new NotFoundException(CLIENT_NOT_FOUND);

    await this.prisma.client.deleteMany({ where });
  }
}

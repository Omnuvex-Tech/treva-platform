import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import type { AuthUser } from '../auth/jwt.strategy';
import { BitrixSyncService } from '../bitrix/bitrix-sync.service';
import { PrismaService } from '../prisma/prisma.service';
import { clientPhoneTaken } from '../common/phone';
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

const PHONE_TAKEN = {
  message: 'A client with this phone number is already registered',
  code: 'client_phone_taken',
} as const;

const ALREADY_IN_BITRIX = {
  message:
    'This client has already been checked in Bitrix24 and can no longer be edited here',
  code: 'client_checked',
} as const;

/**
 * treva-broker's `Client` (apps/treva-broker/src/features/clients/types.ts):
 * dates as ISO strings and the broker's name alongside the id. Change both
 * together.
 *
 * Why a push to Bitrix failed is an admin's concern; a broker only learns
 * whether their lead has reached Bitrix.
 */
function toClient(row: ClientRow, user: AuthUser) {
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
    bitrix: {
      contactId: row.bitrixContactId,
      syncState: row.bitrixSyncState,
      syncError: user.role === 'admin' ? row.bitrixSyncError : null,
      syncedAt: row.bitrixSyncedAt?.toISOString() ?? null,
      deal:
        row.bitrixDealId === null
          ? null
          : {
              id: row.bitrixDealId,
              title: row.bitrixDealTitle ?? '',
              stage: row.bitrixDealStage ?? '',
              stageSemantics: row.bitrixDealStageSemantics ?? 'P',
              amount: row.bitrixDealAmount,
              currency: row.bitrixDealCurrency,
            },
    },
  };
}

/**
 * Who sees and touches which clients — treva-broker's permission matrix
 * (src/lib/auth/permissions.ts), enforced here from the token rather than
 * trusted from the query string:
 *
 *  - a broker and a top broker work their own leads only;
 *  - an admin (`clients:read_all`, `clients:assign`) works every client.
 *
 * Registering a client checks it against Bitrix24 (BitrixSyncService): a new
 * client gets a contact and a deal in "Сделки от агентов", one Bitrix already
 * has gets none. The panel never writes `status`; reading a client brings its
 * deal up to date from Bitrix.
 */
@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bitrixSync: BitrixSyncService,
  ) {}

  private scope(user: AuthUser): Prisma.ClientWhereInput {
    return user.role === 'admin' ? {} : { brokerId: user.id };
  }

  private async findScoped(user: AuthUser, id: string) {
    const row = await this.prisma.client.findFirst({
      where: { AND: [this.scope(user), { id }] },
      include: withBroker,
    });

    if (!row) throw new NotFoundException(CLIENT_NOT_FOUND);
    return row;
  }

  /**
   * The broker a lead is filed under. Everyone may keep it on themself; only an
   * admin may name someone else — anyone else would lose sight of the lead.
   */
  private async resolveBroker(
    user: AuthUser,
    requested: string | undefined,
    fallback: string,
  ): Promise<string> {
    if (!requested || requested === fallback) return fallback;
    if (requested === user.id) return requested;

    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'You cannot assign clients to other brokers',
      );
    }

    const broker = await this.prisma.user.findUnique({
      where: { id: requested },
      select: { id: true, isActive: true },
    });

    if (!broker?.isActive) {
      throw new BadRequestException('That broker does not exist');
    }

    return broker.id;
  }

  /**
   * A client's numbers must be new to the platform — whichever broker holds
   * the other client, so a second broker cannot register someone already
   * registered here. (Bitrix is a separate check: a number Bitrix knows but
   * the platform does not is still saved here, just without a deal.)
   */
  private async assertPhonesFree(phones: string[], exceptId?: string) {
    if (await clientPhoneTaken(this.prisma, phones, exceptId)) {
      throw new ConflictException(PHONE_TAKEN);
    }
  }

  async list(user: AuthUser, query: ClientListQueryDto) {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 8;
    const search = query.search;

    const where: Prisma.ClientWhereInput = {
      AND: [
        this.scope(user),
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

    // Bring the page on screen up to date with Bitrix, then read it again.
    // (The status filter above ran on the previous mirror; the next load
    // catches any client whose status just moved.)
    const ids = rows.map((row) => row.id);
    await this.bitrixSync.refresh(ids);
    const fresh = new Map(
      (
        await this.prisma.client.findMany({
          where: { id: { in: ids } },
          include: withBroker,
        })
      ).map((row) => [row.id, row]),
    );

    return {
      items: rows.map((row) => toClient(fresh.get(row.id) ?? row, user)),
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  async detail(user: AuthUser, id: string) {
    const row = await this.findScoped(user, id);
    await this.bitrixSync.refresh([row.id]);
    return toClient(await this.findScoped(user, id), user);
  }

  async create(user: AuthUser, dto: CreateClientDto) {
    if (!dto.consent) {
      throw new BadRequestException({
        message: 'Confirm the client acknowledged the Privacy policy',
        code: 'consent_required',
      });
    }

    await this.assertPhonesFree([dto.phone, ...dto.additionalPhones]);

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
        // Pending until Bitrix has been checked, straight after this insert.
        status: 'pending',
        brokerId,
      },
      include: withBroker,
    });

    // Checked straight away; should Bitrix be unreachable the client is kept
    // as `pending`, and the next read of it tries again.
    await this.bitrixSync.push(row.id);

    return toClient(await this.findScoped(user, row.id), user);
  }

  async update(user: AuthUser, id: string, dto: UpdateClientDto) {
    const existing = await this.findScoped(user, id);

    // Once the Bitrix check has run — deal created or client already there —
    // Bitrix owns the record; only a client still waiting can be corrected.
    if (existing.status !== 'pending') {
      throw new ForbiddenException(ALREADY_IN_BITRIX);
    }

    if (dto.consent === false) {
      throw new BadRequestException({
        message: 'Confirm the client acknowledged the Privacy policy',
        code: 'consent_required',
      });
    }

    if (dto.phone !== undefined || dto.additionalPhones !== undefined) {
      await this.assertPhonesFree(
        [
          dto.phone ?? existing.phone,
          ...(dto.additionalPhones ?? existing.additionalPhones),
        ],
        id,
      );
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
      },
    });

    await this.bitrixSync.push(row.id);

    return toClient(await this.findScoped(user, row.id), user);
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
      AND: [this.scope(user), { id: { in: unique } }],
    };

    const visible = await this.prisma.client.count({ where });
    if (visible !== unique.length)
      throw new NotFoundException(CLIENT_NOT_FOUND);

    await this.prisma.client.deleteMany({ where });
  }
}

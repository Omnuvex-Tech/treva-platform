import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { Prisma } from '../generated/prisma/client';
import type { AuthUser } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import {
  COMPANY_NAME_TAKEN,
  CompaniesService,
} from '../companies/companies.service';
import type {
  AgencyListQueryDto,
  CreateAgencyDto,
  SaveAgencyDto,
  CreateUserDto,
  SaveUserDto,
  UserListQueryDto,
  UserStatusValue,
} from './dto/users.dto';

const BCRYPT_ROUNDS = 10;

const USER_NOT_FOUND = {
  message: 'User not found',
  code: 'not_found',
} as const;
const AGENCY_NOT_FOUND = {
  message: 'Agency not found',
  code: 'not_found',
} as const;
const EMAIL_TAKEN = {
  message: 'An account with this email already exists',
  code: 'email_taken',
} as const;

const USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  jobTitle: true,
  phones: true,
  cooperationType: true,
  accessPermission: true,
  isActive: true,
  companyId: true,
  companyRole: true,
  lastLoginAt: true,
  createdAt: true,
  company: { select: { name: true } },
} satisfies Prisma.UserSelect;

type UserRow = Prisma.UserGetPayload<{ select: typeof USER_SELECT }>;

/** An agency is a company plus the account that owns it (873:48597). */
const AGENCY_SELECT = {
  id: true,
  name: true,
  organization: true,
  owner: { select: { id: true, fullName: true, phones: true, email: true } },
} satisfies Prisma.CompanySelect;

type AgencyRow = Prisma.CompanyGetPayload<{ select: typeof AGENCY_SELECT }>;

/** treva-broker's `Agency` — the tab's five columns, in order. */
function toAgency(row: AgencyRow) {
  return {
    id: row.id,
    name: row.name,
    managerName: row.owner.fullName,
    managerId: row.owner.id,
    phones: row.owner.phones,
    organization: row.organization,
    email: row.owner.email,
  };
}

/**
 * Blocked is an admin's switch; an account that has never signed in is still
 * "invited" — an agent created on this screen until they first log in.
 * Signing up signs the account in, so a registered user starts out active.
 */
function statusOf(
  row: Pick<UserRow, 'isActive' | 'lastLoginAt'>,
): UserStatusValue {
  if (!row.isActive) return 'blocked';
  return row.lastLoginAt ? 'active' : 'invited';
}

/** The account keeps one name; the Users screen edits it in two halves. */
function splitName(fullName: string) {
  const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
}

/**
 * treva-broker's `PlatformUser`. The password column is never filled: only a
 * hash is stored, so there is nothing to show — the screen masks the cell.
 */
function toPlatformUser(row: UserRow) {
  const agency = row.company?.name ?? '';

  return {
    id: row.id,
    ...splitName(row.fullName),
    email: row.email,
    phones: row.phones,
    password: '',
    role: row.role,
    organization: agency,
    jobTitle: row.jobTitle,
    cooperationType: row.cooperationType,
    agency,
    accessPermission: row.accessPermission,
    status: statusOf(row),
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Readable enough to dictate, long enough not to guess: 12 characters. */
function temporaryPassword() {
  return randomBytes(9).toString('base64url');
}

/**
 * The Admin Panel's Users screen (873:48476 / 873:48597): everyone with an
 * account — whoever signed up and whoever an admin added — and the real-estate
 * agencies that registered as companies.
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companies: CompaniesService,
  ) {}

  private async find(id: string) {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!row) throw new NotFoundException(USER_NOT_FOUND);
    return row;
  }

  async list(query: UserListQueryDto) {
    const page = query.page ?? 1;
    // Eight rows fill the artboard's table exactly.
    const perPage = query.perPage ?? 8;
    const search = query.search;

    const where: Prisma.UserWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { phones: { has: search } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        query.cooperationType
          ? {
              cooperationType: {
                equals: query.cooperationType,
                mode: 'insensitive',
              },
            }
          : {},
        query.status === 'blocked' ? { isActive: false } : {},
        query.status === 'active'
          ? { isActive: true, lastLoginAt: { not: null } }
          : {},
        query.status === 'invited' ? { isActive: true, lastLoginAt: null } : {},
      ],
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: rows.map(toPlatformUser),
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  /** Admins read anyone; everyone else only their own account (Profile). */
  async detail(actor: AuthUser, id: string) {
    this.assertSelfOrAdmin(actor, id);
    return toPlatformUser(await this.find(id));
  }

  /**
   * The row under the agent editor (873:48887): the agency the account belongs
   * to. "CRM Connection" is how many clients the agency's members hold.
   */
  async agencyLink(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        company: {
          select: {
            id: true,
            name: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException(USER_NOT_FOUND);
    if (!user.company) return null;

    const clients = await this.prisma.client.count({
      where: { broker: { companyId: user.company.id } },
    });
    const ageDays =
      (Date.now() - user.company.createdAt.getTime()) / 86_400_000;

    return {
      status: !user.company.isActive
        ? 'pending'
        : ageDays <= 30
          ? 'new'
          : 'active',
      marketingName: user.company.name,
      city: '',
      registrationDate: user.company.createdAt.toISOString(),
      crmConnection: String(clients),
    };
  }

  /**
   * An agent added by an admin.
   *
   * The admin may set the password, in which case that is what the agent signs
   * in with and nothing is handed back. Left blank, the account gets a
   * temporary one, returned this once for the admin to pass on; either way the
   * agent can change it on Profile.
   */
  async create(dto: CreateUserDto) {
    // `CreateUserDto` redeclares these as required, but class-validator
    // inherits `@IsOptional()` from `SaveUserDto` and skips every validator on
    // a property that arrives undefined — so the decorators only bite when the
    // key is present. The guard belongs here, where nothing can inherit past it.
    this.assertRequired(dto.email, 'A valid email is required', 'email_required');
    this.assertRequired(dto.firstName, 'Name is required', 'name_required');
    if (!dto.phones?.length) {
      throw new BadRequestException({
        message: 'Primary number is required',
        code: 'phone_required',
      });
    }

    const chosen = dto.password;
    const password = chosen || temporaryPassword();
    const companyId = await this.companyIdFor(dto.agency);

    try {
      const row = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: await bcrypt.hash(password, BCRYPT_ROUNDS),
          fullName: [dto.firstName, dto.lastName].filter(Boolean).join(' '),
          role: dto.role ?? 'broker',
          jobTitle: dto.jobTitle ?? '',
          phones: dto.phones ?? [],
          cooperationType: dto.cooperationType ?? '',
          accessPermission: dto.accessPermission ?? '',
          isActive: !dto.blocked,
          companyId,
          companyRole: companyId ? 'member' : null,
        },
        select: USER_SELECT,
      });

      const created = toPlatformUser(row);
      // Only a password the admin did not choose needs handing back.
      return chosen ? created : { ...created, temporaryPassword: password };
    } catch (error) {
      if (isUniqueViolation(error, 'email')) {
        throw new ConflictException(EMAIL_TAKEN);
      }
      throw error;
    }
  }

  /**
   * The agent editor for admins; for anyone else, Profile — which may only set
   * the account's own password.
   */
  async update(actor: AuthUser, id: string, dto: SaveUserDto) {
    this.assertSelfOrAdmin(actor, id);
    const existing = await this.find(id);
    const isAdmin = actor.role === 'admin';

    if (!isAdmin) {
      if (!dto.password) {
        throw new ForbiddenException({
          message: 'Only an admin can change these details',
          code: 'forbidden',
        });
      }
      await this.prisma.user.update({
        where: { id },
        data: { password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS) },
      });
      return toPlatformUser(await this.find(id));
    }

    if (
      actor.id === id &&
      (dto.blocked || (dto.role && dto.role !== 'admin'))
    ) {
      throw new BadRequestException({
        message: 'You cannot block or demote your own account',
        code: 'self_lockout',
      });
    }

    const name = splitName(existing.fullName);
    const firstName = dto.firstName ?? name.firstName;
    const lastName = dto.lastName ?? name.lastName;
    if (!firstName) {
      throw new BadRequestException({
        message: 'Name is required',
        code: 'name_required',
      });
    }

    const agencyChanged =
      dto.agency !== undefined && dto.agency !== (existing.company?.name ?? '');
    if (agencyChanged && existing.companyRole === 'owner') {
      throw new BadRequestException({
        message: "An agency's owner stays with their agency",
        code: 'owner_agency',
      });
    }
    const companyId = agencyChanged
      ? await this.companyIdFor(dto.agency)
      : undefined;

    try {
      const row = await this.prisma.user.update({
        where: { id },
        data: {
          fullName: [firstName, lastName].filter(Boolean).join(' '),
          email: dto.email || undefined,
          password: dto.password
            ? await bcrypt.hash(dto.password, BCRYPT_ROUNDS)
            : undefined,
          phones: dto.phones,
          jobTitle: dto.jobTitle,
          cooperationType: dto.cooperationType,
          accessPermission: dto.accessPermission,
          role: dto.role,
          isActive: dto.blocked === undefined ? undefined : !dto.blocked,
          ...(agencyChanged
            ? { companyId, companyRole: companyId ? 'member' : null }
            : {}),
        },
        select: USER_SELECT,
      });

      return toPlatformUser(row);
    } catch (error) {
      if (isUniqueViolation(error, 'email')) {
        throw new ConflictException(EMAIL_TAKEN);
      }
      throw error;
    }
  }

  /**
   * Removes an account that owns nothing. One that has written news, holds
   * clients, uploaded files, created projects or owns an agency is refused
   * rather than having that history deleted with it — block it instead.
   */
  async remove(actor: AuthUser, id: string) {
    if (actor.id === id) {
      throw new BadRequestException({
        message: 'You cannot delete your own account',
        code: 'self_lockout',
      });
    }

    const row = await this.prisma.user.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            newsPosts: true,
            clients: true,
            documents: true,
            projects: true,
            ownedCompanies: true,
          },
        },
      },
    });
    if (!row) throw new NotFoundException(USER_NOT_FOUND);

    if (Object.values(row._count).some((count) => count > 0)) {
      throw new ConflictException({
        message:
          'This user has records on the platform (clients, news, files, projects or an agency). Block the account instead.',
        code: 'user_has_records',
      });
    }

    await this.prisma.user.delete({ where: { id } });
  }

  /** The Real Estate Agencies tab: companies, and the account that owns each. */
  async agencies(query: AgencyListQueryDto) {
    const search = query.search;
    const rows = await this.prisma.company.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              {
                owner: { fullName: { contains: search, mode: 'insensitive' } },
              },
              { owner: { email: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : undefined,
      select: AGENCY_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return rows.map(toAgency);
  }

  /** One agency, for the editor to open on. */
  async agency(id: string) {
    const row = await this.prisma.company.findUnique({
      where: { id },
      select: AGENCY_SELECT,
    });
    if (!row) throw new NotFoundException(AGENCY_NOT_FOUND);
    return toAgency(row);
  }

  /**
   * The accounts the Manager field offers: everyone who belongs to no agency
   * yet. A member of another agency is left out on purpose — putting them in
   * charge here would quietly move them.
   */
  async managerOptions() {
    const rows = await this.prisma.user.findMany({
      where: { companyId: null, isActive: true },
      select: { id: true, fullName: true, email: true, phones: true },
      orderBy: [{ fullName: 'asc' }, { id: 'asc' }],
      take: 200,
    });

    return rows.map((row) => ({
      id: row.id,
      fullName: row.fullName,
      email: row.email,
      phones: row.phones,
    }));
  }

  /**
   * An agency added by an admin.
   *
   * `Company.ownerId` is required — an agency with no manager cannot be stored
   * — so one of two things happens. With a `managerId` the chosen account takes
   * charge and nothing new is created. Without one, the manager's name and email
   * become a fresh account, with the password the admin set or a temporary one
   * returned this once for them to pass on.
   */
  async createAgency(dto: CreateAgencyDto) {
    // Required here for the same reason as in `create` above.
    this.assertRequired(dto.name, 'Agency name is required', 'name_required');
    await this.companies.assertNameAvailable(dto.name);

    const existing = dto.managerId
      ? await this.assertAssignable(dto.managerId)
      : null;

    if (!existing && !dto.managerName) {
      throw new BadRequestException({
        message: "Choose a manager, or fill in the new manager's name",
        code: 'manager_required',
      });
    }
    if (!existing && !dto.email) {
      throw new BadRequestException({
        message: "The new manager's email is required",
        code: 'manager_email_required',
      });
    }

    // An existing account keeps the password it already has.
    const chosen = existing ? null : dto.password;
    const password = existing ? null : chosen || temporaryPassword();

    try {
      const company = await this.prisma.$transaction(async (tx) => {
        const ownerId = existing
          ? await this.promoteToOwner(tx, existing.id, dto.phones)
          : (
              await tx.user.create({
                data: {
                  email: dto.email!,
                  password: await bcrypt.hash(password!, BCRYPT_ROUNDS),
                  fullName: dto.managerName!,
                  role: 'top_broker',
                  jobTitle: 'Company Owner',
                  phones: dto.phones ?? [],
                  accountType: 'company',
                },
                select: { id: true },
              })
            ).id;

        const created = await this.companies.createWithOwner(
          tx,
          ownerId,
          dto.name,
        );

        return tx.company.update({
          where: { id: created.id },
          data: { organization: dto.organization ?? '' },
          select: AGENCY_SELECT,
        });
      });

      const agency = toAgency(company);
      // Only a generated password needs handing over: an admin who typed one
      // already knows it, and an existing account kept its own.
      return password && !chosen
        ? { ...agency, temporaryPassword: password }
        : agency;
    } catch (error) {
      if (isUniqueViolation(error, 'email')) {
        throw new ConflictException(EMAIL_TAKEN);
      }
      if (isUniqueViolation(error, 'slug')) {
        throw new ConflictException(COMPANY_NAME_TAKEN);
      }
      throw error;
    }
  }

  /**
   * The agency editor. Name and Organization are the company's own; Manager,
   * Contacts and E-Mail belong to the account that owns it, so they are written
   * there — renaming a manager here renames the same person on the User tab.
   */
  async updateAgency(id: string, dto: SaveAgencyDto) {
    const existing = await this.prisma.company.findUnique({
      where: { id },
      select: { id: true, name: true, ownerId: true },
    });
    if (!existing) throw new NotFoundException(AGENCY_NOT_FOUND);

    const renamed = dto.name !== undefined && dto.name !== existing.name;
    if (renamed && !dto.name) {
      throw new BadRequestException({
        message: 'Agency name is required',
        code: 'name_required',
      });
    }
    if (renamed) await this.companies.assertNameAvailable(dto.name!);

    const handover =
      dto.managerId !== undefined && dto.managerId !== existing.ownerId;
    if (handover) await this.assertAssignable(dto.managerId!);

    try {
      const company = await this.prisma.$transaction(async (tx) => {
        // A different manager: the incoming account takes charge and the
        // outgoing one stays on as an ordinary member rather than being cut
        // loose from the agency it used to run.
        if (handover) {
          await this.promoteToOwner(tx, dto.managerId!, dto.phones);
          await tx.user.update({
            where: { id: dto.managerId! },
            data: { companyId: id, companyRole: 'owner' },
          });
          await tx.user.update({
            where: { id: existing.ownerId },
            data: { companyRole: 'member' },
          });
          await tx.company.update({
            where: { id },
            data: { ownerId: dto.managerId! },
          });
        } else if (
          dto.managerName !== undefined ||
          dto.phones !== undefined ||
          dto.email !== undefined
        ) {
          await tx.user.update({
            where: { id: existing.ownerId },
            data: {
              fullName: dto.managerName || undefined,
              phones: dto.phones,
              email: dto.email || undefined,
            },
          });
        }

        return tx.company.update({
          where: { id },
          data: {
            name: renamed ? dto.name : undefined,
            slug: renamed ? this.companies.slugFor(dto.name!) : undefined,
            organization: dto.organization,
          },
          select: AGENCY_SELECT,
        });
      });

      return toAgency(company);
    } catch (error) {
      if (isUniqueViolation(error, 'email')) {
        throw new ConflictException(EMAIL_TAKEN);
      }
      if (isUniqueViolation(error, 'slug')) {
        throw new ConflictException(COMPANY_NAME_TAKEN);
      }
      throw error;
    }
  }

  /**
   * Deletes an agency. Its members stay as individual accounts (the relation
   * nulls out); the owner keeps their role, which an admin can change.
   */
  async removeAgency(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });
    if (!company) throw new NotFoundException(AGENCY_NOT_FOUND);

    await this.prisma.$transaction([
      this.prisma.user.updateMany({
        where: { companyId: id },
        data: { companyId: null, companyRole: null },
      }),
      this.prisma.company.delete({ where: { id } }),
    ]);
  }

  /**
   * An account may only be put in charge of an agency while it belongs to none
   * — the same rule `managerOptions` filters the list by, enforced here because
   * the list is a snapshot and the form is not.
   */
  private async assertAssignable(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, companyId: true },
    });
    if (!user) throw new NotFoundException(USER_NOT_FOUND);

    if (user.companyId) {
      throw new ConflictException({
        message: 'That account already belongs to an agency',
        code: 'manager_taken',
      });
    }

    return user;
  }

  /**
   * Makes an existing account an agency's owner, keeping its numbers current.
   *
   * Running an agency is what `top_broker` means, so a plain broker is raised to
   * it — but an admin is left alone: taking charge of an agency is not a reason
   * to strip someone of the platform, and the role field on the User tab is
   * where a demotion belongs.
   */
  private async promoteToOwner(
    tx: Prisma.TransactionClient,
    id: string,
    phones: string[] | undefined,
  ) {
    const current = await tx.user.findUniqueOrThrow({
      where: { id },
      select: { role: true },
    });

    await tx.user.update({
      where: { id },
      data: {
        role: current.role === 'broker' ? 'top_broker' : undefined,
        jobTitle: 'Company Owner',
        accountType: 'company',
        phones,
      },
    });

    return id;
  }

  /** A field the create DTO calls required, enforced past decorator inheritance. */
  private assertRequired(
    value: string | undefined,
    message: string,
    code: string,
  ): asserts value is string {
    if (!value) throw new BadRequestException({ message, code });
  }

  private assertSelfOrAdmin(actor: AuthUser, id: string) {
    if (actor.role !== 'admin' && actor.id !== id) {
      throw new ForbiddenException({
        message: 'You can only open your own account',
        code: 'forbidden',
      });
    }
  }

  /** The form names an agency by its name; empty detaches the account. */
  private async companyIdFor(name: string | undefined) {
    if (!name) return null;

    const company = await this.prisma.company.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    });
    if (!company) {
      throw new BadRequestException({
        message: `No real estate agency is called "${name}"`,
        code: 'agency_not_found',
      });
    }
    return company.id;
  }
}

function isUniqueViolation(error: unknown, field: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    JSON.stringify(error.meta ?? {}).includes(field)
  );
}

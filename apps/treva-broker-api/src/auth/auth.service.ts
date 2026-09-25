import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../generated/prisma/client';
import {
  COMPANY_NAME_TAKEN,
  CompaniesService,
} from '../companies/companies.service';
import { BitrixSyncService } from '../bitrix/bitrix-sync.service';
import { USER_PHONE_TAKEN, userPhoneTaken } from '../common/phone';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './jwt.strategy';

const BCRYPT_ROUNDS = 10;

const INVALID_CREDENTIALS = {
  message: 'Email or password is incorrect',
  code: 'invalid_credentials',
} as const;

const EMAIL_TAKEN = {
  message: 'That address is already registered',
  code: 'email_taken',
} as const;

const ACCOUNT_DISABLED = {
  message: 'This account has been deactivated',
  code: 'account_disabled',
} as const;

// Compared against when the address is unknown, so a miss costs the same
// bcrypt round as a wrong password and response time does not reveal which
// addresses have accounts.
const DUMMY_HASH = bcrypt.hashSync(
  'treva-broker-dummy-password',
  BCRYPT_ROUNDS,
);

const SESSION_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  avatarUrl: true,
  jobTitle: true,
  isActive: true,
  companyId: true,
  companyRole: true,
  company: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

type SessionUserRow = Prisma.UserGetPayload<{
  select: typeof SESSION_USER_SELECT;
}>;

/**
 * The response shape treva-broker stores as its session — see `Session` in
 * apps/treva-broker/src/types/auth.ts. Change both together.
 */
export interface SessionResponse {
  user: ReturnType<typeof toSessionUser>;
  accessToken: string;
  expiresAt: string;
}

function toSessionUser(user: SessionUserRow) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    // A company is the broker CRM's team: everyone in it shares one teamId.
    teamId: user.companyId,
    jobTitle: user.jobTitle,
    company:
      user.company && user.companyRole
        ? {
            id: user.company.id,
            name: user.company.name,
            role: user.companyRole,
          }
        : null,
  };
}

/** "leyla.hasanova" -> "Leyla Hasanova", until a profile step asks for a name. */
function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return name || email;
}

function isUniqueViolation(error: unknown, field: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    JSON.stringify(error.meta ?? {}).includes(field)
  );
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly companiesService: CompaniesService,
    private readonly bitrixSync: BitrixSyncService,
  ) {}

  async login({ email, password }: LoginDto): Promise<SessionResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { ...SESSION_USER_SELECT, password: true },
    });

    const passwordMatches = await bcrypt.compare(
      password,
      user?.password ?? DUMMY_HASH,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(ACCOUNT_DISABLED);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Brokers from before the Bitrix integration (or whose sync failed) get
    // their Bitrix contact now; a no-op for everyone already there. Not
    // awaited — signing in never waits on Bitrix.
    void this.bitrixSync.syncBroker(user.id);

    return this.issueSession(user);
  }

  /**
   * Creates an account and signs it in.
   *
   * Sign-up never grants `admin` — that account is seeded. An individual is a
   * plain broker; creating a company makes the user its owner and a top broker,
   * with the company as their team.
   */
  async register(dto: RegisterDto): Promise<SessionResponse> {
    const isCompany = dto.type === 'company';
    const companyName = isCompany ? (dto.companyName ?? '') : null;

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(EMAIL_TAKEN);
    }

    if (await userPhoneTaken(this.prisma, [dto.phone])) {
      throw new ConflictException(USER_PHONE_TAKEN);
    }

    if (companyName) {
      await this.companiesService.assertNameAvailable(companyName);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email: dto.email,
            password: passwordHash,
            fullName:
              [dto.firstName, dto.lastName].filter(Boolean).join(' ') ||
              dto.fullName ||
              nameFromEmail(dto.email),
            accountType: dto.type,
            role: isCompany ? 'top_broker' : 'broker',
            jobTitle: isCompany ? 'Company Owner' : 'Broker',
            phones: [dto.phone],
            // Signing up signs the account in, so it has logged in once.
            lastLoginAt: new Date(),
          },
          select: { id: true },
        });

        if (companyName) {
          await this.companiesService.createWithOwner(
            tx,
            created.id,
            companyName,
          );
        }

        return tx.user.findUniqueOrThrow({
          where: { id: created.id },
          select: SESSION_USER_SELECT,
        });
      });

      // Every broker is in Bitrix from the start, client or no client.
      void this.bitrixSync.syncBroker(user.id);

      return this.issueSession(user);
    } catch (error) {
      // The checks above cannot rule out a concurrent sign-up with the same
      // address or company name; the unique indexes catch what they miss.
      if (isUniqueViolation(error, 'email')) {
        throw new ConflictException(EMAIL_TAKEN);
      }
      if (isUniqueViolation(error, 'slug')) {
        throw new ConflictException(COMPANY_NAME_TAKEN);
      }
      throw error;
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: SESSION_USER_SELECT,
    });

    if (!user) {
      throw new UnauthorizedException('Account not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(ACCOUNT_DISABLED);
    }

    return toSessionUser(user);
  }

  private issueSession(user: SessionUserRow): SessionResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const { exp } = this.jwtService.decode<{ exp: number }>(accessToken);

    return {
      user: toSessionUser(user),
      accessToken,
      expiresAt: new Date(exp * 1000).toISOString(),
    };
  }
}

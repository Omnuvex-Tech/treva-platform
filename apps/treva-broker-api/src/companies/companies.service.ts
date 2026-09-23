import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from './slugify';

export const COMPANY_NAME_TAKEN = {
  message: 'A company with this name already exists',
  code: 'company_name_taken',
} as const;

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  /** The unique key a company name is stored and compared under. */
  slugFor(name: string): string {
    return slugify(name) || `company-${randomUUID().slice(0, 8)}`;
  }

  async assertNameAvailable(name: string): Promise<void> {
    const existing = await this.prisma.company.findUnique({
      where: { slug: this.slugFor(name) },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(COMPANY_NAME_TAKEN);
    }
  }

  /**
   * Creates a company and makes `ownerId` its owner and first member.
   *
   * Runs inside the caller's transaction so a user is never left half-signed-up
   * — an account with no company, or a company with no owner.
   */
  async createWithOwner(
    tx: Prisma.TransactionClient,
    ownerId: string,
    name: string,
  ) {
    const company = await tx.company.create({
      data: { name, slug: this.slugFor(name), ownerId },
    });

    await tx.user.update({
      where: { id: ownerId },
      data: { companyId: company.id, companyRole: 'owner' },
    });

    return company;
  }

  async findForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        companyRole: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            owner: { select: { id: true, fullName: true, email: true } },
            _count: { select: { members: true } },
          },
        },
      },
    });

    if (!user?.company) {
      throw new NotFoundException('You are not a member of a company');
    }

    const { _count, ...company } = user.company;

    return {
      ...company,
      membersCount: _count.members,
      role: user.companyRole,
    };
  }
}

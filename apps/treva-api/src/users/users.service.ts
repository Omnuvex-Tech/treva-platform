import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, SectionPermissionDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  PERMISSION_CATALOG,
  ROLE_USER,
  isMenuKeyInSection,
  isPermissionSection,
} from './permissions.constants';

type PermissionRow = { section: string; menuKey: string };

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  permissions: { select: { section: true, menuKey: true } },
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getCatalog() {
    return PERMISSION_CATALOG;
  }

  async findAll() {
    const users = await this.prisma.admin.findMany({
      where: { role: ROLE_USER },
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.serialize(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.admin.findFirst({
      where: { id, role: ROLE_USER },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.serialize(user);
  }

  async create(dto: CreateUserDto) {
    const permissions = this.flattenPermissions(dto.permissions ?? []);

    try {
      const user = await this.prisma.admin.create({
        data: {
          email: dto.email,
          password: await bcrypt.hash(dto.password, 10),
          name: dto.name ?? null,
          role: ROLE_USER,
          isActive: dto.isActive ?? true,
          permissions: { create: permissions },
        },
        select: userSelect,
      });

      return this.serialize(user);
    } catch (error) {
      throw this.mapUniqueEmailError(error);
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const permissions = dto.permissions
      ? this.flattenPermissions(dto.permissions)
      : null;

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        if (permissions) {
          await tx.adminPermission.deleteMany({ where: { adminId: id } });
        }

        return tx.admin.update({
          where: { id },
          data: {
            ...(dto.email !== undefined && { email: dto.email }),
            ...(dto.name !== undefined && { name: dto.name ?? null }),
            ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            ...(dto.password !== undefined && {
              password: await bcrypt.hash(dto.password, 10),
            }),
            ...(permissions && { permissions: { create: permissions } }),
          },
          select: userSelect,
        });
      });

      return this.serialize(user);
    } catch (error) {
      throw this.mapUniqueEmailError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.admin.delete({ where: { id } });

    return { id };
  }

  /**
   * Turns the section-grouped payload the UI sends into flat rows, rejecting
   * any section or menu key that is not part of the sidebar catalog.
   */
  private flattenPermissions(
    sections: SectionPermissionDto[],
  ): PermissionRow[] {
    const rows: PermissionRow[] = [];

    for (const entry of sections) {
      if (!isPermissionSection(entry.section)) {
        throw new BadRequestException(`Unknown section: ${entry.section}`);
      }

      for (const menuKey of entry.menuKeys) {
        if (!isMenuKeyInSection(entry.section, menuKey)) {
          throw new BadRequestException(
            `Unknown menu "${menuKey}" for section "${entry.section}"`,
          );
        }

        rows.push({ section: entry.section, menuKey });
      }
    }

    return rows;
  }

  private serialize(user: {
    permissions: PermissionRow[];
    [key: string]: unknown;
  }) {
    const grouped = new Map<string, string[]>();

    for (const { section, menuKey } of user.permissions) {
      const existing = grouped.get(section);
      if (existing) existing.push(menuKey);
      else grouped.set(section, [menuKey]);
    }

    return {
      ...user,
      permissions: [...grouped.entries()].map(([section, menuKeys]) => ({
        section,
        menuKeys,
      })),
    };
  }

  private mapUniqueEmailError(error: unknown) {
    const code = (error as { code?: string }).code;

    if (code === 'P2002') {
      return new ConflictException('A user with this email already exists');
    }

    return error;
  }
}

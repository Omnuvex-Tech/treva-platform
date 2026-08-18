import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

type PermissionRow = { section: string; menuKey: string };

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const admin = await this.prisma.admin.findUnique({
      where: { email },
      include: { permissions: { select: { section: true, menuKey: true } } },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    const payload = { sub: admin.id, email: admin.email, role: admin.role };

    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: this.groupPermissions(admin.permissions),
      },
    };
  }

  async getProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        permissions: { select: { section: true, menuKey: true } },
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    return {
      ...admin,
      permissions: this.groupPermissions(admin.permissions),
    };
  }

  private groupPermissions(permissions: PermissionRow[]) {
    const grouped = new Map<string, string[]>();

    for (const { section, menuKey } of permissions) {
      const existing = grouped.get(section);
      if (existing) existing.push(menuKey);
      else grouped.set(section, [menuKey]);
    }

    return [...grouped.entries()].map(([section, menuKeys]) => ({
      section,
      menuKeys,
    }));
  }
}

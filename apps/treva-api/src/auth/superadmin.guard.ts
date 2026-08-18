import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ROLE_SUPERADMIN } from '../users/permissions.constants';

/**
 * Reads the role straight from the database rather than trusting the JWT, so a
 * demoted or deactivated account loses access immediately instead of when its
 * token expires. Must run after JwtAuthGuard has populated `request.user`.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { id?: string } }>();
    const adminId = request.user?.id;

    if (!adminId) {
      throw new ForbiddenException('Superadmin access required');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { role: true, isActive: true },
    });

    if (!admin?.isActive || admin.role !== ROLE_SUPERADMIN) {
      throw new ForbiddenException('Superadmin access required');
    }

    return true;
  }
}

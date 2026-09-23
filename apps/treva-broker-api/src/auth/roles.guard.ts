import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '../generated/prisma/client';
import type { AuthUser } from './jwt.strategy';

const ROLES_KEY = 'roles';

/**
 * Limits a handler to the given roles. Goes after `JwtAuthGuard`, which is what
 * puts `req.user` there:
 *
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('admin')
 *
 * Mirrors treva-broker's permission matrix (src/lib/auth/permissions.ts) —
 * change both together.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles?.length) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();

    if (!user || !roles.includes(user.role as UserRole)) {
      throw new ForbiddenException('You do not have permission to do this');
    }

    return true;
  }
}

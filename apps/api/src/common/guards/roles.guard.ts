import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../decorators/current-user.decorator';

/**
 * Role-based access control. Routes annotated with `@Roles(...)` are restricted
 * to those roles. SUPER_ADMIN and OWNER always pass (they are tenant-wide
 * administrators).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const role = user.role as UserRole;
    if (role === UserRole.SUPER_ADMIN || role === UserRole.OWNER) {
      return true;
    }

    if (!required.includes(role)) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
    return true;
  }
}

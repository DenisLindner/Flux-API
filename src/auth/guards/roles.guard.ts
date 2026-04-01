/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/generated/prisma/enums';
import { ROLES_KEY } from '../decorators/role.decorator';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const role = request['user'].role;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const contains = roles.includes(role);

    if (!contains) {
      throw new ForbiddenException('Permission not granted');
    }

    return true;
  }
}

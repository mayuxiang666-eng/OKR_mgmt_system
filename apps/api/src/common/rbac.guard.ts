import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private allowedRoles: string[] = []) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user || { role: 'member', orgId: request.headers['x-org-id'] };
    if (this.allowedRoles.length === 0) return true;
    if (this.allowedRoles.includes(user.role)) return true;
    throw new ForbiddenException('Insufficient role');
  }
}

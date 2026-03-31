import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user?.clinicId) {
      throw new ForbiddenException('Clínica não identificada')
    }

    request.clinicId = user.clinicId
    return true
  }
}

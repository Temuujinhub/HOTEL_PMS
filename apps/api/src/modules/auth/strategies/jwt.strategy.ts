import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../../../common/decorators/current-user.decorator';
import { TenantContextService } from '../../../common/tenancy/tenant-context.service';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
  propertyId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly tenantContext: TenantContextService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret') as string,
    });
  }

  /**
   * Runs for every authenticated request. Besides resolving the principal, it
   * binds the tenant context so the Prisma tenant-guard can isolate queries.
   */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user: AuthUser = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
      email: payload.email,
      propertyId: payload.propertyId,
    };
    this.tenantContext.set({
      tenantId: user.tenantId,
      userId: user.userId,
      role: user.role,
      propertyId: user.propertyId,
    });
    return user;
  }
}

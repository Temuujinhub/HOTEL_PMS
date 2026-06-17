import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PlanTier, SubscriptionStatus, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { generateCode, slugify } from '../../common/utils/ids';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const PLAN_ROOM_LIMITS: Record<PlanTier, number> = {
  STARTER: 30,
  PROFESSIONAL: 100,
  ENTERPRISE: 100000,
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Self-service tenant onboarding: provisions a new business (tenant), a
   * trial subscription, an owner account and an initial property — all in one
   * transaction.
   */
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const baseSlug = slugify(dto.companyName) || 'tenant';
    const slug = await this.uniqueSlug(baseSlug);
    const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName,
          slug,
          contactEmail: dto.email.toLowerCase(),
          country: (dto.country || 'US').toUpperCase().slice(0, 2),
          currency: (dto.currency || 'USD').toUpperCase().slice(0, 3),
          subscription: {
            create: {
              tier: PlanTier.STARTER,
              status: SubscriptionStatus.TRIALING,
              roomLimit: PLAN_ROOM_LIMITS.STARTER,
              trialEndsAt: trialEnds,
            },
          },
        },
      });

      const property = await tx.property.create({
        data: {
          tenantId: tenant.id,
          name: dto.propertyName,
          code: 'MAIN',
          country: tenant.country,
          currency: tenant.currency,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          propertyId: property.id,
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: UserRole.OWNER,
        },
      });

      return { tenant, property, user };
    });

    const tokens = await this.issueTokens(result.user);
    return { ...tokens, user: this.toPublicUser(result.user), tenant: { id: result.tenant.id, name: result.tenant.name, slug: result.tenant.slug } };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    let user: User | null = null;

    if (dto.tenantSlug) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug: dto.tenantSlug },
      });
      if (tenant) {
        user = await this.prisma.user.findFirst({
          where: { tenantId: tenant.id, email },
        });
      }
    } else {
      const matches = await this.prisma.user.findMany({ where: { email } });
      if (matches.length > 1) {
        throw new BadRequestException(
          'This email is registered with multiple businesses. Please provide tenantSlug.',
        );
      }
      user = matches[0] ?? null;
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.toPublicUser(user) };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; tenantId: string; jti: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const key = this.refreshKey(payload.sub, payload.jti);
    if (!(await this.redis.exists(key))) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    // Rotate: invalidate the used token.
    await this.redis.del(key);

    const user = await this.prisma.user.findFirst({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer active');
    }
    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.toPublicUser(user) };
  }

  async logout(userId: string, refreshToken?: string): Promise<{ success: boolean }> {
    if (refreshToken) {
      try {
        const payload = this.jwt.decode(refreshToken) as { sub: string; jti: string };
        if (payload?.sub && payload?.jti) {
          await this.redis.del(this.refreshKey(payload.sub, payload.jti));
        }
      } catch {
        /* ignore malformed token on logout */
      }
    } else {
      const keys = await this.redis.raw.keys(this.refreshKey(userId, '*'));
      if (keys.length) await this.redis.raw.del(...keys);
    }
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: {
        tenant: {
          select: { id: true, name: true, slug: true, currency: true, subscription: true },
        },
        property: { select: { id: true, name: true, currency: true, taxRate: true } },
      },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash: _ph, ...rest } = user;
    return rest;
  }

  // --- helpers -------------------------------------------------------------

  private async issueTokens(user: User) {
    const jti = randomUUID();
    const accessTtl = this.config.get<number>('jwt.accessTtl') as number;
    const refreshTtl = this.config.get<number>('jwt.refreshTtl') as number;

    const accessPayload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      propertyId: user.propertyId ?? undefined,
    };

    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: accessTtl,
    });
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, tenantId: user.tenantId, jti },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: refreshTtl,
      },
    );

    await this.redis.set(this.refreshKey(user.id, jti), '1', refreshTtl);

    return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: accessTtl };
  }

  private refreshKey(userId: string, jti: string): string {
    return `refresh:${userId}:${jti}`;
  }

  private toPublicUser(user: User) {
    const { passwordHash: _ph, ...rest } = user;
    return rest;
  }

  private async uniqueSlug(base: string): Promise<string> {
    let candidate = base;
    let n = 1;
    while (await this.prisma.tenant.findUnique({ where: { slug: candidate } })) {
      candidate = `${base}-${generateCode('', 4).toLowerCase()}`;
      if (n++ > 5) break;
    }
    return candidate;
  }
}

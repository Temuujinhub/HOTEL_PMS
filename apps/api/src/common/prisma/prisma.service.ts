import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../tenancy/tenant-context.service';
import { tenantGuardExtension } from './tenant.extension';

function buildScopedClient(base: PrismaClient, getTenantId: () => string | undefined) {
  return base.$extends(tenantGuardExtension(getTenantId));
}

/** The tenant-scoped Prisma client type (after `$extends`). */
export type ScopedPrismaClient = ReturnType<typeof buildScopedClient>;

/**
 * PrismaService is the raw, un-scoped client (used by auth/bootstrap flows that
 * operate across or before a tenant exists). `service.scoped` returns a client
 * that automatically constrains every query to the current request's tenant.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private scopedClient?: ScopedPrismaClient;

  constructor(private readonly tenantContext: TenantContextService) {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Connected to PostgreSQL');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Tenant-isolated client. The extension reads the tenant id lazily at query
   * execution time, so building it once is correct for all requests.
   */
  get scoped(): ScopedPrismaClient {
    if (!this.scopedClient) {
      this.scopedClient = buildScopedClient(this, () => this.tenantContext.tenantId);
    }
    return this.scopedClient;
  }
}

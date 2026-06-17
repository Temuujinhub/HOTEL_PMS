import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

export interface TenantContextData {
  tenantId: string;
  userId: string;
  role: string;
  propertyId?: string;
}

const KEY = 'tenantContext';

/**
 * Request-scoped holder of the authenticated principal's tenancy information.
 * Backed by AsyncLocalStorage (nestjs-cls) so it is available everywhere in the
 * request lifecycle — including inside the Prisma tenant-guard extension —
 * without threading it through every function call.
 */
@Injectable()
export class TenantContextService {
  constructor(private readonly cls: ClsService) {}

  set(data: TenantContextData): void {
    this.cls.set(KEY, data);
  }

  get(): TenantContextData | undefined {
    return this.cls.get(KEY);
  }

  get tenantId(): string | undefined {
    return this.get()?.tenantId;
  }

  get userId(): string | undefined {
    return this.get()?.userId;
  }

  get role(): string | undefined {
    return this.get()?.role;
  }

  get propertyId(): string | undefined {
    return this.get()?.propertyId;
  }

  /** Throws if no tenant is bound — use in code paths that require a tenant. */
  requireTenantId(): string {
    const id = this.tenantId;
    if (!id) {
      throw new Error('No tenant bound to the current request context');
    }
    return id;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContextService } from '../../common/tenancy/tenant-context.service';
import { UpdateTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * The Tenant model is NOT auto-scoped by the Prisma extension, so every
   * query here is explicitly constrained to the current request's tenant.
   */
  async getCurrent() {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: this.tenantContext.requireTenantId() },
      include: {
        subscription: true,
        _count: { select: { properties: true, users: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateCurrent(dto: UpdateTenantDto) {
    const id = this.tenantContext.requireTenantId();
    return this.prisma.tenant.update({ where: { id }, data: { ...dto } });
  }

  getSubscription() {
    return this.prisma.subscription.findFirst({
      where: { tenantId: this.tenantContext.requireTenantId() },
    });
  }
}

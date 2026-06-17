import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContextService } from '../../common/tenancy/tenant-context.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  findAll() {
    return this.prisma.scoped.property.findMany({
      orderBy: { name: 'asc' },
    });
  }

  create(dto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: { ...dto, tenantId: this.tenantContext.requireTenantId() },
    });
  }

  async getOne(id: string) {
    const property = await this.prisma.scoped.property.findFirst({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async update(id: string, dto: UpdatePropertyDto) {
    await this.getOne(id);
    return this.prisma.property.update({ where: { id }, data: { ...dto } });
  }

  /** Soft-delete: mark the property inactive rather than removing the row. */
  async remove(id: string) {
    await this.getOne(id);
    await this.prisma.property.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }
}

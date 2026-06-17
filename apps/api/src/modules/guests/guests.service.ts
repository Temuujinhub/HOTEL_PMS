import { Injectable, NotFoundException } from '@nestjs/common';
import { Guest, Prisma } from '@prisma/client';
import { CryptoService } from '../../common/crypto/crypto.service';
import { PaginationQueryDto, paginate } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContextService } from '../../common/tenancy/tenant-context.service';
import { CreateGuestDto, UpdateGuestDto } from './dto/guest.dto';

@Injectable()
export class GuestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const where: Prisma.GuestWhereInput = {};
    if (query.search) {
      const term = query.search;
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.scoped.guest.findMany({
        where,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.scoped.guest.count({ where }),
    ]);

    const data = rows.map((g) => this.toListItem(g));
    return paginate(data, total, query.page, query.limit);
  }

  create(dto: CreateGuestDto) {
    const { passportNo, preferences, dateOfBirth, ...rest } = dto;
    return this.prisma.guest.create({
      data: {
        ...rest,
        tenantId: this.tenantContext.requireTenantId(),
        passportNo: this.crypto.encrypt(passportNo),
        preferences: preferences
          ? (preferences as Prisma.InputJsonValue)
          : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
    });
  }

  async getOne(id: string) {
    const guest = await this.prisma.scoped.guest.findFirst({
      where: { id },
      include: {
        reservations: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!guest) throw new NotFoundException('Guest not found');
    return this.toDetail(guest);
  }

  async update(id: string, dto: UpdateGuestDto) {
    await this.assertExists(id);
    const { passportNo, preferences, dateOfBirth, ...rest } = dto;
    const data: Prisma.GuestUncheckedUpdateInput = { ...rest };
    if (passportNo !== undefined) {
      data.passportNo = this.crypto.encrypt(passportNo);
    }
    if (preferences !== undefined) {
      data.preferences = preferences as Prisma.InputJsonValue;
    }
    if (dateOfBirth !== undefined) {
      data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    return this.prisma.guest.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.assertExists(id);
    await this.prisma.guest.delete({ where: { id } });
    return { success: true };
  }

  // --- helpers -------------------------------------------------------------

  private async assertExists(id: string) {
    const guest = await this.prisma.scoped.guest.findFirst({ where: { id } });
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  /** List shape: never expose the passport at all. */
  private toListItem(guest: Guest) {
    const { passportNo: _pn, ...rest } = guest;
    return rest;
  }

  /** Detail shape: replace the encrypted blob with a masked value. */
  private toDetail<T extends Guest>(guest: T) {
    const { passportNo, ...rest } = guest;
    const decrypted = this.crypto.decrypt(passportNo);
    return { ...rest, passportNoMasked: this.crypto.mask(decrypted) };
  }
}

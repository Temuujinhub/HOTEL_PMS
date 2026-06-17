import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContextService } from '../../common/tenancy/tenant-context.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll() {
    const users = await this.prisma.scoped.user.findMany({
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    return users.map((u) => this.toPublic(u));
  }

  async create(dto: CreateUserDto) {
    const { password, ...rest } = dto;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        ...rest,
        tenantId: this.tenantContext.requireTenantId(),
        email: dto.email.toLowerCase(),
        passwordHash,
      },
    });
    return this.toPublic(user);
  }

  async getOne(id: string) {
    const user = await this.prisma.scoped.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getOnePublic(id: string) {
    return this.toPublic(await this.getOne(id));
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.getOne(id);
    const { password, email, ...rest } = dto;
    const data: Prisma.UserUncheckedUpdateInput = { ...rest };
    if (email !== undefined) data.email = email.toLowerCase();
    if (password) data.passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.update({ where: { id }, data });
    return this.toPublic(user);
  }

  async deactivate(id: string) {
    await this.getOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return this.toPublic(user);
  }

  /** Strips the password hash so it is never returned to clients. */
  private toPublic(user: User) {
    const { passwordHash: _ph, ...rest } = user;
    return rest;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContextService } from '../../common/tenancy/tenant-context.service';
import {
  CreateRoomDto,
  CreateRoomTypeDto,
  RoomQueryDto,
  UpdateRoomDto,
  UpdateRoomStatusDto,
  UpdateRoomTypeDto,
} from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  // --- Room types ----------------------------------------------------------

  createRoomType(dto: CreateRoomTypeDto) {
    const { amenities, ...rest } = dto;
    return this.prisma.roomType.create({
      data: {
        ...rest,
        tenantId: this.tenantContext.requireTenantId(),
        amenities: amenities ? (amenities as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  findRoomTypes(propertyId?: string) {
    return this.prisma.scoped.roomType.findMany({
      where: propertyId ? { propertyId } : {},
      orderBy: { name: 'asc' },
      include: { _count: { select: { rooms: true } } },
    });
  }

  async getRoomType(id: string) {
    const rt = await this.prisma.scoped.roomType.findFirst({ where: { id } });
    if (!rt) throw new NotFoundException('Room type not found');
    return rt;
  }

  async updateRoomType(id: string, dto: UpdateRoomTypeDto) {
    await this.getRoomType(id);
    const { amenities, ...rest } = dto;
    return this.prisma.roomType.update({
      where: { id },
      data: {
        ...rest,
        amenities: amenities ? (amenities as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async removeRoomType(id: string) {
    await this.getRoomType(id);
    await this.prisma.roomType.delete({ where: { id } });
    return { success: true };
  }

  // --- Rooms ---------------------------------------------------------------

  createRoom(dto: CreateRoomDto) {
    const { features, ...rest } = dto;
    return this.prisma.room.create({
      data: {
        ...rest,
        tenantId: this.tenantContext.requireTenantId(),
        features: features ? (features as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  findRooms(query: RoomQueryDto) {
    const where: Prisma.RoomWhereInput = {};
    if (query.propertyId) where.propertyId = query.propertyId;
    if (query.status) where.status = query.status;
    if (query.floor !== undefined) where.floor = query.floor;
    return this.prisma.scoped.room.findMany({
      where,
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
      include: { roomType: { select: { id: true, name: true, code: true } } },
    });
  }

  async getRoom(id: string) {
    const room = await this.prisma.scoped.room.findFirst({
      where: { id },
      include: { roomType: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async updateRoom(id: string, dto: UpdateRoomDto) {
    await this.getRoom(id);
    const { features, ...rest } = dto;
    return this.prisma.room.update({
      where: { id },
      data: {
        ...rest,
        features: features ? (features as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateRoomStatusDto) {
    await this.getRoom(id);
    return this.prisma.room.update({ where: { id }, data: { status: dto.status } });
  }

  async removeRoom(id: string) {
    await this.getRoom(id);
    await this.prisma.room.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Room rack: every room with its current status plus today's arrival /
   * in-house reservation, for the front-desk visual grid.
   */
  async roomRack(propertyId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const rooms = await this.prisma.scoped.room.findMany({
      where: { propertyId },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
      include: {
        roomType: { select: { id: true, name: true, code: true } },
        reservations: {
          where: {
            status: { in: ['CHECKED_IN', 'CONFIRMED'] },
            checkInDate: { lte: today },
            checkOutDate: { gte: today },
          },
          select: {
            id: true,
            status: true,
            confirmationNo: true,
            checkOutDate: true,
            guest: { select: { firstName: true, lastName: true, vipLevel: true } },
          },
          take: 1,
        },
      },
    });

    return rooms.map((r) => ({
      ...r,
      currentReservation: r.reservations[0] ?? null,
      reservations: undefined,
    }));
  }
}

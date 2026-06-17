import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReservationStatus, RoomStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContextService } from '../../common/tenancy/tenant-context.service';
import { generateCode } from '../../common/utils/ids';
import { paginate } from '../../common/dto/pagination.dto';
import {
  AvailabilityQueryDto,
  CancelReservationDto,
  CheckInDto,
  CreateReservationDto,
  ReservationQueryDto,
  UpdateReservationDto,
} from './dto/reservation.dto';

const BLOCKING_STATUSES: ReservationStatus[] = [
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
];

const CHECKIN_ALLOWED_STATUSES: ReservationStatus[] = [
  ReservationStatus.CONFIRMED,
  ReservationStatus.PENDING,
];

const DETAIL_INCLUDE = {
  guest: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, vipLevel: true } },
  room: { select: { id: true, roomNumber: true, floor: true } },
  roomType: { select: { id: true, name: true, code: true } },
  ratePlan: { select: { id: true, name: true } },
  folio: { include: { items: true, payments: true } },
} satisfies Prisma.ReservationInclude;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  // --- Availability --------------------------------------------------------

  async availability(query: AvailabilityQueryDto) {
    const checkIn = this.parseDate(query.checkInDate);
    const checkOut = this.parseDate(query.checkOutDate);
    this.assertDateRange(checkIn, checkOut);

    const occupiedRoomIds = await this.occupiedRoomIds(query.propertyId, checkIn, checkOut);

    const rooms = await this.prisma.scoped.room.findMany({
      where: {
        propertyId: query.propertyId,
        isActive: true,
        status: { not: RoomStatus.OUT_OF_ORDER },
        ...(query.roomTypeId ? { roomTypeId: query.roomTypeId } : {}),
        id: { notIn: Array.from(occupiedRoomIds) },
      },
      include: { roomType: { select: { id: true, name: true, code: true, baseRate: true } } },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });

    const nights = this.nightsBetween(checkIn, checkOut);
    const byType = new Map<string, { roomType: any; availableRooms: number }>();
    for (const room of rooms) {
      const key = room.roomTypeId;
      const entry = byType.get(key) ?? { roomType: room.roomType, availableRooms: 0 };
      entry.availableRooms += 1;
      byType.set(key, entry);
    }

    return {
      checkInDate: query.checkInDate,
      checkOutDate: query.checkOutDate,
      nights,
      totalAvailable: rooms.length,
      roomTypes: Array.from(byType.values()),
      rooms,
    };
  }

  // --- CRUD ----------------------------------------------------------------

  async create(dto: CreateReservationDto) {
    const tenantId = this.tenantContext.requireTenantId();
    const checkIn = this.parseDate(dto.checkInDate);
    const checkOut = this.parseDate(dto.checkOutDate);
    this.assertDateRange(checkIn, checkOut);
    const nights = this.nightsBetween(checkIn, checkOut);

    const property = await this.prisma.scoped.property.findFirst({
      where: { id: dto.propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');

    const roomType = await this.prisma.scoped.roomType.findFirst({
      where: { id: dto.roomTypeId, propertyId: dto.propertyId },
    });
    if (!roomType) throw new NotFoundException('Room type not found for this property');

    let ratePerNight = dto.ratePerNight ?? Number(roomType.baseRate);
    if (dto.ratePlanId) {
      const ratePlan = await this.prisma.scoped.ratePlan.findFirst({
        where: { id: dto.ratePlanId },
      });
      if (ratePlan && dto.ratePerNight === undefined) {
        ratePerNight = Number(ratePlan.baseRate);
      }
    }

    if (dto.roomId) {
      await this.assertRoomAvailable(dto.propertyId, dto.roomId, checkIn, checkOut);
    }

    if (!dto.guestId && !dto.guest) {
      throw new BadRequestException('Either guestId or guest details are required');
    }

    const roomSubtotal = this.money(ratePerNight * nights);
    const taxAmount = this.money(roomSubtotal * Number(property.taxRate));
    const totalCharges = this.money(roomSubtotal + taxAmount);
    const currency = property.currency;
    const confirmationNo = generateCode('CR', 8);
    const folioNumber = generateCode('FO', 8);

    const reservationId = await this.prisma.$transaction(async (tx) => {
      let guestId = dto.guestId;
      if (!guestId && dto.guest) {
        const guest = await tx.guest.create({
          data: {
            tenantId,
            propertyId: dto.propertyId,
            firstName: dto.guest.firstName,
            lastName: dto.guest.lastName,
            email: dto.guest.email,
            phone: dto.guest.phone,
            nationality: dto.guest.nationality,
          },
        });
        guestId = guest.id;
      }

      const reservation = await tx.reservation.create({
        data: {
          tenantId,
          propertyId: dto.propertyId,
          guestId: guestId as string,
          roomId: dto.roomId,
          roomTypeId: dto.roomTypeId,
          ratePlanId: dto.ratePlanId,
          confirmationNo,
          channel: dto.channel ?? 'DIRECT',
          status: dto.status ?? ReservationStatus.CONFIRMED,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          nights,
          adults: dto.adults ?? 1,
          children: dto.children ?? 0,
          currency,
          totalAmount: totalCharges,
          depositAmount: dto.depositAmount ?? 0,
          specialRequests: dto.specialRequests,
          notes: dto.notes,
        },
      });

      await tx.folio.create({
        data: {
          tenantId,
          propertyId: dto.propertyId,
          reservationId: reservation.id,
          guestId: guestId as string,
          number: folioNumber,
          currency,
          totalCharges,
          totalPayments: 0,
          balance: totalCharges,
          items: {
            create: [
              {
                tenantId,
                type: 'ROOM',
                description: `Room charge — ${nights} night(s) @ ${ratePerNight.toFixed(2)} ${currency}`,
                quantity: nights,
                unitAmount: this.money(ratePerNight),
                amount: roomSubtotal,
                taxAmount,
                currency,
              },
            ],
          },
        },
      });

      return reservation.id;
    });

    return this.getOne(reservationId);
  }

  async findAll(query: ReservationQueryDto) {
    const where: Prisma.ReservationWhereInput = {};
    if (query.propertyId) where.propertyId = query.propertyId;
    if (query.status) where.status = query.status;
    if (query.channel) where.channel = query.channel;
    if (query.from || query.to) {
      where.checkInDate = {};
      if (query.from) (where.checkInDate as Prisma.DateTimeFilter).gte = this.parseDate(query.from);
      if (query.to) (where.checkInDate as Prisma.DateTimeFilter).lte = this.parseDate(query.to);
    }
    if (query.search) {
      where.OR = [
        { confirmationNo: { contains: query.search, mode: 'insensitive' } },
        { guest: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { guest: { lastName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.scoped.reservation.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          guest: { select: { id: true, firstName: true, lastName: true, vipLevel: true } },
          room: { select: { id: true, roomNumber: true } },
          roomType: { select: { id: true, name: true } },
        },
      }),
      this.prisma.scoped.reservation.count({ where }),
    ]);

    return paginate(data, total, query.page, query.limit);
  }

  async getOne(id: string) {
    const reservation = await this.prisma.scoped.reservation.findFirst({
      where: { id },
      include: DETAIL_INCLUDE,
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async update(id: string, dto: UpdateReservationDto) {
    const existing = await this.getOne(id);

    const checkIn = dto.checkInDate ? this.parseDate(dto.checkInDate) : existing.checkInDate;
    const checkOut = dto.checkOutDate ? this.parseDate(dto.checkOutDate) : existing.checkOutDate;
    if (dto.checkInDate || dto.checkOutDate) this.assertDateRange(checkIn, checkOut);

    const roomId = dto.roomId ?? existing.roomId ?? undefined;
    if (roomId && (dto.roomId || dto.checkInDate || dto.checkOutDate)) {
      await this.assertRoomAvailable(existing.propertyId, roomId, checkIn, checkOut, id);
    }

    const data: Prisma.ReservationUpdateInput = {
      adults: dto.adults,
      children: dto.children,
      status: dto.status,
      specialRequests: dto.specialRequests,
      notes: dto.notes,
    };
    if (dto.roomId) data.room = { connect: { id: dto.roomId } };
    if (dto.checkInDate || dto.checkOutDate) {
      data.checkInDate = checkIn;
      data.checkOutDate = checkOut;
      data.nights = this.nightsBetween(checkIn, checkOut);
    }

    await this.prisma.reservation.update({ where: { id }, data });
    return this.getOne(id);
  }

  async cancel(id: string, dto: CancelReservationDto) {
    const reservation = await this.getOne(id);
    if (reservation.status === ReservationStatus.CHECKED_OUT) {
      throw new BadRequestException('Cannot cancel a checked-out reservation');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: dto.reason,
        },
      });
      if (reservation.folio) {
        await tx.folio.update({
          where: { id: reservation.folio.id },
          data: { status: 'VOID' },
        });
      }
    });
    return this.getOne(id);
  }

  // --- Front-desk operations ----------------------------------------------

  async checkIn(id: string, dto: CheckInDto) {
    const reservation = await this.getOne(id);
    if (!CHECKIN_ALLOWED_STATUSES.includes(reservation.status)) {
      throw new BadRequestException(`Cannot check in a reservation with status ${reservation.status}`);
    }

    const roomId = dto.roomId ?? reservation.roomId;
    if (!roomId) {
      throw new BadRequestException('A room must be assigned before check-in');
    }
    await this.assertRoomAvailable(reservation.propertyId, roomId, reservation.checkInDate, reservation.checkOutDate, id);

    await this.prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
        data: { status: ReservationStatus.CHECKED_IN, checkinAt: new Date(), roomId },
      });
      await tx.room.update({ where: { id: roomId }, data: { status: RoomStatus.OCCUPIED } });
    });
    return this.getOne(id);
  }

  async checkOut(id: string) {
    const reservation = await this.getOne(id);
    if (reservation.status !== ReservationStatus.CHECKED_IN) {
      throw new BadRequestException('Only checked-in reservations can be checked out');
    }
    const tenantId = this.tenantContext.requireTenantId();

    await this.prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
        data: { status: ReservationStatus.CHECKED_OUT, checkoutAt: new Date() },
      });
      if (reservation.roomId) {
        await tx.room.update({
          where: { id: reservation.roomId },
          data: { status: RoomStatus.DIRTY },
        });
        // Auto-generate a checkout cleaning task for housekeeping.
        await tx.housekeepingTask.create({
          data: {
            tenantId,
            propertyId: reservation.propertyId,
            roomId: reservation.roomId,
            reservationId: reservation.id,
            type: 'CHECKOUT_CLEAN',
            priority: 'HIGH',
          },
        });
      }
      if (reservation.folio) {
        const balance = Number(reservation.folio.balance);
        await tx.folio.update({
          where: { id: reservation.folio.id },
          data: { status: balance <= 0 ? 'SETTLED' : 'CLOSED', closedAt: new Date() },
        });
      }
    });
    return this.getOne(id);
  }

  /** Reservations overlapping a date window — used by the calendar/timeline. */
  async calendar(propertyId: string, from: string, to: string) {
    const start = this.parseDate(from);
    const end = this.parseDate(to);
    return this.prisma.scoped.reservation.findMany({
      where: {
        propertyId,
        status: { in: [...BLOCKING_STATUSES, ReservationStatus.PENDING] },
        checkInDate: { lt: end },
        checkOutDate: { gt: start },
      },
      include: {
        guest: { select: { firstName: true, lastName: true } },
        room: { select: { id: true, roomNumber: true } },
        roomType: { select: { id: true, name: true } },
      },
      orderBy: { checkInDate: 'asc' },
    });
  }

  // --- helpers -------------------------------------------------------------

  private async occupiedRoomIds(
    propertyId: string,
    checkIn: Date,
    checkOut: Date,
    excludeReservationId?: string,
  ): Promise<Set<string>> {
    const conflicts = await this.prisma.scoped.reservation.findMany({
      where: {
        propertyId,
        roomId: { not: null },
        status: { in: BLOCKING_STATUSES },
        checkInDate: { lt: checkOut },
        checkOutDate: { gt: checkIn },
        ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      },
      select: { roomId: true },
    });
    return new Set(conflicts.map((c) => c.roomId as string));
  }

  private async assertRoomAvailable(
    propertyId: string,
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    excludeReservationId?: string,
  ) {
    const room = await this.prisma.scoped.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room) throw new NotFoundException('Room not found for this property');
    const occupied = await this.occupiedRoomIds(propertyId, checkIn, checkOut, excludeReservationId);
    if (occupied.has(roomId)) {
      throw new BadRequestException(`Room ${room.roomNumber} is not available for the selected dates`);
    }
  }

  private parseDate(value: string): Date {
    const d = new Date(value);
    if (isNaN(d.getTime())) throw new BadRequestException(`Invalid date: ${value}`);
    return d;
  }

  private assertDateRange(checkIn: Date, checkOut: Date) {
    if (checkOut.getTime() <= checkIn.getTime()) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }
  }

  private nightsBetween(checkIn: Date, checkOut: Date): number {
    const MS = 86_400_000;
    const a = Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate());
    const b = Date.UTC(checkOut.getUTCFullYear(), checkOut.getUTCMonth(), checkOut.getUTCDate());
    return Math.max(1, Math.round((b - a) / MS));
  }

  private money(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}

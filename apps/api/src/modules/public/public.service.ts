import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CredentialIssuedVia,
  LockCredentialKind,
  ReservationChannel,
  ReservationStatus,
  RoomStatus,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { TenantContextService } from '../../common/tenancy/tenant-context.service';
import { ReservationsService } from '../reservations/reservations.service';
import { LocksService } from '../locks/locks.service';
import { CreateReservationDto } from '../reservations/dto/reservation.dto';
import {
  KioskCheckInDto,
  KioskLookupDto,
  PublicAvailabilityQueryDto,
  PublicBookingDto,
} from './dto/public.dto';

// Reservations that hold inventory for a date range.
const BLOCKING: ReservationStatus[] = [
  ReservationStatus.PENDING,
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
];

// Statuses from which a guest may self-check-in at the kiosk.
const KIOSK_CHECKIN_STATUSES: ReservationStatus[] = [
  ReservationStatus.CONFIRMED,
  ReservationStatus.PENDING,
];

/**
 * Powers the per-hotel public booking site (no authentication). A property is
 * resolved by its `slug` (the subdomain) using the un-scoped client; once found
 * we bind the tenant context so the normal tenant-scoped logic can be reused.
 */
@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly reservations: ReservationsService,
    private readonly locks: LocksService,
    private readonly crypto: CryptoService,
  ) {}

  private async resolveProperty(slug: string) {
    const property = await this.prisma.property.findFirst({
      where: { slug, isActive: true, bookingEnabled: true },
    });
    if (!property) throw new NotFoundException('Hotel not found');
    // Bind tenant context for any tenant-scoped queries that follow.
    this.tenantContext.set({
      tenantId: property.tenantId,
      userId: 'public',
      role: 'PUBLIC',
      propertyId: property.id,
    });
    return property;
  }

  async getProperty(slug: string) {
    const property = await this.resolveProperty(slug);
    const roomTypes = await this.prisma.scoped.roomType.findMany({
      where: { propertyId: property.id },
      orderBy: { baseRate: 'asc' },
    });
    return {
      property: this.propertyDto(property),
      roomTypes: roomTypes.map((rt) => this.roomTypeDto(rt)),
    };
  }

  async availability(slug: string, q: PublicAvailabilityQueryDto) {
    const property = await this.resolveProperty(slug);
    const checkIn = this.parseDate(q.checkInDate);
    const checkOut = this.parseDate(q.checkOutDate);
    if (checkOut.getTime() <= checkIn.getTime()) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }
    const nights = this.nights(checkIn, checkOut);
    const adults = q.adults ?? 1;

    const [roomTypes, rooms, overlapping] = await Promise.all([
      this.prisma.scoped.roomType.findMany({ where: { propertyId: property.id }, orderBy: { baseRate: 'asc' } }),
      this.prisma.scoped.room.findMany({
        where: { propertyId: property.id, isActive: true, status: { not: RoomStatus.OUT_OF_ORDER } },
        select: { id: true, roomTypeId: true },
      }),
      this.prisma.scoped.reservation.findMany({
        where: {
          propertyId: property.id,
          status: { in: BLOCKING },
          checkInDate: { lt: checkOut },
          checkOutDate: { gt: checkIn },
        },
        select: { roomTypeId: true },
      }),
    ]);

    const totalByType = new Map<string, number>();
    for (const r of rooms) totalByType.set(r.roomTypeId, (totalByType.get(r.roomTypeId) ?? 0) + 1);
    const reservedByType = new Map<string, number>();
    for (const r of overlapping) reservedByType.set(r.roomTypeId, (reservedByType.get(r.roomTypeId) ?? 0) + 1);

    const available = roomTypes
      .map((rt) => {
        const total = totalByType.get(rt.id) ?? 0;
        const reserved = reservedByType.get(rt.id) ?? 0;
        const nightly = Number(rt.baseRate);
        return {
          ...this.roomTypeDto(rt),
          available: Math.max(0, total - reserved),
          nightlyRate: nightly,
          nights,
          totalPrice: this.money(nightly * nights),
        };
      })
      .filter((rt) => rt.available > 0 && rt.maxOccupancy >= adults);

    return {
      checkInDate: q.checkInDate,
      checkOutDate: q.checkOutDate,
      nights,
      currency: property.currency,
      roomTypes: available,
    };
  }

  async book(slug: string, dto: PublicBookingDto) {
    const property = await this.resolveProperty(slug);

    const avail = await this.availability(slug, {
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      adults: dto.adults,
    });
    const chosen = avail.roomTypes.find((rt) => rt.id === dto.roomTypeId);
    if (!chosen) {
      throw new BadRequestException('The selected room is no longer available for those dates');
    }

    const payload: CreateReservationDto = {
      propertyId: property.id,
      roomTypeId: dto.roomTypeId,
      guest: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        nationality: dto.nationality,
      },
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      adults: dto.adults ?? 1,
      children: dto.children ?? 0,
      channel: ReservationChannel.DIRECT,
      status: ReservationStatus.CONFIRMED,
      specialRequests: dto.specialRequests,
    };

    const reservation = await this.reservations.create(payload);

    return {
      confirmationNo: reservation.confirmationNo,
      status: reservation.status,
      propertyName: property.name,
      guestName: `${dto.firstName} ${dto.lastName}`,
      roomType: chosen.name,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      nights: reservation.nights,
      currency: reservation.currency,
      totalAmount: Number(reservation.totalAmount),
      checkInTime: property.checkInTime,
      checkOutTime: property.checkOutTime,
    };
  }

  async lookup(slug: string, confirmationNo: string, lastName: string) {
    const property = await this.resolveProperty(slug);
    const reservation = await this.prisma.scoped.reservation.findFirst({
      where: {
        confirmationNo,
        guest: { lastName: { equals: lastName, mode: 'insensitive' } },
      },
      include: {
        guest: { select: { firstName: true, lastName: true } },
        roomType: { select: { name: true } },
        room: { select: { roomNumber: true } },
      },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found — check the confirmation number and last name');
    }
    return {
      confirmationNo: reservation.confirmationNo,
      status: reservation.status,
      guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      roomType: reservation.roomType?.name ?? null,
      roomNumber: reservation.room?.roomNumber ?? null,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      nights: reservation.nights,
      currency: reservation.currency,
      totalAmount: Number(reservation.totalAmount),
      propertyName: property.name,
    };
  }

  // --- Self-service kiosk --------------------------------------------------

  /**
   * Kiosk step 1 — identify the booking (confirmation number + last name) and
   * return what the guest needs to self-check-in: their stay details, any room
   * already assigned, and the rooms available to pick from.
   */
  async kioskLookup(slug: string, dto: KioskLookupDto) {
    const property = await this.resolveProperty(slug);
    const reservation = await this.findReservationForKiosk(dto.confirmationNo, dto.lastName);

    const available = await this.availableRooms(reservation);
    const assignedRoom = reservation.roomId
      ? await this.prisma.scoped.room.findFirst({
          where: { id: reservation.roomId },
          select: { id: true, roomNumber: true, floor: true },
        })
      : null;

    return {
      confirmationNo: reservation.confirmationNo,
      status: reservation.status,
      guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      roomType: reservation.roomType?.name ?? null,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      nights: reservation.nights,
      adults: reservation.adults,
      children: reservation.children,
      currency: reservation.currency,
      totalAmount: Number(reservation.totalAmount),
      canCheckIn: KIOSK_CHECKIN_STATUSES.includes(reservation.status),
      alreadyCheckedIn: reservation.status === ReservationStatus.CHECKED_IN,
      assignedRoom,
      availableRooms: available.map((r) => ({ id: r.id, roomNumber: r.roomNumber, floor: r.floor })),
      property: {
        name: property.name,
        checkInTime: property.checkInTime,
        checkOutTime: property.checkOutTime,
      },
    };
  }

  /**
   * Kiosk step 2 — verify the guest again, assign a room, store any scanned
   * passport (encrypted, for legal registration — never decrypted here), issue
   * the room key, and complete check-in. The freshly-issued PIN / card serial is
   * returned once so the kiosk can display or encode it.
   */
  async kioskCheckIn(slug: string, dto: KioskCheckInDto) {
    const property = await this.resolveProperty(slug);
    const reservation = await this.findReservationForKiosk(dto.confirmationNo, dto.lastName);

    if (reservation.status === ReservationStatus.CHECKED_IN) {
      throw new BadRequestException('This booking is already checked in — please see the front desk.');
    }
    if (!KIOSK_CHECKIN_STATUSES.includes(reservation.status)) {
      throw new BadRequestException(`This booking cannot be checked in (status: ${reservation.status}).`);
    }

    const room = await this.resolveKioskRoom(reservation, dto.roomId);

    // Passport is stored encrypted at rest for legal guest registration only.
    // We never decrypt it on these unauthenticated kiosk endpoints.
    if (dto.passportNo || dto.nationality) {
      await this.prisma.scoped.guest.updateMany({
        where: { id: reservation.guestId },
        data: {
          ...(dto.passportNo ? { passportNo: this.crypto.encrypt(dto.passportNo) } : {}),
          ...(dto.nationality ? { nationality: dto.nationality } : {}),
        },
      });
    }

    const type =
      dto.credentialType === 'pin_code' ? LockCredentialKind.PIN_CODE : LockCredentialKind.RFID_CARD;

    // Issue the credential first (issuedVia=KIOSK); the subsequent check-in then
    // sees an active credential and skips its own auto-issue.
    const credential = await this.locks.issue({
      reservationId: reservation.id,
      roomId: room.id,
      provider: room.lockProvider,
      type,
      validFrom: new Date(),
      validUntil: new Date(reservation.checkOutDate.getTime() + 12 * 3_600_000),
      issuedVia: CredentialIssuedVia.KIOSK,
    });

    await this.reservations.checkIn(reservation.id, { roomId: room.id });

    return {
      confirmationNo: reservation.confirmationNo,
      guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      status: ReservationStatus.CHECKED_IN,
      room: { roomNumber: room.roomNumber, floor: room.floor },
      credential: {
        type: credential.type,
        cardId: credential.cardId,
        pinCode: credential.pinCode,
      },
      checkOutDate: reservation.checkOutDate,
      checkOutTime: property.checkOutTime,
      propertyName: property.name,
    };
  }

  /** Find a reservation for the kiosk by confirmation number + last name. */
  private async findReservationForKiosk(confirmationNo: string, lastName: string) {
    const reservation = await this.prisma.scoped.reservation.findFirst({
      where: {
        confirmationNo,
        guest: { lastName: { equals: lastName, mode: 'insensitive' } },
      },
      include: {
        guest: { select: { id: true, firstName: true, lastName: true } },
        roomType: { select: { id: true, name: true } },
      },
    });
    if (!reservation) {
      throw new NotFoundException('Booking not found — check the confirmation number and last name.');
    }
    return reservation;
  }

  /** Rooms of the reservation's room type that are free for its date window. */
  private async availableRooms(reservation: {
    id: string;
    propertyId: string;
    roomTypeId: string;
    checkInDate: Date;
    checkOutDate: Date;
  }) {
    const occupied = await this.prisma.scoped.reservation.findMany({
      where: {
        propertyId: reservation.propertyId,
        roomId: { not: null },
        status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] },
        checkInDate: { lt: reservation.checkOutDate },
        checkOutDate: { gt: reservation.checkInDate },
        id: { not: reservation.id },
      },
      select: { roomId: true },
    });
    const occupiedIds = occupied.map((o) => o.roomId as string);

    return this.prisma.scoped.room.findMany({
      where: {
        propertyId: reservation.propertyId,
        roomTypeId: reservation.roomTypeId,
        isActive: true,
        status: { not: RoomStatus.OUT_OF_ORDER },
        id: { notIn: occupiedIds },
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });
  }

  /** Decide which room the kiosk will check the guest into. */
  private async resolveKioskRoom(
    reservation: { id: string; propertyId: string; roomTypeId: string; roomId: string | null; checkInDate: Date; checkOutDate: Date },
    requestedRoomId?: string,
  ) {
    const available = await this.availableRooms(reservation);

    if (requestedRoomId) {
      const chosen = available.find((r) => r.id === requestedRoomId);
      if (chosen) return chosen;
      if (reservation.roomId === requestedRoomId) {
        const r = await this.prisma.scoped.room.findFirst({ where: { id: requestedRoomId } });
        if (r) return r;
      }
      throw new BadRequestException('That room is no longer available — please choose another.');
    }

    if (reservation.roomId) {
      const r = await this.prisma.scoped.room.findFirst({ where: { id: reservation.roomId } });
      if (r) return r;
    }
    if (available.length === 0) {
      throw new BadRequestException('No rooms are available right now — please see the front desk.');
    }
    return available[0];
  }

  // --- mappers / helpers ---------------------------------------------------
  private propertyDto(p: {
    slug: string | null; name: string; description: string | null; city: string | null;
    country: string; addressLine: string | null; phone: string | null; email: string | null;
    currency: string; checkInTime: string; checkOutTime: string; logoUrl: string | null;
    heroImageUrl: string | null; images: unknown;
  }) {
    return {
      slug: p.slug,
      name: p.name,
      description: p.description,
      city: p.city,
      country: p.country,
      addressLine: p.addressLine,
      phone: p.phone,
      email: p.email,
      currency: p.currency,
      checkInTime: p.checkInTime,
      checkOutTime: p.checkOutTime,
      logoUrl: p.logoUrl,
      heroImageUrl: p.heroImageUrl,
      images: (p.images as string[]) ?? [],
    };
  }

  private roomTypeDto(rt: {
    id: string; name: string; code: string; description: string | null;
    baseRate: unknown; maxOccupancy: number; maxAdults: number; maxChildren: number;
    bedType: string | null; sizeSqm: number | null; amenities: unknown; photos: unknown;
  }) {
    return {
      id: rt.id,
      name: rt.name,
      code: rt.code,
      description: rt.description,
      baseRate: Number(rt.baseRate),
      maxOccupancy: rt.maxOccupancy,
      maxAdults: rt.maxAdults,
      maxChildren: rt.maxChildren,
      bedType: rt.bedType,
      sizeSqm: rt.sizeSqm,
      amenities: (rt.amenities as string[]) ?? [],
      photos: (rt.photos as string[]) ?? [],
    };
  }

  private parseDate(value: string): Date {
    const d = new Date(value);
    if (isNaN(d.getTime())) throw new BadRequestException(`Invalid date: ${value}`);
    return d;
  }

  private nights(checkIn: Date, checkOut: Date): number {
    const MS = 86_400_000;
    const a = Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate());
    const b = Date.UTC(checkOut.getUTCFullYear(), checkOut.getUTCMonth(), checkOut.getUTCDate());
    return Math.max(1, Math.round((b - a) / MS));
  }

  private money(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}

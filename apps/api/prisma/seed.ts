/* eslint-disable no-console */
import {
  HousekeepingStatus,
  HousekeepingType,
  PaymentDirection,
  PaymentMethod,
  PaymentStatus,
  PlanTier,
  PrismaClient,
  ReservationChannel,
  ReservationStatus,
  RoomStatus,
  SubscriptionStatus,
  UserRole,
  VipLevel,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function code(prefix: string, len = 6): string {
  let s = '';
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `${prefix}-${s}`;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86_400_000);
}
function money(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const FIRST = ['James', 'Mary', 'Wei', 'Yuki', 'Sofia', 'Liam', 'Olivia', 'Noah', 'Emma', 'Lucas', 'Mia', 'Chen', 'Aisha', 'Omar', 'Elena', 'Hiro', 'Klaus', 'Ingrid', 'Pablo', 'Nadia', 'Tom', 'Sara', 'Viktor', 'Lena'];
const LAST = ['Smith', 'Johnson', 'Lee', 'Tanaka', 'Garcia', 'Brown', 'Wang', 'Müller', 'Rossi', 'Dubois', 'Kim', 'Patel', 'Hassan', 'Petrov', 'Nguyen', 'Olsen', 'Santos', 'Cohen', 'Ali', 'Park', 'Schmidt', 'Costa', 'Ivanov', 'Berg'];
const NATIONS = ['US', 'GB', 'JP', 'CN', 'DE', 'FR', 'IT', 'ES', 'KR', 'AE', 'RU', 'IN'];

interface RoomTypeSpec {
  name: string;
  code: string;
  baseRate: number;
  maxOccupancy: number;
  bedType: string;
}

async function seedTenant(opts: {
  name: string;
  slug: string;
  propertyName: string;
  city: string;
  country: string;
  currency: string;
  tier: PlanTier;
  roomTypes: RoomTypeSpec[];
  floors: number;
  roomsPerFloor: number;
  guestCount: number;
  emailDomain: string;
}) {
  console.log(`\n→ Seeding tenant: ${opts.name}`);
  await prisma.tenant.deleteMany({ where: { slug: opts.slug } });

  const password = await bcrypt.hash('Passw0rd!', 12);

  const tenant = await prisma.tenant.create({
    data: {
      name: opts.name,
      slug: opts.slug,
      contactEmail: `owner@${opts.emailDomain}`,
      country: opts.country,
      currency: opts.currency,
      timezone: 'UTC',
      subscription: {
        create: {
          tier: opts.tier,
          status: SubscriptionStatus.ACTIVE,
          roomLimit: opts.tier === PlanTier.ENTERPRISE ? 100000 : opts.tier === PlanTier.PROFESSIONAL ? 100 : 30,
          currentPeriodEnd: addDays(new Date(), 30),
        },
      },
    },
  });

  const property = await prisma.property.create({
    data: {
      tenantId: tenant.id,
      name: opts.propertyName,
      code: 'MAIN',
      city: opts.city,
      country: opts.country,
      currency: opts.currency,
      taxRate: 0.1,
      totalFloors: opts.floors,
      phone: '+1 555 0100',
      email: `front@${opts.emailDomain}`,
    },
  });

  // Staff users — one per role
  const roleEmails: { role: UserRole; email: string; first: string; last: string }[] = [
    { role: UserRole.OWNER, email: `owner@${opts.emailDomain}`, first: 'Olivia', last: 'Owner' },
    { role: UserRole.GM, email: `gm@${opts.emailDomain}`, first: 'George', last: 'Manager' },
    { role: UserRole.FRONT_DESK_MANAGER, email: `fdm@${opts.emailDomain}`, first: 'Fiona', last: 'Desk' },
    { role: UserRole.FRONT_DESK, email: `frontdesk@${opts.emailDomain}`, first: 'Frank', last: 'Reception' },
    { role: UserRole.HOUSEKEEPING_SUPERVISOR, email: `hksup@${opts.emailDomain}`, first: 'Hannah', last: 'Supervisor' },
    { role: UserRole.HOUSEKEEPING, email: `housekeeper@${opts.emailDomain}`, first: 'Hugo', last: 'Cleaner' },
    { role: UserRole.FINANCE_MANAGER, email: `finance@${opts.emailDomain}`, first: 'Felix', last: 'Ledger' },
    { role: UserRole.REVENUE_MANAGER, email: `revenue@${opts.emailDomain}`, first: 'Rita', last: 'Yield' },
  ];
  const users = await Promise.all(
    roleEmails.map((r) =>
      prisma.user.create({
        data: {
          tenantId: tenant.id,
          propertyId: property.id,
          email: r.email,
          passwordHash: password,
          firstName: r.first,
          lastName: r.last,
          role: r.role,
        },
      }),
    ),
  );
  const housekeepers = users.filter(
    (u) => u.role === UserRole.HOUSEKEEPING || u.role === UserRole.HOUSEKEEPING_SUPERVISOR,
  );

  // Room types
  const roomTypes = await Promise.all(
    opts.roomTypes.map((rt) =>
      prisma.roomType.create({
        data: {
          tenantId: tenant.id,
          propertyId: property.id,
          name: rt.name,
          code: rt.code,
          baseRate: rt.baseRate,
          maxOccupancy: rt.maxOccupancy,
          maxAdults: rt.maxOccupancy,
          bedType: rt.bedType,
          description: `${rt.name} — ${rt.bedType} bed, sleeps ${rt.maxOccupancy}`,
          amenities: ['WiFi', 'Air conditioning', 'Smart TV', 'Minibar'],
        },
      }),
    ),
  );

  // Rate plans
  await prisma.ratePlan.create({
    data: {
      tenantId: tenant.id,
      propertyId: property.id,
      name: 'Best Available Rate',
      code: 'BAR',
      baseRate: roomTypes[0].baseRate,
      currency: opts.currency,
      includesBreakfast: false,
    },
  });

  // Rooms
  const rooms: any[] = [];
  for (let floor = 1; floor <= opts.floors; floor++) {
    for (let i = 1; i <= opts.roomsPerFloor; i++) {
      const rt = roomTypes[(floor + i) % roomTypes.length];
      const number = `${floor}${String(i).padStart(2, '0')}`;
      const room = await prisma.room.create({
        data: {
          tenantId: tenant.id,
          propertyId: property.id,
          roomTypeId: rt.id,
          roomNumber: number,
          floor,
          baseRate: rt.baseRate,
          status: RoomStatus.AVAILABLE,
          lockProvider: pick(['NONE', 'SALTO', 'NUKI', 'IGLOOHOME']) as any,
        },
      });
      rooms.push({ ...room, baseRateNum: Number(rt.baseRate) });
    }
  }

  // Guests
  const guests: any[] = [];
  for (let i = 0; i < opts.guestCount; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    const guest = await prisma.guest.create({
      data: {
        tenantId: tenant.id,
        propertyId: property.id,
        firstName: first,
        lastName: last,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
        phone: `+1 555 ${String(1000 + i).padStart(4, '0')}`,
        nationality: pick(NATIONS),
        vipLevel: pick([VipLevel.NONE, VipLevel.NONE, VipLevel.NONE, VipLevel.SILVER, VipLevel.GOLD, VipLevel.PLATINUM]),
        loyaltyPoints: Math.floor(Math.random() * 5000),
      },
    });
    guests.push(guest);
  }

  // Reservations
  const today = startOfDay(new Date());
  const channels = [
    ReservationChannel.DIRECT,
    ReservationChannel.BOOKING_COM,
    ReservationChannel.AIRBNB,
    ReservationChannel.EXPEDIA,
    ReservationChannel.AGODA,
    ReservationChannel.WALK_IN,
  ];

  let resCount = 0;
  const createReservation = async (params: {
    checkIn: Date;
    nights: number;
    status: ReservationStatus;
    assignRoom: boolean;
    paidFull: boolean;
    addExtras: boolean;
    roomStatus?: RoomStatus;
    hkTask?: HousekeepingStatus;
  }) => {
    const guest = pick(guests);
    const room = pick(rooms);
    const rt = roomTypes.find((t) => t.id === room.roomTypeId)!;
    const rate = Number(rt.baseRate);
    const checkOut = addDays(params.checkIn, params.nights);
    const roomSubtotal = money(rate * params.nights);
    const tax = money(roomSubtotal * 0.1);
    const extras = params.addExtras ? money(pick([12, 24, 45, 60])) : 0;
    const extrasTax = money(extras * 0.1);
    const totalCharges = money(roomSubtotal + tax + extras + extrasTax);
    const paid = params.paidFull ? totalCharges : params.status === ReservationStatus.CONFIRMED ? money(roomSubtotal * 0.3) : 0;

    const reservation = await prisma.reservation.create({
      data: {
        tenantId: tenant.id,
        propertyId: property.id,
        guestId: guest.id,
        roomId: params.assignRoom ? room.id : null,
        roomTypeId: rt.id,
        confirmationNo: code('CR', 8),
        channel: pick(channels),
        status: params.status,
        checkInDate: params.checkIn,
        checkOutDate: checkOut,
        nights: params.nights,
        adults: pick([1, 2, 2, 3]),
        children: pick([0, 0, 1]),
        currency: opts.currency,
        totalAmount: totalCharges,
        paidAmount: paid,
        checkinAt: ([ReservationStatus.CHECKED_IN, ReservationStatus.CHECKED_OUT] as ReservationStatus[]).includes(params.status) ? params.checkIn : null,
        checkoutAt: params.status === ReservationStatus.CHECKED_OUT ? checkOut : null,
      },
    });

    const items: any[] = [
      {
        tenantId: tenant.id,
        type: 'ROOM',
        description: `Room charge — ${params.nights} night(s) @ ${rate.toFixed(2)} ${opts.currency}`,
        quantity: params.nights,
        unitAmount: rate,
        amount: roomSubtotal,
        taxAmount: tax,
        currency: opts.currency,
      },
    ];
    if (params.addExtras) {
      items.push({
        tenantId: tenant.id,
        type: pick(['POS', 'EXTRA']),
        description: pick(['Restaurant — Dinner', 'Minibar', 'Spa treatment', 'Airport transfer']),
        quantity: 1,
        unitAmount: extras,
        amount: extras,
        taxAmount: extrasTax,
        currency: opts.currency,
      });
    }

    const folio = await prisma.folio.create({
      data: {
        tenantId: tenant.id,
        propertyId: property.id,
        reservationId: reservation.id,
        guestId: guest.id,
        number: code('FO', 8),
        currency: opts.currency,
        status: params.status === ReservationStatus.CHECKED_OUT ? 'SETTLED' : 'OPEN',
        totalCharges,
        totalPayments: paid,
        balance: money(totalCharges - paid),
        closedAt: params.status === ReservationStatus.CHECKED_OUT ? checkOut : null,
        items: { create: items },
      },
    });

    if (paid > 0) {
      await prisma.payment.create({
        data: {
          tenantId: tenant.id,
          folioId: folio.id,
          direction: PaymentDirection.CHARGE,
          method: pick([PaymentMethod.CARD, PaymentMethod.CARD, PaymentMethod.CASH, PaymentMethod.QPAY]),
          status: PaymentStatus.SUCCEEDED,
          amount: paid,
          currency: opts.currency,
          gateway: 'mock',
          gatewayRef: code('PAY', 10),
          last4: '4242',
          createdAt: params.checkIn,
        },
      });
    }

    if (params.assignRoom && params.roomStatus) {
      await prisma.room.update({ where: { id: room.id }, data: { status: params.roomStatus } });
    }
    if (params.assignRoom && params.hkTask) {
      await prisma.housekeepingTask.create({
        data: {
          tenantId: tenant.id,
          propertyId: property.id,
          roomId: room.id,
          reservationId: reservation.id,
          assignedToId: pick(housekeepers).id,
          type: HousekeepingType.CHECKOUT_CLEAN,
          priority: 'HIGH',
          status: params.hkTask,
          assignedAt: new Date(),
          startedAt: params.hkTask !== HousekeepingStatus.PENDING ? new Date() : null,
          completedAt: ([HousekeepingStatus.COMPLETED, HousekeepingStatus.INSPECTED] as HousekeepingStatus[]).includes(params.hkTask) ? new Date() : null,
        },
      });
    }
    resCount++;
  };

  // Past stays (checked out) over the last 30 days — builds history for reports
  for (let i = 0; i < 40; i++) {
    const start = addDays(today, -1 * (2 + Math.floor(Math.random() * 28)));
    await createReservation({
      checkIn: start,
      nights: pick([1, 2, 2, 3, 4]),
      status: ReservationStatus.CHECKED_OUT,
      assignRoom: true,
      paidFull: true,
      addExtras: Math.random() < 0.5,
      roomStatus: pick([RoomStatus.DIRTY, RoomStatus.CLEAN, RoomStatus.AVAILABLE]),
      hkTask: pick([HousekeepingStatus.COMPLETED, HousekeepingStatus.INSPECTED]),
    });
  }

  // In-house now (checked in)
  const inHouseCount = Math.floor(rooms.length * 0.45);
  const usedRooms = new Set<string>();
  for (let i = 0; i < inHouseCount; i++) {
    const start = addDays(today, -1 * (1 + Math.floor(Math.random() * 3)));
    await createReservation({
      checkIn: start,
      nights: pick([2, 3, 4, 5]),
      status: ReservationStatus.CHECKED_IN,
      assignRoom: true,
      paidFull: Math.random() < 0.6,
      addExtras: Math.random() < 0.4,
      roomStatus: RoomStatus.OCCUPIED,
    });
    usedRooms.add('x');
  }

  // Arrivals today (confirmed)
  for (let i = 0; i < 6; i++) {
    await createReservation({
      checkIn: today,
      nights: pick([1, 2, 3]),
      status: ReservationStatus.CONFIRMED,
      assignRoom: Math.random() < 0.5,
      paidFull: false,
      addExtras: false,
    });
  }

  // Future reservations
  for (let i = 0; i < 14; i++) {
    await createReservation({
      checkIn: addDays(today, 1 + Math.floor(Math.random() * 30)),
      nights: pick([1, 2, 3, 4]),
      status: ReservationStatus.CONFIRMED,
      assignRoom: Math.random() < 0.3,
      paidFull: false,
      addExtras: false,
    });
  }

  // A few standalone dirty rooms + pending housekeeping
  const someRooms = rooms.slice(0, 4);
  for (const r of someRooms) {
    await prisma.room.update({ where: { id: r.id }, data: { status: RoomStatus.DIRTY } });
    await prisma.housekeepingTask.create({
      data: {
        tenantId: tenant.id,
        propertyId: property.id,
        roomId: r.id,
        assignedToId: pick(housekeepers).id,
        type: HousekeepingType.CHECKOUT_CLEAN,
        priority: pick(['NORMAL', 'HIGH', 'URGENT']),
        status: HousekeepingStatus.PENDING,
      },
    });
  }

  console.log(`  ✓ ${opts.propertyName}: ${rooms.length} rooms, ${guests.length} guests, ${resCount} reservations, ${users.length} staff`);
  return { tenant, property };
}

async function main() {
  console.log('🌱 Seeding Cloud PMS demo data...');

  await seedTenant({
    name: 'Grand Aurora Hospitality',
    slug: 'grand-aurora',
    propertyName: 'Grand Aurora Hotel',
    city: 'Singapore',
    country: 'SG',
    currency: 'USD',
    tier: PlanTier.PROFESSIONAL,
    floors: 5,
    roomsPerFloor: 8,
    guestCount: 24,
    emailDomain: 'demo.cloudpms.app',
    roomTypes: [
      { name: 'Standard Queen', code: 'STD', baseRate: 89, maxOccupancy: 2, bedType: 'Queen' },
      { name: 'Deluxe King', code: 'DLX', baseRate: 139, maxOccupancy: 3, bedType: 'King' },
      { name: 'Family Room', code: 'FAM', baseRate: 179, maxOccupancy: 4, bedType: 'Two Queen' },
      { name: 'Executive Suite', code: 'STE', baseRate: 269, maxOccupancy: 4, bedType: 'King + Sofa' },
    ],
  });

  // Second business — proves tenant isolation (separate data, separate login)
  await seedTenant({
    name: 'Seaside Inn Group',
    slug: 'seaside-inn',
    propertyName: 'Seaside Boutique Inn',
    city: 'Lisbon',
    country: 'PT',
    currency: 'EUR',
    tier: PlanTier.STARTER,
    floors: 3,
    roomsPerFloor: 6,
    guestCount: 14,
    emailDomain: 'seaside.cloudpms.app',
    roomTypes: [
      { name: 'Cozy Double', code: 'DBL', baseRate: 75, maxOccupancy: 2, bedType: 'Double' },
      { name: 'Sea View', code: 'SEA', baseRate: 115, maxOccupancy: 2, bedType: 'Queen' },
      { name: 'Loft Suite', code: 'LFT', baseRate: 185, maxOccupancy: 3, bedType: 'King' },
    ],
  });

  console.log('\n✅ Seed complete.');
  console.log('\n   Demo logins (password: Passw0rd!):');
  console.log('   • owner@demo.cloudpms.app       (Grand Aurora — Owner)');
  console.log('   • frontdesk@demo.cloudpms.app   (Grand Aurora — Front Desk)');
  console.log('   • owner@seaside.cloudpms.app    (Seaside Inn — Owner)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

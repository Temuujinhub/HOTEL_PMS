import { Injectable } from '@nestjs/common';
import { PaymentDirection, PaymentStatus, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

const COUNTED_STATUSES: ReservationStatus[] = [
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
  ReservationStatus.CHECKED_OUT,
];

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Real-time operational dashboard for the front desk / GM. */
  async dashboard(propertyId: string) {
    const today = this.startOfDay(new Date());
    const tomorrow = this.addDays(today, 1);

    const [totalRooms, inHouse, arrivals, departures, dirtyRooms, hkPending] =
      await Promise.all([
        this.prisma.scoped.room.count({ where: { propertyId, isActive: true } }),
        this.prisma.scoped.reservation.findMany({
          where: {
            propertyId,
            status: ReservationStatus.CHECKED_IN,
            checkInDate: { lte: today },
            checkOutDate: { gt: today },
          },
          select: { totalAmount: true, nights: true, roomId: true },
        }),
        this.prisma.scoped.reservation.count({
          where: {
            propertyId,
            status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] },
            checkInDate: { gte: today, lt: tomorrow },
          },
        }),
        this.prisma.scoped.reservation.count({
          where: {
            propertyId,
            status: ReservationStatus.CHECKED_IN,
            checkOutDate: { gte: today, lt: tomorrow },
          },
        }),
        this.prisma.scoped.room.count({ where: { propertyId, status: 'DIRTY' } }),
        this.prisma.scoped.housekeepingTask.count({
          where: { propertyId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
        }),
      ]);

    const occupiedRooms = new Set(inHouse.map((r) => r.roomId).filter(Boolean)).size;
    const roomRevenueToday = inHouse.reduce(
      (sum, r) => sum + Number(r.totalAmount) / Math.max(1, r.nights),
      0,
    );
    const occupancyRate = totalRooms > 0 ? occupiedRooms / totalRooms : 0;
    const adr = occupiedRooms > 0 ? roomRevenueToday / occupiedRooms : 0;
    const revpar = totalRooms > 0 ? roomRevenueToday / totalRooms : 0;

    const paymentsToday = await this.netPayments(propertyId, today, tomorrow);

    return {
      date: today.toISOString().slice(0, 10),
      occupancy: {
        totalRooms,
        occupiedRooms,
        availableRooms: Math.max(0, totalRooms - occupiedRooms),
        occupancyRate: this.round(occupancyRate, 4),
      },
      kpis: {
        adr: this.round(adr),
        revpar: this.round(revpar),
        roomRevenueToday: this.round(roomRevenueToday),
        paymentsToday: this.round(paymentsToday),
      },
      movements: { arrivalsToday: arrivals, departuresToday: departures, inHouse: inHouse.length },
      housekeeping: { dirtyRooms, pendingTasks: hkPending },
    };
  }

  /** Per-day occupancy plus period ADR / RevPAR over a date range. */
  async occupancy(propertyId: string, fromStr?: string, toStr?: string) {
    const { from, to, days } = this.range(fromStr, toStr);
    const totalRooms = await this.prisma.scoped.room.count({
      where: { propertyId, isActive: true },
    });

    const reservations = await this.prisma.scoped.reservation.findMany({
      where: {
        propertyId,
        status: { in: COUNTED_STATUSES },
        checkInDate: { lt: to },
        checkOutDate: { gt: from },
      },
      select: { checkInDate: true, checkOutDate: true, totalAmount: true, nights: true },
    });

    const series: { date: string; occupied: number; total: number; rate: number }[] = [];
    let roomNightsSold = 0;
    let roomRevenue = 0;

    for (let i = 0; i < days; i++) {
      const day = this.addDays(from, i);
      const next = this.addDays(day, 1);
      let occupied = 0;
      for (const r of reservations) {
        if (r.checkInDate < next && r.checkOutDate > day) {
          occupied++;
          roomRevenue += Number(r.totalAmount) / Math.max(1, r.nights);
        }
      }
      roomNightsSold += occupied;
      series.push({
        date: day.toISOString().slice(0, 10),
        occupied,
        total: totalRooms,
        rate: totalRooms > 0 ? this.round(occupied / totalRooms, 4) : 0,
      });
    }

    const capacity = totalRooms * days;
    return {
      from: from.toISOString().slice(0, 10),
      to: this.addDays(to, -1).toISOString().slice(0, 10),
      days,
      summary: {
        avgOccupancy: capacity > 0 ? this.round(roomNightsSold / capacity, 4) : 0,
        adr: roomNightsSold > 0 ? this.round(roomRevenue / roomNightsSold) : 0,
        revpar: capacity > 0 ? this.round(roomRevenue / capacity) : 0,
        roomNightsSold,
        roomRevenue: this.round(roomRevenue),
      },
      series,
    };
  }

  /** Revenue broken down by day and by channel. */
  async revenue(propertyId: string, fromStr?: string, toStr?: string) {
    const { from, to } = this.range(fromStr, toStr);

    const payments = await this.prisma.scoped.payment.findMany({
      where: {
        folio: { propertyId },
        status: PaymentStatus.SUCCEEDED,
        createdAt: { gte: from, lt: to },
      },
      select: { amount: true, direction: true, createdAt: true, method: true },
    });

    const byDay = new Map<string, number>();
    let total = 0;
    for (const p of payments) {
      const key = p.createdAt.toISOString().slice(0, 10);
      const signed = p.direction === PaymentDirection.CHARGE ? Number(p.amount) : -Number(p.amount);
      byDay.set(key, (byDay.get(key) ?? 0) + signed);
      total += signed;
    }

    const channelGroups = await this.prisma.scoped.reservation.groupBy({
      by: ['channel'],
      where: {
        propertyId,
        status: { in: COUNTED_STATUSES },
        createdAt: { gte: from, lt: to },
      },
      _sum: { totalAmount: true },
      _count: { _all: true },
    });

    return {
      from: from.toISOString().slice(0, 10),
      to: this.addDays(to, -1).toISOString().slice(0, 10),
      total: this.round(total),
      byDay: Array.from(byDay.entries())
        .map(([date, amount]) => ({ date, amount: this.round(amount) }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      byChannel: channelGroups
        .map((g) => ({
          channel: g.channel,
          bookings: g._count._all,
          revenue: this.round(Number(g._sum.totalAmount ?? 0)),
        }))
        .sort((a, b) => b.revenue - a.revenue),
    };
  }

  // --- helpers -------------------------------------------------------------

  private async netPayments(propertyId: string, from: Date, to: Date): Promise<number> {
    const payments = await this.prisma.scoped.payment.findMany({
      where: {
        folio: { propertyId },
        status: PaymentStatus.SUCCEEDED,
        createdAt: { gte: from, lt: to },
      },
      select: { amount: true, direction: true },
    });
    return payments.reduce(
      (sum, p) => sum + (p.direction === PaymentDirection.CHARGE ? Number(p.amount) : -Number(p.amount)),
      0,
    );
  }

  private range(fromStr?: string, toStr?: string) {
    const to = toStr ? this.addDays(this.startOfDay(new Date(toStr)), 1) : this.addDays(this.startOfDay(new Date()), 1);
    const from = fromStr ? this.startOfDay(new Date(fromStr)) : this.addDays(to, -30);
    const days = Math.max(1, Math.round((from && to ? to.getTime() - from.getTime() : 0) / 86_400_000));
    return { from, to, days };
  }

  private startOfDay(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  private addDays(d: Date, n: number): Date {
    return new Date(d.getTime() + n * 86_400_000);
  }

  private round(value: number, decimals = 2): number {
    const f = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * f) / f;
  }
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, qs } from '@/lib/api';
import { useProperty } from '@/components/shell';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  LoadingState,
  StatCard,
  Table,
  Td,
  Th,
} from '@/components/ui';
import {
  formatCurrency,
  formatPercent,
  formatDate,
  initials,
  reservationColor,
  labelize,
} from '@/lib/format';
import type { Dashboard, Paginated, Reservation } from '@/lib/types';

export default function OverviewPage() {
  const { property } = useProperty();
  const [data, setData] = useState<Dashboard | null>(null);
  const [arrivals, setArrivals] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!property) return;
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      api.get<Dashboard>(`/analytics/dashboard${qs({ propertyId: property.id })}`),
      api.get<Paginated<Reservation>>(
        `/reservations${qs({ propertyId: property.id, status: 'CONFIRMED', from: today, to: today, limit: 8 })}`,
      ),
    ])
      .then(([d, a]) => {
        setData(d);
        setArrivals(a.data);
      })
      .finally(() => setLoading(false));
  }, [property]);

  if (loading || !data) return <LoadingState label="Loading dashboard…" />;

  const cur = property?.currency || 'USD';

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Today at {property?.name}</h1>
          <p className="text-sm text-muted">{formatDate(data.date)}</p>
        </div>
        <Link href="/app/reservations">
          <Button>New reservation</Button>
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Occupancy"
          value={formatPercent(data.occupancy.occupancyRate)}
          sub={`${data.occupancy.occupiedRooms}/${data.occupancy.totalRooms} rooms occupied`}
        />
        <StatCard label="ADR" value={formatCurrency(data.kpis.adr, cur)} sub="Average daily rate" />
        <StatCard label="RevPAR" value={formatCurrency(data.kpis.revpar, cur)} sub="Revenue per available room" />
        <StatCard
          label="Payments today"
          value={formatCurrency(data.kpis.paymentsToday, cur)}
          sub="Net collected"
          accent="text-emerald-600"
        />
      </div>

      {/* Movements + housekeeping */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Arrivals today" value={data.movements.arrivalsToday} accent="text-ink" />
        <StatCard label="Departures today" value={data.movements.departuresToday} accent="text-ink" />
        <StatCard label="In-house" value={data.movements.inHouse} accent="text-ink" />
        <StatCard
          label="Rooms to clean"
          value={data.housekeeping.dirtyRooms}
          sub={`${data.housekeeping.pendingTasks} pending tasks`}
          accent="text-amber-600"
        />
      </div>

      {/* Arrivals list */}
      <Card>
        <CardHeader
          title="Today's arrivals"
          subtitle="Confirmed reservations expected to check in"
          action={
            <Link href="/app/reservations" className="text-sm font-semibold text-brand-700">
              View all →
            </Link>
          }
        />
        {arrivals.length === 0 ? (
          <CardBody>
            <p className="py-6 text-center text-sm text-muted">No arrivals scheduled for today.</p>
          </CardBody>
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100">
                <Th>Guest</Th>
                <Th>Confirmation</Th>
                <Th>Room type</Th>
                <Th>Nights</Th>
                <Th>Status</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {arrivals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {initials(r.guest?.firstName, r.guest?.lastName)}
                      </div>
                      <span className="font-medium">{r.guest?.firstName} {r.guest?.lastName}</span>
                    </div>
                  </Td>
                  <Td className="font-mono text-xs text-muted">{r.confirmationNo}</Td>
                  <Td>{r.roomType?.name}</Td>
                  <Td>{r.nights}</Td>
                  <Td>
                    <Badge className={reservationColor(r.status)}>{labelize(r.status)}</Badge>
                  </Td>
                  <Td className="text-right font-semibold">{formatCurrency(r.totalAmount, r.currency)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

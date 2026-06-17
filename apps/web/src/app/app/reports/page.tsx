'use client';

import { useEffect, useState } from 'react';
import { api, qs } from '@/lib/api';
import { useProperty } from '@/components/shell';
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Input,
  Label,
  LoadingState,
  StatCard,
  Table,
  Td,
  Th,
} from '@/components/ui';
import { formatCurrency, formatDateShort, formatPercent, labelize } from '@/lib/format';

interface OccupancyResponse {
  from: string;
  to: string;
  days: number;
  summary: {
    avgOccupancy: number;
    adr: number;
    revpar: number;
    roomNightsSold: number;
    roomRevenue: number;
  };
  series: { date: string; occupied: number; total: number; rate: number }[];
}

interface RevenueResponse {
  total: number;
  byDay: { date: string; amount: number }[];
  byChannel: { channel: string; bookings: number; revenue: number }[];
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default function ReportsPage() {
  const { property } = useProperty();
  const init = defaultRange();
  const [from, setFrom] = useState(init.from);
  const [to, setTo] = useState(init.to);
  const [occupancy, setOccupancy] = useState<OccupancyResponse | null>(null);
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!property) return;
    setLoading(true);
    Promise.all([
      api.get<OccupancyResponse>(
        `/analytics/occupancy${qs({ propertyId: property.id, from, to })}`,
      ),
      api.get<RevenueResponse>(`/analytics/revenue${qs({ propertyId: property.id, from, to })}`),
    ])
      .then(([occ, rev]) => {
        setOccupancy(occ);
        setRevenue(rev);
      })
      .finally(() => setLoading(false));
  }, [property, from, to]);

  if (!property) return <LoadingState label="Loading property…" />;

  const cur = property.currency || 'USD';
  const series = occupancy?.series ?? [];
  const maxRate = series.reduce((m, s) => Math.max(m, s.rate), 0) || 1;
  const labelEvery = Math.max(1, Math.ceil(series.length / 12));

  const channels = [...(revenue?.byChannel ?? [])].sort((a, b) => b.revenue - a.revenue);
  const maxChannelRev = channels.reduce((m, c) => Math.max(m, c.revenue), 0) || 1;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeaderRow from={from} to={to} setFrom={setFrom} setTo={setTo} />

      {loading || !occupancy || !revenue ? (
        <LoadingState label="Loading analytics…" />
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Avg occupancy" value={formatPercent(occupancy.summary.avgOccupancy)} />
            <StatCard label="ADR" value={formatCurrency(occupancy.summary.adr, cur)} sub="Average daily rate" />
            <StatCard
              label="RevPAR"
              value={formatCurrency(occupancy.summary.revpar, cur)}
              sub="Revenue per available room"
            />
            <StatCard
              label="Total revenue"
              value={formatCurrency(revenue.total, cur)}
              accent="text-emerald-600"
            />
            <StatCard label="Room nights sold" value={occupancy.summary.roomNightsSold} />
          </div>

          {/* Occupancy chart */}
          <Card>
            <CardHeader title="Occupancy trend" subtitle={`${formatDateShort(occupancy.from)} – ${formatDateShort(occupancy.to)}`} />
            <CardBody>
              {series.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">No occupancy data for this range.</p>
              ) : (
                <div className="flex h-56 items-end gap-1 overflow-x-auto">
                  {series.map((s, i) => (
                    <div key={s.date} className="flex min-w-[10px] flex-1 flex-col items-center gap-2">
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className="w-full rounded-t bg-brand-500 transition-all hover:bg-brand-600"
                          style={{ height: `${Math.max(2, (s.rate / maxRate) * 100)}%` }}
                          title={`${formatDateShort(s.date)}: ${formatPercent(s.rate)} (${s.occupied}/${s.total})`}
                        />
                      </div>
                      <span className="h-3 whitespace-nowrap text-[9px] text-muted">
                        {i % labelEvery === 0 ? formatDateShort(s.date) : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Revenue by channel */}
          <Card>
            <CardHeader title="Revenue by channel" subtitle="Bookings and revenue per distribution channel" />
            {channels.length === 0 ? (
              <CardBody>
                <EmptyState title="No channel revenue" description="No revenue recorded for this range." />
              </CardBody>
            ) : (
              <Table>
                <thead>
                  <tr className="border-b border-slate-100">
                    <Th>Channel</Th>
                    <Th>Bookings</Th>
                    <Th className="w-1/2">Revenue</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {channels.map((c) => (
                    <tr key={c.channel} className="hover:bg-slate-50">
                      <Td className="font-medium">{labelize(c.channel)}</Td>
                      <Td>{c.bookings}</Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-brand-500"
                              style={{ width: `${(c.revenue / maxChannelRev) * 100}%` }}
                            />
                          </div>
                          <span className="w-24 text-right font-semibold">
                            {formatCurrency(c.revenue, cur)}
                          </span>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function PageHeaderRow({
  from,
  to,
  setFrom,
  setTo,
}: {
  from: string;
  to: string;
  setFrom: (v: string) => void;
  setTo: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-ink">Reports &amp; Analytics</h1>
        <p className="mt-0.5 text-sm text-muted">Occupancy and revenue performance</p>
      </div>
      <div className="flex items-end gap-3">
        <div>
          <Label htmlFor="from">From</Label>
          <Input id="from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="to">To</Label>
          <Input id="to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

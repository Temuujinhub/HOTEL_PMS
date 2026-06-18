'use client';

import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { publicApi, money, type PublicProperty } from '@/lib/public-api';
import { HotelHeader, HotelFooter } from '@/components/hotel/chrome';
import { Check } from '@/components/landing/icons';

type Lookup = {
  confirmationNo: string;
  status: string;
  guestName: string;
  roomType: string | null;
  roomNumber: string | null;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  currency: string;
  totalAmount: number;
  propertyName: string;
};

export default function ConfirmationPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>}>
      <ConfirmationInner slug={params.slug} />
    </Suspense>
  );
}

function ConfirmationInner({ slug }: { slug: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const no = sp.get('no') || '';
  const ln = sp.get('ln') || '';

  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [data, setData] = useState<Lookup | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(no && ln));
  const [fNo, setFNo] = useState(no);
  const [fLn, setFLn] = useState(ln);

  useEffect(() => {
    publicApi.property(slug).then((d) => setProperty(d.property)).catch(() => undefined);
  }, [slug]);

  useEffect(() => {
    if (!no || !ln) return;
    setLoading(true);
    publicApi
      .lookup(slug, no, ln)
      .then((d) => {
        setData(d);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, no, ln]);

  function find(e: FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams({ no: fNo.trim(), ln: fLn.trim() });
    router.push(`/h/${slug}/confirmation?${p.toString()}`);
  }

  return (
    <div className="min-h-screen bg-white">
      {property && <HotelHeader property={property} slug={slug} />}
      <main className="mx-auto max-w-2xl px-6 py-12 lg:px-8">
        {data ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <h1 className="font-display mt-5 text-2xl font-bold text-slate-900">Booking confirmed</h1>
            <p className="mt-1 text-slate-600">Thank you, {data.guestName}. Show this confirmation number at check-in.</p>

            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Confirmation number</p>
              <p className="font-display text-2xl font-bold tracking-tight text-gradient">{data.confirmationNo}</p>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <Row label="Hotel" value={data.propertyName} />
              <Row label="Room" value={data.roomType ?? '—'} />
              <Row label="Check-in" value={data.checkInDate} />
              <Row label="Check-out" value={data.checkOutDate} />
              <Row label="Nights" value={String(data.nights)} />
              <Row label="Status" value={data.status} />
              <Row label="Total (pay at hotel)" value={money(data.totalAmount, data.currency)} />
            </dl>

            <p className="mt-6 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-slate-700">
              On arrival, use the lobby kiosk or reception: enter{' '}
              <span className="font-semibold text-brand-700">{data.confirmationNo}</span> and your last name to check in
              and collect your room key.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
            <h1 className="font-display text-2xl font-bold text-slate-900">Find my booking</h1>
            <p className="mt-1 text-slate-600">Enter your confirmation number and last name.</p>
            {loading && <p className="mt-4 text-slate-500">Looking up…</p>}
            {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <form onSubmit={find} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Confirmation number</span>
                <input
                  value={fNo}
                  onChange={(e) => setFNo(e.target.value)}
                  required
                  placeholder="CR-XXXXXX"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Last name</span>
                <input
                  value={fLn}
                  onChange={(e) => setFLn(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <button className="rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5">
                Find booking
              </button>
            </form>
          </div>
        )}
      </main>
      {property && <HotelFooter property={property} slug={slug} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
    </div>
  );
}

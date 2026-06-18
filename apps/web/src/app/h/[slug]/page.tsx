'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  publicApi,
  isoDate,
  addDays,
  money,
  type PublicProperty,
  type PublicRoomType,
} from '@/lib/public-api';
import { HotelHeader, HotelFooter } from '@/components/hotel/chrome';

export default function HotelHome({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const [data, setData] = useState<{ property: PublicProperty; roomTypes: PublicRoomType[] } | null>(null);
  const [error, setError] = useState('');

  const today = new Date();
  const [checkIn, setCheckIn] = useState(isoDate(addDays(today, 1)));
  const [checkOut, setCheckOut] = useState(isoDate(addDays(today, 3)));
  const [adults, setAdults] = useState(2);

  useEffect(() => {
    publicApi.property(slug).then(setData).catch((e) => setError(e.message));
  }, [slug]);

  function search(e: FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams({ checkIn, checkOut, adults: String(adults) });
    router.push(`/h/${slug}/book?${p.toString()}`);
  }

  if (error) return <Center title="Hotel not found" body="Please check the link and try again." />;
  if (!data) return <Center title="Loading…" />;

  const { property, roomTypes } = data;
  const fromRate = roomTypes.length ? Math.min(...roomTypes.map((r) => r.baseRate)) : 0;

  return (
    <div className="min-h-screen bg-white">
      <HotelHeader property={property} slug={slug} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {property.heroImageUrl && <img src={property.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/80 via-brand-800/55 to-fuchsia-700/40" />
        <div className="relative mx-auto max-w-content px-6 py-24 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-white/80">{[property.city, property.country].filter(Boolean).join(', ')}</p>
            <h1 className="font-display mt-2 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              {property.name}
            </h1>
            {property.description && <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{property.description}</p>}
            {fromRate > 0 && (
              <p className="mt-4 text-white/80">
                Rooms from <span className="font-display text-xl font-bold text-white">{money(fromRate, property.currency)}</span> / night
              </p>
            )}
          </div>

          <form
            onSubmit={search}
            className="glass-card mt-10 grid gap-4 rounded-2xl p-5 shadow-lift sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
          >
            <Field label="Check-in">
              <input
                type="date"
                value={checkIn}
                min={isoDate(today)}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </Field>
            <Field label="Check-out">
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </Field>
            <Field label="Guests">
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </Field>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              Search rooms
            </button>
          </form>
        </div>
      </section>

      {/* Rooms */}
      <section className="mx-auto max-w-content px-6 py-16 lg:px-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Our rooms</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roomTypes.map((rt) => (
            <article
              key={rt.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                {rt.photos?.[0] && <img src={rt.photos[0]} alt={rt.name} className="h-full w-full object-cover" />}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-slate-900">{rt.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{rt.bedType ? `${rt.bedType} · ` : ''}Sleeps {rt.maxOccupancy}</p>
                <p className="mt-3">
                  <span className="font-display text-xl font-bold text-gradient">{money(rt.baseRate, property.currency)}</span>
                  <span className="text-sm text-slate-500"> / night</span>
                </p>
                <button
                  onClick={() => {
                    const p = new URLSearchParams({ checkIn, checkOut, adults: String(adults) });
                    router.push(`/h/${slug}/book?${p.toString()}`);
                  }}
                  className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-brand-500 hover:text-brand-600"
                >
                  Check availability
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <HotelFooter property={property} slug={slug} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Center({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="font-display text-2xl font-bold text-slate-900">{title}</h1>
      {body && <p className="mt-2 text-slate-600">{body}</p>}
    </div>
  );
}

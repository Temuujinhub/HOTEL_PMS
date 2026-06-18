'use client';
/* eslint-disable @next/next/no-img-element */

import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  publicApi,
  isoDate,
  addDays,
  money,
  type PublicProperty,
  type PublicRoomType,
} from '@/lib/public-api';
import { HotelHeader, HotelFooter } from '@/components/hotel/chrome';

export default function BookPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>}>
      <BookInner slug={params.slug} />
    </Suspense>
  );
}

function BookInner({ slug }: { slug: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const today = new Date();
  const checkIn = sp.get('checkIn') || isoDate(addDays(today, 1));
  const checkOut = sp.get('checkOut') || isoDate(addDays(today, 3));
  const adults = Number(sp.get('adults') || 2);

  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [rooms, setRooms] = useState<PublicRoomType[] | null>(null);
  const [nights, setNights] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<PublicRoomType | null>(null);

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', specialRequests: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    publicApi.property(slug).then((d) => setProperty(d.property)).catch(() => undefined);
    setRooms(null);
    setError('');
    publicApi
      .availability(slug, { checkInDate: checkIn, checkOutDate: checkOut, adults })
      .then((a) => {
        setRooms(a.roomTypes);
        setNights(a.nights);
        setCurrency(a.currency);
      })
      .catch((e) => setError(e.message));
  }, [slug, checkIn, checkOut, adults]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setFormError('');
    try {
      const res = await publicApi.book(slug, {
        roomTypeId: selected.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        adults,
        specialRequests: form.specialRequests || undefined,
      });
      const p = new URLSearchParams({ no: res.confirmationNo, ln: form.lastName });
      router.push(`/h/${slug}/confirmation?${p.toString()}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Booking failed');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {property && <HotelHeader property={property} slug={slug} />}
      <main className="mx-auto max-w-content px-6 py-10 lg:px-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Choose your room</h1>
        <p className="mt-1 text-sm text-slate-500">
          {checkIn} → {checkOut}
          {nights ? ` · ${nights} night${nights > 1 ? 's' : ''}` : ''} · {adults} guest{adults > 1 ? 's' : ''}
        </p>

        {error && <Notice>{error}</Notice>}
        {!rooms && !error && <p className="mt-8 text-slate-500">Searching availability…</p>}
        {rooms && rooms.length === 0 && <Notice>No rooms available for those dates — please try different dates.</Notice>}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {rooms?.map((rt) => (
            <article
              key={rt.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-card transition ${
                selected?.id === rt.id ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200'
              }`}
            >
              <div className="aspect-[4/3] bg-slate-100">
                {rt.photos?.[0] && <img src={rt.photos[0]} alt={rt.name} className="h-full w-full object-cover" />}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-slate-900">{rt.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {rt.bedType ? `${rt.bedType} · ` : ''}Sleeps {rt.maxOccupancy} · {rt.available} left
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="font-display text-xl font-bold text-gradient">
                      {money(rt.totalPrice ?? rt.baseRate, currency)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {money(rt.nightlyRate ?? rt.baseRate, currency)} × {nights} night{nights > 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(rt)}
                    className="rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {selected && (
          <form onSubmit={submit} className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="font-display text-xl font-bold text-slate-900">Guest details</h2>
            <p className="mt-1 text-sm text-slate-500">
              {selected.name} · <span className="font-semibold text-slate-700">{money(selected.totalPrice ?? 0, currency)}</span> total · pay at the hotel
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="First name"><Input value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} required /></Field>
              <Field label="Last name"><Input value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} required /></Field>
              <Field label="Email"><Input type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /></Field>
            </div>
            <div className="mt-4">
              <Field label="Special requests (optional)">
                <textarea
                  rows={3}
                  value={form.specialRequests}
                  onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </Field>
            </div>
            {formError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
            <button
              disabled={submitting}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-3 text-[15px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto"
            >
              {submitting ? 'Confirming…' : 'Confirm reservation'}
            </button>
            <p className="mt-2 text-xs text-slate-400">No payment required now — pay at the hotel on arrival.</p>
          </form>
        )}
      </main>
      {property && <HotelFooter property={property} slug={slug} />}
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{children}</div>;
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}
function Input({
  value,
  onChange,
  type = 'text',
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
    />
  );
}

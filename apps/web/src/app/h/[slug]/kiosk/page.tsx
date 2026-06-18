'use client';
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  publicApi,
  type KioskCheckInResult,
  type KioskLookup,
  type PublicProperty,
} from '@/lib/public-api';
import { ArrowRight, Check, Clock, CreditCard, Key, ShieldCheck, Sparkles } from '@/components/landing/icons';

type Step = 'welcome' | 'identify' | 'review' | 'done';

export default function KioskPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [step, setStep] = useState<Step>('welcome');
  const [confirmationNo, setConfirmationNo] = useState('');
  const [lastName, setLastName] = useState('');
  const [lookup, setLookup] = useState<KioskLookup | null>(null);
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [credentialType, setCredentialType] = useState<'rfid_card' | 'pin_code'>('rfid_card');
  const [passportNo, setPassportNo] = useState('');
  const [result, setResult] = useState<KioskCheckInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    publicApi.property(slug).then((d) => setProperty(d.property)).catch(() => undefined);
  }, [slug]);

  const reset = useCallback(() => {
    setStep('welcome');
    setConfirmationNo('');
    setLastName('');
    setLookup(null);
    setRoomId(undefined);
    setCredentialType('rfid_card');
    setPassportNo('');
    setResult(null);
    setError('');
  }, []);

  // Auto-return to the welcome screen after a completed check-in.
  useEffect(() => {
    if (step !== 'done') return;
    const t = setTimeout(reset, 30_000);
    return () => clearTimeout(t);
  }, [step, reset]);

  async function find(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const d = await publicApi.kioskLookup(slug, {
        confirmationNo: confirmationNo.trim(),
        lastName: lastName.trim(),
      });
      setLookup(d);
      setRoomId(d.assignedRoom?.id);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  }

  async function checkIn() {
    setLoading(true);
    setError('');
    try {
      const r = await publicApi.kioskCheckIn(slug, {
        confirmationNo: confirmationNo.trim(),
        lastName: lastName.trim(),
        roomId,
        credentialType,
        passportNo: passportNo.trim() || undefined,
      });
      setResult(r);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-fuchsia-800 text-white">
      {/* Animated aurora blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl animate-blob" />
        <div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-fuchsia-500/30 blur-3xl animate-blob [animation-delay:4s]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl animate-blob [animation-delay:8s]" />
      </div>

      {/* Brand bar */}
      <header className="relative z-10 flex items-center justify-center gap-3 px-6 pt-10">
        {property?.logoUrl ? (
          <img src={property.logoUrl} alt={property.name} className="h-9 w-auto" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold backdrop-blur">
            {property?.name?.charAt(0) ?? '·'}
          </span>
        )}
        <span className="font-display text-xl font-bold tracking-tight">{property?.name ?? 'Self check-in'}</span>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        {step === 'welcome' && <Welcome hotel={property?.name} onStart={() => setStep('identify')} />}
        {step === 'identify' && (
          <Identify
            confirmationNo={confirmationNo}
            lastName={lastName}
            setConfirmationNo={setConfirmationNo}
            setLastName={setLastName}
            loading={loading}
            error={error}
            onBack={reset}
            onSubmit={find}
          />
        )}
        {step === 'review' && lookup && (
          <Review
            lookup={lookup}
            roomId={roomId}
            setRoomId={setRoomId}
            credentialType={credentialType}
            setCredentialType={setCredentialType}
            passportNo={passportNo}
            setPassportNo={setPassportNo}
            loading={loading}
            error={error}
            onBack={reset}
            onConfirm={checkIn}
          />
        )}
        {step === 'done' && result && <Done result={result} onDone={reset} />}
      </main>

      <footer className="relative z-10 pb-8 text-center text-sm text-white/50">
        Powered by Cloud MASTR PMS
      </footer>
    </div>
  );
}

// --- Steps ------------------------------------------------------------------

function Welcome({ hotel, onStart }: { hotel?: string; onStart: () => void }) {
  return (
    <div className="animate-fade-in text-center">
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white/10 ring-1 ring-white/20 backdrop-blur">
        <Key className="h-14 w-14" strokeWidth={1.6} />
      </div>
      <h1 className="font-display mt-8 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
        Welcome{hotel ? <> to<br />{hotel}</> : ''}
      </h1>
      <p className="mx-auto mt-5 max-w-md text-lg text-white/75">
        Check in and collect your room key in under a minute — no queue, no waiting.
      </p>
      <button
        onClick={onStart}
        className="group mt-12 inline-flex items-center gap-3 rounded-2xl bg-white px-12 py-6 text-xl font-bold text-brand-700 shadow-glow transition hover:-translate-y-1 active:translate-y-0"
      >
        Start check-in
        <ArrowRight className="h-6 w-6 transition group-hover:translate-x-1" />
      </button>
      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-white/55">
        <ShieldCheck className="h-4 w-4" /> Secure · your details are encrypted
      </p>
    </div>
  );
}

function Identify({
  confirmationNo,
  lastName,
  setConfirmationNo,
  setLastName,
  loading,
  error,
  onBack,
  onSubmit,
}: {
  confirmationNo: string;
  lastName: string;
  setConfirmationNo: (v: string) => void;
  setLastName: (v: string) => void;
  loading: boolean;
  error: string;
  onBack: () => void;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="animate-fade-in w-full max-w-xl rounded-3xl bg-white p-8 text-slate-900 shadow-lift sm:p-10">
      <h2 className="font-display text-3xl font-bold tracking-tight">Find your booking</h2>
      <p className="mt-2 text-slate-500">Enter your confirmation number and last name.</p>

      <div className="mt-8 space-y-5">
        <KioskField label="Confirmation number">
          <input
            value={confirmationNo}
            onChange={(e) => setConfirmationNo(e.target.value.toUpperCase())}
            required
            autoFocus
            autoCapitalize="characters"
            placeholder="CR-XXXXXXXX"
            className="w-full rounded-2xl border-2 border-slate-200 px-5 py-4 text-2xl font-semibold tracking-wide outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </KioskField>
        <KioskField label="Last name">
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full rounded-2xl border-2 border-slate-200 px-5 py-4 text-2xl font-semibold outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </KioskField>
      </div>

      {error && <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-rose-700">{error}</p>}

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border-2 border-slate-200 px-6 py-4 text-lg font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Back
        </button>
        <button
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-4 text-lg font-bold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? 'Searching…' : 'Find booking'}
          {!loading && <ArrowRight className="h-5 w-5" />}
        </button>
      </div>
    </form>
  );
}

function Review({
  lookup,
  roomId,
  setRoomId,
  credentialType,
  setCredentialType,
  passportNo,
  setPassportNo,
  loading,
  error,
  onBack,
  onConfirm,
}: {
  lookup: KioskLookup;
  roomId: string | undefined;
  setRoomId: (v: string | undefined) => void;
  credentialType: 'rfid_card' | 'pin_code';
  setCredentialType: (v: 'rfid_card' | 'pin_code') => void;
  passportNo: string;
  setPassportNo: (v: string) => void;
  loading: boolean;
  error: string;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const blocked = lookup.alreadyCheckedIn || !lookup.canCheckIn;
  const firstName = lookup.guestName.split(' ')[0];

  return (
    <div className="animate-fade-in w-full max-w-2xl rounded-3xl bg-white p-8 text-slate-900 shadow-lift sm:p-10">
      <p className="text-sm font-medium uppercase tracking-wider text-brand-600">Welcome back</p>
      <h2 className="font-display text-3xl font-bold tracking-tight">Hello, {firstName}</h2>

      {/* Stay summary */}
      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-5 text-sm sm:grid-cols-4">
        <Summary label="Room type" value={lookup.roomType ?? '—'} />
        <Summary label="Check-in" value={fmtDate(lookup.checkInDate)} />
        <Summary label="Check-out" value={fmtDate(lookup.checkOutDate)} />
        <Summary label="Nights" value={String(lookup.nights)} />
      </dl>

      {blocked ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
          {lookup.alreadyCheckedIn
            ? 'This booking is already checked in. Please see the front desk for your key.'
            : `This booking can’t be self-checked-in (status: ${lookup.status}). Please see the front desk.`}
        </div>
      ) : (
        <>
          {/* Room selection */}
          <Section title="Choose your room" hint={lookup.assignedRoom ? 'A room is reserved for you' : 'Pick a room or let us choose'}>
            <div className="grid max-h-56 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
              <RoomTile
                active={roomId === undefined}
                onClick={() => setRoomId(undefined)}
                title="Any room"
                subtitle="We’ll pick the best one"
              />
              {lookup.availableRooms.map((r) => (
                <RoomTile
                  key={r.id}
                  active={roomId === r.id}
                  onClick={() => setRoomId(r.id)}
                  title={`Room ${r.roomNumber}`}
                  subtitle={r.floor != null ? `Floor ${r.floor}` : ''}
                />
              ))}
            </div>
          </Section>

          {/* Key type */}
          <Section title="How would you like your key?">
            <div className="grid grid-cols-2 gap-3">
              <KeyChoice
                active={credentialType === 'rfid_card'}
                onClick={() => setCredentialType('rfid_card')}
                icon={<CreditCard className="h-7 w-7" />}
                title="Room card"
                subtitle="Tap to unlock"
              />
              <KeyChoice
                active={credentialType === 'pin_code'}
                onClick={() => setCredentialType('pin_code')}
                icon={<Key className="h-7 w-7" />}
                title="PIN code"
                subtitle="Type on the keypad"
              />
            </div>
          </Section>

          {/* Passport (optional) */}
          <Section title="Passport / ID (optional)" hint="Required by law in some regions — stored securely, encrypted">
            <input
              value={passportNo}
              onChange={(e) => setPassportNo(e.target.value)}
              placeholder="Passport or ID number"
              className="w-full rounded-2xl border-2 border-slate-200 px-5 py-4 text-lg outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </Section>
        </>
      )}

      {error && <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-rose-700">{error}</p>}

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border-2 border-slate-200 px-6 py-4 text-lg font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        {!blocked && (
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-4 text-lg font-bold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? 'Encoding your key…' : 'Check in & get my key'}
            {!loading && <Key className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

function Done({ result, onDone }: { result: KioskCheckInResult; onDone: () => void }) {
  const firstName = result.guestName.split(' ')[0];
  const isPin = result.credential.type === 'PIN_CODE';

  return (
    <div className="animate-fade-in w-full max-w-xl text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-glow">
        <Check className="h-12 w-12" strokeWidth={2.5} />
      </div>
      <h2 className="font-display mt-7 text-4xl font-bold tracking-tight sm:text-5xl">You’re checked in!</h2>
      <p className="mt-3 text-lg text-white/75">Enjoy your stay, {firstName}.</p>

      <div className="mt-8 rounded-3xl bg-white p-8 text-slate-900 shadow-lift">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Your room</p>
        <p className="font-display text-6xl font-bold text-gradient">{result.room.roomNumber}</p>
        {result.room.floor != null && <p className="mt-1 text-slate-500">Floor {result.room.floor}</p>}

        <div className="my-6 h-px bg-slate-100" />

        {isPin ? (
          <div>
            <p className="flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-wider text-slate-400">
              <Key className="h-4 w-4" /> Your door PIN
            </p>
            <p className="font-display mt-2 text-5xl font-bold tracking-[0.3em] text-slate-900">
              {result.credential.pinCode}
            </p>
            <p className="mt-2 text-sm text-slate-500">Enter this on the keypad, then press the unlock key.</p>
          </div>
        ) : (
          <div>
            <p className="flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-wider text-slate-400">
              <CreditCard className="h-4 w-4" /> Your room card is ready
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-800">Please take your card from the dispenser below.</p>
            {result.credential.cardId && (
              <p className="mt-1 text-xs tracking-wider text-slate-400">Card #{result.credential.cardId}</p>
            )}
          </div>
        )}

        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" /> Check out by {fmtDate(result.checkOutDate)} · {result.checkOutTime}
        </p>
      </div>

      <button
        onClick={onDone}
        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-10 py-4 text-lg font-bold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25"
      >
        <Sparkles className="h-5 w-5" /> Done
      </button>
    </div>
  );
}

// --- Small building blocks --------------------------------------------------

function KioskField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mt-7">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function RoomTile({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border-2 p-4 text-left transition ${
        active ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300'
      }`}
    >
      <p className="font-display text-lg font-bold text-slate-900">{title}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </button>
  );
}

function KeyChoice({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition ${
        active ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300'
      }`}
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          active ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block font-display text-lg font-bold text-slate-900">{title}</span>
        <span className="block text-xs text-slate-500">{subtitle}</span>
      </span>
    </button>
  );
}

function fmtDate(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

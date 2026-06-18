import Link from 'next/link';
import { ArrowRight, Star } from './icons';

const STATS = [
  { num: '300+', label: 'OTA integrations' },
  { num: '24/7', label: 'Self check-in' },
  { num: '99.9%', label: 'Uptime SLA' },
  { num: '30%', label: 'Less front-desk load' },
];

const ROOM_CELLS = [
  'occ', 'occ', 'in', 'clean',
  'occ', 'occ', 'free', 'occ',
  'in', 'occ', 'occ', 'clean',
  'occ', 'free', 'occ', 'occ',
];

const ROOM_COLOR: Record<string, string> = {
  occ: 'bg-emerald-100',
  in: 'bg-brand-100',
  clean: 'bg-accent-soft',
  free: 'bg-slate-100',
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-6 pb-20 pt-28 sm:pt-32 lg:px-8 lg:pt-40">
      {/* subtle backdrop */}
      <div className="bg-dotgrid pointer-events-none absolute inset-x-0 top-0 h-[420px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(30,58,110,0.07),transparent)]" />

      <div className="relative mx-auto grid max-w-content items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* Left column */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            New in 2026 — hospitality, reinvented
          </span>

          <h1 className="mt-6 text-[2.5rem] font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
            Run your property,
            <br className="hidden sm:block" /> <span className="text-brand-600">around the clock</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Self check-in, smart locks, a channel manager wired to 300+ OTAs, and a mobile
            housekeeping app — unified in one real-time cloud platform that runs 24/7, with or
            without a front desk.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-brand-900 px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Start free trial
            </Link>
            <a
              href="#contact"
              className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-6 py-3.5 text-[15px] font-semibold text-slate-800 transition-colors hover:border-slate-900 hover:bg-slate-50"
            >
              Book a demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex text-accent" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4" />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">4.9/5</span> from hoteliers worldwide
            </p>
          </div>

          {/* Stats */}
          <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 border-t border-slate-100 pt-8 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="tnum block text-2xl font-bold tracking-tight text-slate-900">
                    {s.num}
                  </span>
                  <span className="mt-1 block text-xs font-medium leading-tight text-slate-500">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right column — product mockup */}
        <div className="animate-fade-up hidden md:block [animation-delay:120ms]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                </span>
                <span className="ml-1 text-xs font-medium text-slate-500">Cloud PMS · Reception</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <MockCard label="Occupancy" value="87%" sub="+12% vs last month" />
                <MockCard label="RevPAR" value="$142" sub="+8% growth" />
                <MockCard label="Arrivals today" value="24" sub="8 checked in" />
                <MockCard label="ADR" value="$163" sub="On target" />
              </div>

              <p className="mb-2 mt-5 text-xs font-medium text-slate-400">Room status — Floor 1</p>
              <div className="grid grid-cols-8 gap-1.5">
                {ROOM_CELLS.map((c, i) => (
                  <span key={i} className={`h-7 rounded-md ${ROOM_COLOR[c]}`} />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                <Legend color="bg-emerald-100" label="Occupied" />
                <Legend color="bg-brand-100" label="Check-in today" />
                <Legend color="bg-accent-soft" label="Cleaning" />
                <Legend color="bg-slate-100" label="Available" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="tnum mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-emerald-600">{sub}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
      <span className={`inline-block h-2.5 w-2.5 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

import Link from 'next/link';
import { ArrowRight, Star, Bolt } from './icons';

const STATS = [
  { num: '300+', label: 'OTA integrations' },
  { num: '24/7', label: 'Self check-in' },
  { num: '99.9%', label: 'Uptime SLA' },
  { num: '30%', label: 'Less front-desk load' },
];

const ROOM_CELLS = [
  'occ', 'occ', 'in', 'clean', 'occ', 'occ', 'free', 'occ',
  'in', 'occ', 'occ', 'clean', 'occ', 'free', 'occ', 'occ',
];

const ROOM_COLOR: Record<string, string> = {
  occ: 'bg-emerald-200',
  in: 'bg-brand-200',
  clean: 'bg-fuchsia-200',
  free: 'bg-slate-100',
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-6 pb-24 pt-28 sm:pt-32 lg:px-8 lg:pt-40">
      {/* Animated aurora backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand-400/40 blur-3xl animate-blob" />
        <div
          className="absolute -right-16 top-0 h-[26rem] w-[26rem] rounded-full bg-fuchsia-300/40 blur-3xl animate-blob"
          style={{ animationDelay: '3s' }}
        />
        <div
          className="absolute left-1/3 top-40 h-[24rem] w-[24rem] rounded-full bg-cyan-300/30 blur-3xl animate-blob"
          style={{ animationDelay: '6s' }}
        />
      </div>

      <div className="relative mx-auto grid max-w-content items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* Left */}
        <div className="animate-fade-up">
          <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <Bolt className="h-3.5 w-3.5 text-violet-600" />
            The digital upgrade for modern hospitality
          </span>

          <h1 className="font-display mt-6 text-[2.75rem] font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-6xl lg:text-[4.25rem]">
            Run your property on{' '}
            <span className="text-gradient">autopilot</span>, around the clock
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Self check-in, smart locks, a channel manager wired to 300+ OTAs, and a mobile
            housekeeping app — unified in one real-time platform that runs 24/7, with or without a
            front desk.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-7 py-3.5 text-[15px] font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
            >
              Start free trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#contact"
              className="glass inline-flex items-center gap-1.5 rounded-xl px-7 py-3.5 text-[15px] font-semibold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5"
            >
              Book a demo
            </a>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex text-amber-400" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4" />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">4.9/5</span> from hoteliers worldwide
            </p>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="font-display tnum block text-2xl font-bold tracking-tight text-slate-900">
                    {s.num}
                  </span>
                  <span className="mt-1 block text-xs font-medium leading-tight text-slate-500">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right — floating glass product mockup */}
        <div className="animate-fade-up relative hidden md:block" style={{ animationDelay: '140ms' }}>
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-brand-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl" aria-hidden />
          <div className="animate-float relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-lift backdrop-blur-xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-3.5">
              <span className="text-sm font-semibold text-white">Cloud PMS · Reception</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
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
                <Legend color="bg-emerald-200" label="Occupied" />
                <Legend color="bg-brand-200" label="Check-in today" />
                <Legend color="bg-fuchsia-200" label="Cleaning" />
                <Legend color="bg-slate-100" label="Available" />
              </div>
            </div>
          </div>

          {/* floating accent badge */}
          <div
            className="animate-float absolute -bottom-5 -left-6 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-glow backdrop-blur-xl"
            style={{ animationDelay: '1.2s' }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
              <Bolt className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-sm font-bold leading-none text-slate-900">+18% RevPAR</p>
              <p className="mt-1 text-[11px] text-slate-500">after 60 days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="font-display tnum mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
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

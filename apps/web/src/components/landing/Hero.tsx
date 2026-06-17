import Link from 'next/link';

const STATS = [
  { num: '300+', label: 'OTA integrations' },
  { num: '24/7', label: 'Self check-in' },
  { num: '99.9%', label: 'Uptime SLA' },
  { num: '30%', label: 'Less front-desk load' },
];

const ROOM_CELLS = [
  'green', 'green', 'blue', 'orange',
  'green', 'green', 'gray', 'green',
  'blue', 'green', 'green', 'orange',
  'green', 'gray', 'green', 'green',
];

const ROOM_COLOR: Record<string, string> = {
  green: 'bg-emerald-200',
  blue: 'bg-blue-200',
  orange: 'bg-orange-200',
  gray: 'bg-slate-100',
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-blue-100 to-violet-100 px-5 pb-20 pt-28 sm:px-8 sm:pt-32 lg:pt-36">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(27,79,138,0.10)_0%,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left column */}
        <div className="animate-fade-in">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3.5 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-700/10">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            2026 — Hotel management, reinvented
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
            Run your hotel <span className="text-brand-700">smartly</span>, around the clock
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Self check-in, smart locks, a channel manager wired to 300+ OTAs, and a mobile
            housekeeping app — all unified in one real-time cloud platform that keeps running
            24/7, with or without a front desk.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/signup"
              className="rounded-xl bg-brand-700 px-8 py-4 text-base font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-brand-600"
            >
              Start free trial
            </Link>
            <a
              href="#contact"
              className="rounded-xl border-2 border-brand-700 px-8 py-4 text-base font-semibold text-brand-700 transition hover:bg-brand-700 hover:text-white"
            >
              Book a demo
            </a>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-3xl font-extrabold text-brand-700">{s.num}</span>
                  <span className="mt-0.5 block text-xs font-medium text-muted">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right column — dashboard mockup (hidden under md) */}
        <div className="hidden md:block">
          <div className="overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-slate-200/60">
            <div className="flex items-center justify-between bg-brand-700 px-5 py-4">
              <span className="text-sm font-semibold text-white">Cloud PMS — Reception Dashboard</span>
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
            </div>
            <div className="bg-slate-50 p-5">
              <div className="mb-4 grid grid-cols-2 gap-3">
                <MockCard label="Occupancy" value="87%" sub="+12% vs last month" />
                <MockCard label="RevPAR" value="$142" sub="+8% growth" />
                <MockCard label="Arrivals today" value="24" sub="8 checked in" />
                <MockCard label="ADR" value="$163" sub="On target" />
              </div>
              <p className="mb-2 text-xs text-slate-400">Room status — Floor 1</p>
              <div className="grid grid-cols-8 gap-1">
                {ROOM_CELLS.map((c, i) => (
                  <span key={i} className={`h-7 rounded ${ROOM_COLOR[c]}`} />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                <Legend color="bg-emerald-200" label="Occupied" />
                <Legend color="bg-blue-200" label="Check-in today" />
                <Legend color="bg-orange-200" label="Cleaning" />
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
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-brand-700">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-emerald-600">{sub}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-muted">
      <span className={`inline-block h-2.5 w-2.5 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

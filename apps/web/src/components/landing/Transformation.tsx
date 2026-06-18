import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import { Check, Close, ArrowRight } from './icons';

const BEFORE = [
  'Long queues at the front desk',
  'Double bookings across OTAs',
  'Housekeeping coordinated by phone calls',
  'Spreadsheets, guesswork and manual rates',
  'No visibility after midnight',
];

const AFTER = [
  '24/7 self check-in — no waiting',
  'Real-time sync, zero double bookings',
  'Auto-assigned housekeeping with photo proof',
  'Live KPIs, forecasts and AI dynamic pricing',
  'Runs itself, around the clock',
];

export default function Transformation() {
  return (
    <section className="relative overflow-hidden bg-slate-50 px-6 py-24 sm:py-28 lg:px-8">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative mx-auto max-w-content">
        <Reveal>
          <SectionHeading
            center
            label="Digital transformation"
            title={
              <>
                From front-desk chaos to a <span className="text-gradient">self-running</span> property
              </>
            }
            subtitle="Replace the manual, after-hours scramble with one platform that handles it for you."
          />
        </Reveal>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* Before */}
          <Reveal>
            <div className="h-full rounded-3xl border border-slate-200 bg-white p-8 grayscale">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Before</p>
              <h3 className="font-display mt-2 text-xl font-bold text-slate-500">Without Cloud MASTR PMS</h3>
              <ul className="mt-6 space-y-3.5">
                {BEFORE.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-[15px] text-slate-500">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Close className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Arrow */}
          <Reveal delay={120} className="flex items-center justify-center">
            <span className="flex h-12 w-12 rotate-90 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-fuchsia-600 text-white shadow-glow lg:rotate-0">
              <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
            </span>
          </Reveal>

          {/* After */}
          <Reveal delay={200}>
            <div className="relative h-full rounded-3xl p-[1.5px]">
              <div className="gradient-ring absolute inset-0 rounded-3xl" aria-hidden />
              <div className="glass-card relative h-full rounded-3xl p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">After</p>
                <h3 className="font-display mt-2 text-xl font-bold text-slate-900">With Cloud MASTR PMS</h3>
                <ul className="mt-6 space-y-3.5">
                  {AFTER.map((a) => (
                    <li key={a} className="flex items-start gap-3 text-[15px] font-medium text-slate-800">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

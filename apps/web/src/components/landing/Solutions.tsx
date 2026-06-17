'use client';

import { useState } from 'react';
import SectionHeading from './SectionHeading';

type Solution = {
  id: string;
  tab: string;
  heading: string;
  features: string[];
  kpis: { val: string; lbl: string }[];
};

const SOLUTIONS: Solution[] = [
  {
    id: 'hotels',
    tab: 'Hotels',
    heading: 'Hotels',
    features: [
      '24/7 kiosk and mobile self check-in',
      'Automatic housekeeping task assignment',
      'Restaurant and spa POS folded into one folio',
      '300+ OTA channels with zero double bookings',
      'Walk-in and group reservations',
      'VIP guest alerts and special requests',
      'Corporate accounts and city ledger',
    ],
    kpis: [
      { val: '87%', lbl: 'Occupancy' },
      { val: '$142', lbl: 'RevPAR' },
      { val: '4.8★', lbl: 'Guest rating' },
      { val: '-32%', lbl: 'Front-desk load' },
    ],
  },
  {
    id: 'apartments',
    tab: 'Apartments',
    heading: 'Apartments',
    features: [
      'Staffless self check-in with smart locks',
      'Automated monthly invoicing',
      'Owner and manager revenue splits',
      'Lease and contract management',
      'Airbnb and Booking.com synchronization',
      'Manage many units from a single account',
    ],
    kpis: [
      { val: '100%', lbl: 'Contactless' },
      { val: 'Auto', lbl: 'Billing' },
      { val: '0', lbl: 'Front-desk staff' },
      { val: '50+', lbl: 'Units managed' },
    ],
  },
  {
    id: 'rentals',
    tab: 'Vacation Rentals',
    heading: 'Vacation rentals',
    features: [
      'Unified Airbnb, VRBO, and Booking.com management',
      'One-time PIN codes for offline smart locks',
      'iCal calendar synchronization',
      'Automated guest messaging and welcome notes',
      'Cleaner checkout triggers',
      'Digital house rules and arrival guides',
    ],
    kpis: [
      { val: 'OTA', lbl: '300+ channels' },
      { val: 'PIN', lbl: 'Offline smart lock' },
      { val: 'Auto', lbl: 'Messaging' },
      { val: 'iCal', lbl: 'Sync' },
    ],
  },
  {
    id: 'resorts',
    tab: 'Resorts',
    heading: 'Resorts',
    features: [
      'Integrated restaurant and spa POS',
      'Activity and excursion booking module',
      'In-room tablet and app ordering for guests',
      'Combined billing for F&B and room charges',
      'Multi-floor, multi-team housekeeping',
      'Loyalty program and built-in CRM',
    ],
    kpis: [
      { val: 'POS', lbl: 'F&B integration' },
      { val: 'CRM', lbl: 'Loyalty program' },
      { val: '+25%', lbl: 'Upsell revenue' },
      { val: 'TRevPAR', lbl: 'Total revenue KPI' },
    ],
  },
];

export default function Solutions() {
  const [active, setActive] = useState(SOLUTIONS[0].id);
  const current = SOLUTIONS.find((s) => s.id === active) ?? SOLUTIONS[0];

  return (
    <section id="solutions" className="scroll-mt-20 bg-slate-100 px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Use cases"
          title="A solution shaped to your property"
          subtitle="From boutique hotels to multi-unit rentals, Cloud PMS adapts to how you operate."
        />

        <div className="mt-8 flex flex-wrap gap-2">
          {SOLUTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              aria-pressed={active === s.id}
              className={`rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition ${
                active === s.id
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-slate-200 bg-white text-muted hover:border-brand-700 hover:text-brand-700'
              }`}
            >
              {s.tab}
            </button>
          ))}
        </div>

        <div key={current.id} className="animate-fade-in mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h3 className="text-xl font-bold text-ink">{current.heading}</h3>
            <ul className="mt-5 space-y-3">
              {current.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[15px] text-ink">
                  <span className="mt-0.5 shrink-0 text-lg font-bold text-emerald-500" aria-hidden>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white p-7 shadow-card">
            <div className="grid grid-cols-2 gap-3">
              {current.kpis.map((k) => (
                <div key={k.lbl} className="rounded-xl bg-slate-100 p-4 text-center">
                  <p className="text-2xl font-extrabold text-brand-700">{k.val}</p>
                  <p className="mt-1 text-xs text-muted">{k.lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

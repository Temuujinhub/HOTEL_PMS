'use client';

import { useState } from 'react';
import SectionHeading from './SectionHeading';
import { Check } from './icons';

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
    <section id="solutions" className="scroll-mt-20 border-y border-slate-100 bg-slate-50 px-6 py-24 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-content">
        <SectionHeading
          label="Use cases"
          title="A solution shaped to your property"
          subtitle="From boutique hotels to multi-unit rentals, Cloud PMS adapts to how you operate."
        />

        <div className="mt-10 flex flex-wrap gap-2">
          {SOLUTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              aria-pressed={active === s.id}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active === s.id
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {s.tab}
            </button>
          ))}
        </div>

        <div key={current.id} className="animate-fade-in mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{current.heading}</h3>
            <ul className="mt-5 space-y-3">
              {current.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="grid grid-cols-2 gap-3">
              {current.kpis.map((k) => (
                <div key={k.lbl} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <p className="tnum text-2xl font-bold tracking-tight text-slate-900">{k.val}</p>
                  <p className="mt-1 text-xs text-slate-500">{k.lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

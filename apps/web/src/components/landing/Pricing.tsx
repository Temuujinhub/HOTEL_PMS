'use client';

import Link from 'next/link';
import { useState } from 'react';
import SectionHeading from './SectionHeading';

type Plan = {
  name: string;
  price: string;
  period?: string;
  rooms: string;
  popular?: boolean;
  cta: string;
  ctaHref: string;
  features: { label: string; included: boolean }[];
};

const MONTHLY: Plan[] = [
  {
    name: 'Starter',
    price: '$99',
    period: '/mo',
    rooms: '1–30 rooms · ~$3.3/room/mo',
    cta: 'Start free trial',
    ctaHref: '/signup',
    features: [
      { label: 'Reservation management', included: true },
      { label: 'Check-in / check-out', included: true },
      { label: 'Mobile self check-in', included: true },
      { label: 'Housekeeping app (limited)', included: true },
      { label: 'Up to 50 OTA channels', included: true },
      { label: 'QPay + card payments', included: true },
      { label: 'Core reporting', included: true },
      { label: 'Self check-in kiosk', included: false },
      { label: 'Smart locks (2+ brands)', included: false },
      { label: 'Revenue management AI', included: false },
    ],
  },
  {
    name: 'Professional',
    price: '$299',
    period: '/mo',
    rooms: '31–100 rooms · ~$3/room/mo',
    popular: true,
    cta: 'Start free trial',
    ctaHref: '/signup',
    features: [
      { label: 'Everything in Starter', included: true },
      { label: 'Kiosk self check-in', included: true },
      { label: 'Up to 5 smart lock brands', included: true },
      { label: '150+ OTA channels', included: true },
      { label: 'Full housekeeping app', included: true },
      { label: 'Detailed financial reporting', included: true },
      { label: 'Channel manager', included: true },
      { label: '24/7 chat support', included: true },
      { label: '1 POS integration', included: true },
      { label: 'Revenue management AI', included: false },
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    rooms: '100+ rooms · Multi-property',
    cta: 'Contact sales',
    ctaHref: '/signup',
    features: [
      { label: 'Everything in Professional', included: true },
      { label: 'Unlimited smart lock brands', included: true },
      { label: '300+ OTA channels + GDS', included: true },
      { label: 'Revenue management AI', included: true },
      { label: 'Multi-property management', included: true },
      { label: 'Unlimited POS integrations', included: true },
      { label: 'White-label branding', included: true },
      { label: 'Dedicated account manager', included: true },
      { label: '99.9% uptime SLA', included: true },
      { label: 'Accounting system integration', included: true },
    ],
  },
];

function withDiscount(price: string): string {
  if (!price.startsWith('$')) return price;
  const monthly = Number(price.replace(/[^0-9.]/g, ''));
  if (!monthly) return price;
  const yearlyMonthly = Math.round(monthly * 0.8); // ~2 months free
  return `$${yearlyMonthly}`;
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section
      id="pricing"
      className="scroll-mt-20 bg-gradient-to-b from-slate-50 to-brand-50 px-5 py-20 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          center
          label="Pricing"
          title="Pricing that fits your property"
          subtitle="No setup fee, no hidden costs, and you go live in days — not weeks."
        />

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${annual ? 'text-muted' : 'text-ink'}`}>Monthly</span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              annual ? 'bg-brand-700' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                annual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-ink' : 'text-muted'}`}>
            Annual
            <span className="ml-1.5 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent-dark">
              Save 20%
            </span>
          </span>
        </div>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
          {MONTHLY.map((plan) => {
            const displayPrice = annual && plan.price.startsWith('$') ? withDiscount(plan.price) : plan.price;
            const showPeriod = plan.period && plan.price.startsWith('$');
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 bg-white p-8 ${
                  plan.popular
                    ? 'border-brand-700 shadow-lift lg:scale-[1.03]'
                    : 'border-slate-200 shadow-card'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-700 px-4 py-1.5 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <p className="text-[13px] font-bold uppercase tracking-wider text-muted">{plan.name}</p>
                <div className="mt-2 flex items-end gap-1">
                  <span className={`font-extrabold text-ink ${plan.price === 'Custom' ? 'text-3xl' : 'text-5xl'}`}>
                    {displayPrice}
                  </span>
                  {showPeriod && (
                    <span className="mb-1.5 text-base font-medium text-muted">
                      {annual ? '/mo, billed yearly' : plan.period}
                    </span>
                  )}
                  {plan.price === 'Custom' && (
                    <span className="mb-1 text-base font-medium text-muted">pricing</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted">{plan.rooms}</p>

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f.label}
                      className="flex items-center gap-2.5 border-b border-slate-50 pb-2.5 text-sm last:border-0"
                    >
                      {f.included ? (
                        <span className="font-bold text-emerald-500" aria-hidden>✓</span>
                      ) : (
                        <span className="font-bold text-slate-300" aria-hidden>✗</span>
                      )}
                      <span className={f.included ? 'text-ink' : 'text-slate-400'}>{f.label}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`mt-7 block w-full rounded-xl px-4 py-3.5 text-center text-[15px] font-bold transition ${
                    plan.popular
                      ? 'bg-brand-700 text-white hover:bg-brand-600'
                      : 'border-2 border-brand-700 text-brand-700 hover:bg-brand-700 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-center text-sm leading-relaxed text-muted">
            <strong className="text-ink">Included in every plan:</strong> No setup fee · 14-day free
            trial · Cancel anytime · SSL secured · Built on a scalable cloud infrastructure
          </p>
        </div>
      </div>
    </section>
  );
}

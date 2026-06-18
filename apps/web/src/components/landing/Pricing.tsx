'use client';

import Link from 'next/link';
import { useState } from 'react';
import SectionHeading from './SectionHeading';
import { Check, Minus, ShieldCheck } from './icons';

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
    <section id="pricing" className="scroll-mt-20 bg-white px-6 py-24 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-content">
        <SectionHeading
          center
          label="Pricing"
          title="Pricing that fits your property"
          subtitle="No setup fee, no hidden costs, and you go live in days — not weeks."
        />

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${annual ? 'text-slate-500' : 'text-slate-900'}`}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            aria-label="Toggle annual billing"
            onClick={() => setAnnual((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              annual ? 'bg-brand-900' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition ${
                annual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-slate-900' : 'text-slate-500'}`}>
            Annual
            <span className="ml-1.5 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-dark">
              Save 20%
            </span>
          </span>
        </div>

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {MONTHLY.map((plan) => {
            const displayPrice =
              annual && plan.price.startsWith('$') ? withDiscount(plan.price) : plan.price;
            const showPeriod = plan.period && plan.price.startsWith('$');
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl bg-white p-8 ${
                  plan.popular
                    ? 'border-2 border-brand-900 shadow-lift lg:-mt-2 lg:mb-2'
                    : 'border border-slate-200 shadow-card'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-900 px-3.5 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <p className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">
                  {plan.name}
                </p>
                <div className="mt-3 flex items-end gap-1">
                  <span
                    className={`tnum font-bold tracking-tight text-slate-900 ${
                      plan.price === 'Custom' ? 'text-3xl' : 'text-5xl'
                    }`}
                  >
                    {displayPrice}
                  </span>
                  {showPeriod && (
                    <span className="mb-1.5 text-base font-medium text-slate-500">
                      {annual ? '/mo, billed yearly' : plan.period}
                    </span>
                  )}
                  {plan.price === 'Custom' && (
                    <span className="mb-1 text-base font-medium text-slate-500">pricing</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-500">{plan.rooms}</p>

                <Link
                  href={plan.ctaHref}
                  className={`mt-6 block w-full rounded-xl px-4 py-3 text-center text-[15px] font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-brand-900 text-white hover:bg-brand-800'
                      : 'border border-slate-300 text-slate-900 hover:border-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="mt-7 space-y-3 border-t border-slate-100 pt-6">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-2.5 text-sm">
                      {f.included ? (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-brand-700">
                          <Check className="h-4 w-4" strokeWidth={2.2} />
                        </span>
                      ) : (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-slate-300">
                          <Minus className="h-4 w-4" />
                        </span>
                      )}
                      <span className={f.included ? 'text-slate-700' : 'text-slate-400'}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-6 py-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand-700" />
          <p className="text-center text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-900">Included in every plan:</span> No setup
            fee · 14-day free trial · Cancel anytime · SSL secured · Scalable cloud infrastructure
          </p>
        </div>
      </div>
    </section>
  );
}

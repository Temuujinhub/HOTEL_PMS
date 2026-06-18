import type { ComponentType, SVGProps } from 'react';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import {
  CalendarCheck,
  Smartphone,
  Key,
  Sparkles,
  Globe,
  CreditCard,
  BarChart,
  Cpu,
} from './icons';

type Feature = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
  gradient: string;
};

const FEATURES: Feature[] = [
  {
    Icon: CalendarCheck,
    title: 'Reservation management',
    desc: 'Online and offline bookings in one place — automated confirmations, flexible policies, and group reservations.',
    gradient: 'from-brand-500 to-violet-500',
  },
  {
    Icon: Smartphone,
    title: 'Self check-in (24/7)',
    desc: 'Guests check in instantly via kiosk, mobile, or web — no front desk. ID scanning and digital keys included.',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    Icon: Key,
    title: 'Smart lock integration',
    desc: 'Salto, VingCard, Dormakaba, Nuki, and Igloohome out of the box — digital keys, PIN codes, and RFID cards.',
    gradient: 'from-fuchsia-500 to-rose-500',
  },
  {
    Icon: Sparkles,
    title: 'Housekeeping app',
    desc: 'Cleaners view tasks, update room status, and attach photo proof from their phones, with supervisor inspections.',
    gradient: 'from-rose-500 to-orange-500',
  },
  {
    Icon: Globe,
    title: 'Channel manager (300+ OTA)',
    desc: 'Real-time, two-way sync with Booking.com, Airbnb, Expedia, Agoda, and 300+ more. Double bookings disappear.',
    gradient: 'from-sky-500 to-brand-500',
  },
  {
    Icon: CreditCard,
    title: 'Unified payments',
    desc: 'Cards, NFC, and QR via Stripe, Adyen, QPay and more. Pre-authorization, automated billing, and tax built in.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    Icon: BarChart,
    title: 'Manager dashboard',
    desc: 'Occupancy, ADR, RevPAR and TRevPAR in real time, with 30/60/90-day forecasts and per-channel reports.',
    gradient: 'from-cyan-500 to-brand-500',
  },
  {
    Icon: Cpu,
    title: 'Revenue management AI',
    desc: 'Dynamic pricing driven by occupancy, seasonality and demand — plus automated rate shopping vs your comp set.',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-white px-6 py-24 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-content">
        <Reveal>
          <SectionHeading
            center
            label="Platform capabilities"
            title={
              <>
                Every hotel workflow, <span className="text-gradient">unified</span>
              </>
            }
            subtitle="Run your entire operation from a single platform — front desk, housekeeping, distribution, and finance."
          />
        </Reveal>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, desc, gradient }, i) => (
            <Reveal key={title} delay={(i % 4) * 80}>
              <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-glow">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-sm transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display mt-5 text-[15px] font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

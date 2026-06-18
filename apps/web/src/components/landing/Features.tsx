import type { ComponentType, SVGProps } from 'react';
import SectionHeading from './SectionHeading';
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
};

const FEATURES: Feature[] = [
  {
    Icon: CalendarCheck,
    title: 'Reservation management',
    desc: 'Handle online and offline bookings from one place — automated confirmations, flexible cancellation policies, and group reservations.',
  },
  {
    Icon: Smartphone,
    title: 'Self check-in (24/7)',
    desc: 'Guests check in instantly via kiosk, mobile app, or web — no waiting at the front desk. Includes ID scanning and digital keys.',
  },
  {
    Icon: Key,
    title: 'Smart lock integration',
    desc: 'Connect Salto, VingCard, Dormakaba, Nuki, and Igloohome out of the box. Issue digital keys, PIN codes, and RFID cards automatically.',
  },
  {
    Icon: Sparkles,
    title: 'Housekeeping app',
    desc: 'Cleaners view assigned tasks, update room status, and attach photo proof from their phones, with a supervisor inspection workflow.',
  },
  {
    Icon: Globe,
    title: 'Channel manager (300+ OTA)',
    desc: 'Real-time, two-way sync with Booking.com, Airbnb, Expedia, Agoda, and 300+ more channels. Double bookings disappear.',
  },
  {
    Icon: CreditCard,
    title: 'Unified payments',
    desc: 'Accept cards, NFC, and QR through Stripe, Adyen, QPay, and more. Pre-authorization, automated billing, and tax handling built in.',
  },
  {
    Icon: BarChart,
    title: 'Manager dashboard',
    desc: 'Track Occupancy, ADR, RevPAR, and TRevPAR in real time, with 30/60/90-day forecasts and per-channel performance reports.',
  },
  {
    Icon: Cpu,
    title: 'Revenue management AI',
    desc: 'Dynamic pricing driven by occupancy, seasonality, and demand windows — plus automated rate shopping against your competitive set.',
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-white px-6 py-24 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-content">
        <SectionHeading
          center
          label="Platform capabilities"
          title="Every hotel workflow, unified"
          subtitle="Run your entire operation from a single platform — front desk, housekeeping, distribution, and finance."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lift"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-900 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-[15px] font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

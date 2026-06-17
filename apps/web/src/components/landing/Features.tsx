import SectionHeading from './SectionHeading';

const FEATURES = [
  {
    icon: '🏨',
    title: 'Reservation management',
    desc: 'Handle online and offline bookings from one place — automated confirmations, flexible cancellation policies, and group reservations.',
  },
  {
    icon: '📱',
    title: 'Self check-in (24/7)',
    desc: 'Guests check in instantly via kiosk, mobile app, or web — no waiting at the front desk. Includes ID scanning and digital keys.',
  },
  {
    icon: '🔑',
    title: 'Smart lock integration',
    desc: 'Connect Salto, VingCard, Dormakaba, Nuki, and Igloohome out of the box. Issue digital keys, PIN codes, and RFID cards automatically.',
  },
  {
    icon: '🧹',
    title: 'Housekeeping app',
    desc: 'Cleaners view assigned tasks, update room status, and attach photo proof from their phones, with a supervisor inspection workflow.',
  },
  {
    icon: '🌐',
    title: 'Channel manager (300+ OTA)',
    desc: 'Real-time, two-way sync with Booking.com, Airbnb, Expedia, Agoda, and 300+ more channels. Double bookings disappear.',
  },
  {
    icon: '💳',
    title: 'Unified payments',
    desc: 'Accept cards, NFC, and QR through Stripe, Adyen, QPay, and more. Pre-authorization, automated billing, and tax handling built in.',
  },
  {
    icon: '📊',
    title: 'Manager dashboard',
    desc: 'Track Occupancy, ADR, RevPAR, and TRevPAR in real time, with 30/60/90-day forecasts and per-channel performance reports.',
  },
  {
    icon: '🤖',
    title: 'Revenue management AI',
    desc: 'Dynamic pricing driven by occupancy, seasonality, and demand windows — plus automated rate shopping against your competitive set.',
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-white px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          center
          label="Platform capabilities"
          title="Every hotel workflow, unified"
          subtitle="Run your entire operation from a single platform — front desk, housekeeping, distribution, and finance."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-slate-200 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-brand-700 hover:shadow-lift"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition group-hover:bg-brand-100">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

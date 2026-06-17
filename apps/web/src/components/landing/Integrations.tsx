import SectionHeading from './SectionHeading';

const HIGHLIGHT = ['Booking.com', 'Airbnb', 'Expedia', 'Stripe', 'QPay', 'Salto'];

const INTEGRATIONS = [
  'Booking.com', 'Airbnb', 'Expedia', 'Stripe', 'QPay', 'Salto',
  'Agoda', 'Trip.com', 'VRBO', 'Google Hotels', 'Adyen', 'VingCard',
  'Dormakaba', 'Nuki', 'Igloohome', 'SiteMinder', 'SendGrid', 'Twilio',
  'QuickBooks', 'Lightspeed POS', 'WhatsApp', 'Amadeus GDS', 'Sabre GDS',
];

export default function Integrations() {
  return (
    <section id="integrations" className="scroll-mt-20 bg-ink px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          light
          label="Integration ecosystem"
          title="Works with 300+ systems"
          subtitle="Connect every major platform in your stack with ready-made, two-way integrations."
        />
        <div className="mt-10 flex flex-wrap gap-3">
          {INTEGRATIONS.map((tag) => {
            const isHighlight = HIGHLIGHT.includes(tag);
            return (
              <span
                key={tag}
                className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  isHighlight
                    ? 'border-brand-700 bg-brand-700/40 text-white'
                    : 'border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

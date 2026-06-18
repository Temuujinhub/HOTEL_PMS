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
    <section
      id="integrations"
      className="scroll-mt-20 border-y border-slate-100 bg-slate-50 px-6 py-24 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-content">
        <SectionHeading
          center
          label="Integration ecosystem"
          title="Works with 300+ systems"
          subtitle="Connect every major platform in your stack with ready-made, two-way integrations."
        />
        <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-2.5">
          {INTEGRATIONS.map((tag) => {
            const isHighlight = HIGHLIGHT.includes(tag);
            return (
              <span
                key={tag}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  isHighlight
                    ? 'border-brand-200 bg-brand-50 text-brand-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
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

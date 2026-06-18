import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

const HIGHLIGHT = ['Booking.com', 'Airbnb', 'Expedia', 'Stripe', 'QPay', 'Salto'];

const INTEGRATIONS = [
  'Booking.com', 'Airbnb', 'Expedia', 'Stripe', 'QPay', 'Salto',
  'Agoda', 'Trip.com', 'VRBO', 'Google Hotels', 'Adyen', 'VingCard',
  'Dormakaba', 'Nuki', 'Igloohome', 'SiteMinder', 'SendGrid', 'Twilio',
  'QuickBooks', 'Lightspeed POS', 'WhatsApp', 'Amadeus GDS', 'Sabre GDS',
];

const ROW_A = INTEGRATIONS.slice(0, 12);
const ROW_B = INTEGRATIONS.slice(12);

function Chip({ tag }: { tag: string }) {
  const isHighlight = HIGHLIGHT.includes(tag);
  return (
    <span
      className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium ${
        isHighlight
          ? 'border-brand-200 bg-brand-50 text-brand-700'
          : 'border-slate-200 bg-white text-slate-600'
      }`}
    >
      {tag}
    </span>
  );
}

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`flex w-max gap-3 pr-3 animate-marquee group-hover:[animation-play-state:paused] ${
          reverse ? '[animation-direction:reverse]' : ''
        }`}
      >
        {[...items, ...items].map((tag, i) => (
          <Chip key={`${tag}-${i}`} tag={tag} />
        ))}
      </div>
    </div>
  );
}

export default function Integrations() {
  return (
    <section id="integrations" className="scroll-mt-20 bg-slate-50 px-6 py-24 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-content">
        <Reveal>
          <SectionHeading
            center
            label="Integration ecosystem"
            title={
              <>
                Works with <span className="text-gradient">300+ systems</span>
              </>
            }
            subtitle="Connect every major platform in your stack with ready-made, two-way integrations."
          />
        </Reveal>
        <Reveal className="mt-12 space-y-3">
          <Marquee items={ROW_A} />
          <Marquee items={ROW_B} reverse />
        </Reveal>
      </div>
    </section>
  );
}

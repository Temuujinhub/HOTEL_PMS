import SectionHeading from './SectionHeading';
import { Star } from './icons';

const TESTIMONIALS = [
  {
    quote:
      'Since rolling out self check-in, the line at our front desk dropped by 70%. Guests now check in at 2 a.m. without waiting for anyone.',
    initial: 'S',
    name: 'Sophie Laurent',
    role: 'General Manager, boutique hotel · Paris',
  },
  {
    quote:
      'The double bookings we used to get between Booking.com and Airbnb are completely gone. The channel manager is easily the most valuable feature for us.',
    initial: 'M',
    name: 'Marco Rossi',
    role: 'Apartment Manager · Milan',
  },
  {
    quote:
      'With the housekeeping app, I no longer have to call cleaners to coordinate. Supervisor inspections have noticeably raised our room quality.',
    initial: 'A',
    name: 'Aisha Rahman',
    role: 'Housekeeping Manager, 4-star resort · Dubai',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white px-6 py-24 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-content">
        <SectionHeading center label="Customer stories" title="Real results from real properties" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-card"
            >
              <div className="flex gap-0.5 text-accent" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-white">
                  {t.initial}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{t.name}</span>
                  <span className="block text-[13px] text-slate-500">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

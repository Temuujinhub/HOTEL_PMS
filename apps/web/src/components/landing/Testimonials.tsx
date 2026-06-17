import SectionHeading from './SectionHeading';

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
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          center
          label="Customer stories"
          title="Real results from real properties"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-xl bg-slate-100 p-7">
              <div className="text-lg text-accent" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <blockquote className="mt-3.5 text-[15px] italic leading-relaxed text-ink">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-700 text-base font-bold text-white">
                  {t.initial}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{t.name}</span>
                  <span className="block text-[13px] text-muted">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

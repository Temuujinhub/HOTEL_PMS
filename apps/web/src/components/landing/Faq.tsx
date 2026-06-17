'use client';

import { useState } from 'react';
import SectionHeading from './SectionHeading';

const FAQS = [
  {
    q: 'How long does it take to implement Cloud PMS?',
    a: 'Implementation usually wraps up in 1–5 days, depending on the size of your property. Our specialists handle data migration, staff training, and the full configuration process for you.',
  },
  {
    q: 'Which payment gateways do you support?',
    a: 'We support a wide range of global gateways — including Stripe, Adyen, and QPay — alongside cards (Visa, Mastercard), bank transfers, and cash. Local tax calculation is handled automatically.',
  },
  {
    q: 'How does self check-in work without smart locks?',
    a: 'If you do not have smart locks, you can use a kiosk with an RFID card encoder, or mobile check-in. You can also send guests a QR code and have reception issue cards remotely.',
  },
  {
    q: 'Does the system work when the internet goes down?',
    a: 'Yes. We support an offline mode: Igloohome and select smart locks operate with offline PINs, and core reception functions (check-in/out, room status) keep working from an offline cache.',
  },
  {
    q: 'Can I manage multiple properties?',
    a: 'The Professional and Enterprise plans include a unified multi-property dashboard. From a single login you can view KPIs, reservations, and staff across all of your properties on one screen.',
  },
  {
    q: 'Can I migrate data from my current PMS?',
    a: 'Absolutely. Our specialists help you migrate guest profiles, reservation history, and room records from Mews, Cloudbeds, eZee, and other major systems.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-slate-100 px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading center label="FAQ" title="Questions? We have answers" />
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="overflow-hidden rounded-xl bg-white shadow-card">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-semibold text-ink"
                >
                  {item.q}
                  <span
                    className={`shrink-0 text-xl text-brand-700 transition-transform duration-200 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="animate-fade-in px-6 pb-5 text-sm leading-relaxed text-muted">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

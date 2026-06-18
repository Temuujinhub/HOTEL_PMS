import Link from 'next/link';
import Reveal from './Reveal';

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Integrations', href: '#integrations' },
      { label: 'Security', href: '#integrations' },
      { label: 'Roadmap', href: '#' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Hotels', href: '#solutions' },
      { label: 'Apartments', href: '#solutions' },
      { label: 'Vacation Rentals', href: '#solutions' },
      { label: 'Resorts', href: '#solutions' },
      { label: 'Hostels', href: '#solutions' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Cloud PMS', href: '#' },
      { label: 'Contact', href: '#contact' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Privacy policy', href: '#' },
    ],
  },
];

export default function CtaFooter() {
  return (
    <>
      {/* Final CTA band */}
      <section id="contact" className="scroll-mt-20 bg-white px-6 py-20 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-content overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-violet-600 to-fuchsia-600 bg-[length:200%_200%] px-6 py-16 text-center animate-gradient sm:px-12">
            <div className="pointer-events-none absolute -left-10 -top-10 h-64 w-64 rounded-full bg-white/20 blur-3xl animate-blob" aria-hidden />
            <div
              className="pointer-events-none absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl animate-blob"
              style={{ animationDelay: '4s' }}
              aria-hidden
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-[2.5rem]">
                Modernize your property today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
                14-day free trial · No setup fee · Go live within 24 hours
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link
                  href="/signup"
                  className="rounded-xl bg-white px-7 py-3.5 text-[15px] font-semibold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600"
                >
                  Start free trial
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 text-[15px] font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Talk to an expert
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 pb-10 pt-16 lg:px-8">
        <div className="mx-auto max-w-content">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 text-[15px] font-bold text-white">
                  C
                </span>
                <span className="font-display text-[17px] font-bold tracking-tight text-slate-900">Cloud PMS</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
                The unified property management system for hotels, apartments, and vacation rentals, built for
                operators worldwide.
              </p>
              <p className="mt-4 text-sm">
                <a href="mailto:hello@cloudpms.app" className="text-slate-600 transition hover:text-brand-600">
                  hello@cloudpms.app
                </a>
              </p>
            </div>

            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-slate-900">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm text-slate-600 transition hover:text-brand-600">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-slate-200 pt-6 text-[13px] text-slate-500 sm:flex-row sm:justify-between">
            <span>© 2026 Cloud PMS. All rights reserved.</span>
            <span>Cloud PMS v1.0</span>
          </div>
        </div>
      </footer>
    </>
  );
}

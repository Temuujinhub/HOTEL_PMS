import Link from 'next/link';

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
      <section
        id="contact"
        className="scroll-mt-20 bg-gradient-to-br from-brand-700 to-brand-800 px-5 py-20 text-center text-white sm:px-8"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Modernize your property today</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
            14-day free trial · No setup fee · Go live within 24 hours
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-9 py-4 text-base font-bold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
            >
              Start free trial
            </Link>
            <Link
              href="/login"
              className="rounded-xl border-2 border-white/50 px-9 py-4 text-base font-bold text-white transition hover:border-white hover:bg-white/10"
            >
              Talk to an expert
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink px-5 pb-8 pt-16 text-slate-400 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-lg font-extrabold text-white">
                  C
                </span>
                <span className="text-xl font-extrabold text-white">Cloud PMS</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed">
                The unified property management system for hotels, apartments, and vacation rentals,
                built for operators worldwide.
              </p>
              <p className="mt-4 text-sm">
                <a href="mailto:hello@cloudpms.app" className="transition hover:text-white">
                  hello@cloudpms.app
                </a>
              </p>
            </div>

            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold text-white">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm transition hover:text-white">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-[13px] sm:flex-row sm:justify-between">
            <span>© 2026 Cloud PMS. All rights reserved.</span>
            <span>Cloud PMS v1.0</span>
          </div>
        </div>
      </footer>
    </>
  );
}

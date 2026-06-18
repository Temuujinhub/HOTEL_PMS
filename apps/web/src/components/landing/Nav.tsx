'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, Close } from './icons';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#solutions', label: 'Solutions' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#integrations', label: 'Integrations' },
  { href: '#faq', label: 'FAQ' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/40 shadow-sm' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-content items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Cloud PMS home">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 text-[15px] font-bold text-white shadow-[0_6px_16px_-4px_rgba(124,58,237,0.6)]">
            C
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight text-slate-900">Cloud PMS</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand-600"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(79,70,229,0.7)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-8px_rgba(79,70,229,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
          >
            Start free trial
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="animate-fade-in glass border-t border-white/40 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-white/60"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-white/40 pt-3">
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-800"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Start free trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

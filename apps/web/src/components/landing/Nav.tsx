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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'border-b border-slate-200/80 bg-white/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-content items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Cloud PMS home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-900 text-[15px] font-bold text-white shadow-ring">
            C
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-slate-900">Cloud PMS</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
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
            className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
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
        <div className="animate-fade-in border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-800"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Start free trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

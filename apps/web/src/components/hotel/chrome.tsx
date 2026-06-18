/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { PublicProperty } from '@/lib/public-api';

export function HotelHeader({ property, slug }: { property: PublicProperty; slug: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6 lg:px-8">
        <Link href={`/h/${slug}`} className="flex items-center gap-2.5">
          {property.logoUrl ? (
            <img src={property.logoUrl} alt={property.name} className="h-8 w-auto" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-sm font-bold text-white">
              {property.name.charAt(0)}
            </span>
          )}
          <span className="font-display text-[17px] font-bold tracking-tight text-slate-900">{property.name}</span>
        </Link>
        <Link
          href={`/h/${slug}/confirmation`}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-brand-600"
        >
          My booking
        </Link>
      </div>
    </header>
  );
}

export function HotelFooter({ property, slug }: { property: PublicProperty; slug: string }) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-content flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-700">{property.name}</p>
          <p>{[property.addressLine, property.city, property.country].filter(Boolean).join(', ')}</p>
          {property.phone && <p>{property.phone}</p>}
        </div>
        <p>
          Powered by{' '}
          <Link href="/" className="font-semibold text-brand-600">
            Cloud MASTR PMS
          </Link>{' '}
          · /h/{slug}
        </p>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Property } from '@/lib/types';
import { initials } from '@/lib/format';
import { Avatar, LoadingState, Select } from './ui';

interface PropertyCtx {
  properties: Property[];
  property: Property | null;
  setPropertyId: (id: string) => void;
}
const PropertyContext = createContext<PropertyCtx | undefined>(undefined);

export function useProperty(): PropertyCtx {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error('useProperty must be used within DashboardShell');
  return ctx;
}

const NAV = [
  { href: '/app', label: 'Overview', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  { href: '/app/reservations', label: 'Reservations', icon: 'M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z' },
  { href: '/app/rooms', label: 'Rooms', icon: 'M3 21h18M4 21V5a2 2 0 012-2h12a2 2 0 012 2v16M9 7h1m4 0h1M9 11h1m4 0h1' },
  { href: '/app/guests', label: 'Guests', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21v-1a6 6 0 0112 0v1' },
  { href: '/app/housekeeping', label: 'Housekeeping', icon: 'M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7' },
  { href: '/app/reports', label: 'Reports', icon: 'M9 19V9m4 10V5m4 14v-7M5 21h14' },
  { href: '/app/settings', label: 'Settings', icon: 'M10.3 3.2a2 2 0 013.4 0l.6 1a2 2 0 002.3 1l1.1-.3a2 2 0 012.4 2.4l-.3 1.1a2 2 0 001 2.3l1 .6a2 2 0 010 3.4l-1 .6a2 2 0 00-1 2.3l.3 1.1a2 2 0 01-2.4 2.4l-1.1-.3a2 2 0 00-2.3 1l-.6 1a2 2 0 01-3.4 0l-.6-1a2 2 0 00-2.3-1l-1.1.3a2 2 0 01-2.4-2.4l.3-1.1a2 2 0 00-1-2.3l-1-.6a2 2 0 010-3.4l1-.6a2 2 0 001-2.3l-.3-1.1A2 2 0 016.9 4.9l1.1.3a2 2 0 002.3-1l.6-1zM12 15a3 3 0 100-6 3 3 0 000 6z' },
];

function Icon({ path }: { path: string }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<Property[]>('/properties')
      .then((props) => {
        setProperties(props);
        setPropertyId((cur) => cur || user.propertyId || props[0]?.id || '');
      })
      .finally(() => setReady(true));
  }, [user]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center"><LoadingState label="Authenticating…" /></div>;
  }

  const property = properties.find((p) => p.id === propertyId) ?? null;

  return (
    <PropertyContext.Provider value={{ properties, property, setPropertyId }}>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
          <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 font-extrabold text-white">C</div>
            <div>
              <p className="text-sm font-bold text-brand-700">Cloud PMS</p>
              <p className="text-[11px] text-muted">{user.tenant?.name}</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {NAV.map((item) => {
              const active = item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active ? 'bg-brand-50 text-brand-700' : 'text-muted hover:bg-slate-100 hover:text-ink'
                  }`}
                >
                  <Icon path={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-100 p-3">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar text={initials(user.firstName, user.lastName)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{user.firstName} {user.lastName}</p>
                <p className="truncate text-xs text-muted">{user.role.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <button onClick={logout} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted hover:bg-slate-100">
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="font-semibold text-ink md:hidden">Cloud PMS</span>
            </div>
            <div className="flex items-center gap-3">
              {properties.length > 0 && (
                <Select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-48"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">
            {ready ? children : <LoadingState />}
          </main>
        </div>
      </div>
    </PropertyContext.Provider>
  );
}

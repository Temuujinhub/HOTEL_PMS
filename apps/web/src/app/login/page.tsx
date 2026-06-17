'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button, Input, Label } from '@/components/ui';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('owner@demo.cloudpms.app');
  const [password, setPassword] = useState('Passw0rd!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace('/app');
  }, [user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-700 to-brand-900 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 font-extrabold">C</div>
          <span className="text-xl font-bold">Cloud PMS</span>
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">Run your property from anywhere.</h1>
          <p className="mt-4 max-w-md text-white/80">
            Reservations, front desk, housekeeping, payments and analytics — unified in one real-time
            cloud platform.
          </p>
        </div>
        <p className="text-sm text-white/60">© {new Date().getFullYear()} Cloud PMS</p>
      </div>

      {/* Right form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 font-extrabold text-white">C</div>
            <span className="text-lg font-bold text-brand-700">Cloud PMS</span>
          </Link>
          <h2 className="text-2xl font-bold text-ink">Welcome back</h2>
          <p className="mt-1 text-sm text-muted">Sign in to your dashboard</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-muted">
            <p className="font-semibold text-ink">Demo accounts (password: Passw0rd!)</p>
            <p className="mt-1">owner@demo.cloudpms.app — Grand Aurora Hotel</p>
            <p>owner@seaside.cloudpms.app — Seaside Inn</p>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            New here?{' '}
            <Link href="/signup" className="font-semibold text-brand-700">
              Start a free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

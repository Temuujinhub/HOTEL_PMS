'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button, Input, Label } from '@/components/ui';

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: '',
    propertyName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: 'US',
    currency: 'USD',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.replace('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-indigo-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 font-extrabold text-white">C</div>
          <span className="text-lg font-bold text-brand-700">Cloud MASTR PMS</span>
        </Link>
        <h2 className="text-2xl font-bold text-ink">Create your account</h2>
        <p className="mt-1 text-sm text-muted">14-day free trial. No credit card required.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="companyName">Business name</Label>
            <Input id="companyName" value={form.companyName} onChange={update('companyName')} placeholder="Grand Aurora Hospitality" required />
          </div>
          <div>
            <Label htmlFor="propertyName">Property name</Label>
            <Input id="propertyName" value={form.propertyName} onChange={update('propertyName')} placeholder="Grand Aurora Hotel" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={form.firstName} onChange={update('firstName')} required />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={form.lastName} onChange={update('lastName')} required />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={update('password')} minLength={8} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country} onChange={update('country')} maxLength={2} />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value={form.currency} onChange={update('currency')} maxLength={3} />
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create account & start trial
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

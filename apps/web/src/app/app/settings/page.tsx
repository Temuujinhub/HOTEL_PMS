'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Label,
  LoadingState,
  Modal,
  Select,
  EmptyState,
  PageHeader,
  Table,
  Td,
  Th,
} from '@/components/ui';
import { labelize } from '@/lib/format';
import type { Property, UserRole } from '@/lib/types';

interface Tenant {
  id: string;
  name: string;
  legalName?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  currency: string;
  timezone: string;
  subscription: { tier: string; status: string; roomLimit: number };
  _count: { properties: number; users: number };
}

interface UserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

const ROLE_OPTIONS: UserRole[] = [
  'OWNER',
  'GM',
  'FRONT_DESK_MANAGER',
  'FRONT_DESK',
  'HOUSEKEEPING_SUPERVISOR',
  'HOUSEKEEPING',
  'FINANCE_MANAGER',
  'REVENUE_MANAGER',
];

type Tab = 'business' | 'team' | 'properties';

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'OWNER' || user?.role === 'GM';

  const [tab, setTab] = useState<Tab>('business');

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Business form
  const [biz, setBiz] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    currency: '',
    timezone: '',
  });
  const [savingBiz, setSavingBiz] = useState(false);
  const [bizError, setBizError] = useState('');
  const [bizSaved, setBizSaved] = useState(false);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'FRONT_DESK' as UserRole,
    phone: '',
  });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<Tenant>('/tenants/me'),
      api.get<UserRow[]>('/users').catch(() => [] as UserRow[]),
      api.get<Property[]>('/properties').catch(() => [] as Property[]),
    ])
      .then(([t, u, p]) => {
        setTenant(t);
        setUsers(u);
        setProperties(p);
        setBiz({
          name: t.name ?? '',
          contactEmail: t.contactEmail ?? '',
          contactPhone: t.contactPhone ?? '',
          currency: t.currency ?? '',
          timezone: t.timezone ?? '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const saveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBizError('');
    setBizSaved(false);
    setSavingBiz(true);
    try {
      const updated = await api.patch<Tenant>('/tenants/me', {
        name: biz.name,
        contactEmail: biz.contactEmail,
        contactPhone: biz.contactPhone || undefined,
        currency: biz.currency,
        timezone: biz.timezone,
      });
      setTenant(updated);
      setBizSaved(true);
    } catch (err) {
      setBizError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSavingBiz(false);
    }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviting(true);
    try {
      await api.post<UserRow>('/users', {
        email: invite.email,
        password: invite.password,
        firstName: invite.firstName,
        lastName: invite.lastName,
        role: invite.role,
        phone: invite.phone || undefined,
      });
      setInviteOpen(false);
      setInvite({ email: '', password: '', firstName: '', lastName: '', role: 'FRONT_DESK', phone: '' });
      const refreshed = await api.get<UserRow[]>('/users').catch(() => users);
      setUsers(refreshed);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <LoadingState label="Loading settings…" />;

  const sub = tenant?.subscription;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'business', label: 'Business' },
    { key: 'team', label: 'Team' },
    { key: 'properties', label: 'Properties' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your organization, team and properties" />

      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === t.key
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Business */}
      {tab === 'business' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Plan" subtitle="Your current subscription" />
            <CardBody>
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-sm text-muted">Tier</p>
                  <Badge className="mt-1 bg-brand-100 text-brand-700">
                    {sub ? labelize(sub.tier) : '—'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted">Status</p>
                  <Badge
                    className={`mt-1 ${
                      sub?.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {sub ? labelize(sub.status) : '—'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted">Room limit</p>
                  <p className="mt-1 font-semibold text-ink">{sub?.roomLimit ?? '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Properties</p>
                  <p className="mt-1 font-semibold text-ink">{tenant?._count.properties ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Users</p>
                  <p className="mt-1 font-semibold text-ink">{tenant?._count.users ?? 0}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Business details"
              subtitle={isAdmin ? 'Update your organization information' : 'Read-only'}
            />
            <CardBody>
              <form onSubmit={saveBusiness} className="space-y-4">
                <fieldset disabled={!isAdmin} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Business name</Label>
                      <Input
                        id="name"
                        value={biz.name}
                        onChange={(e) => setBiz({ ...biz, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={biz.contactEmail}
                        onChange={(e) => setBiz({ ...biz, contactEmail: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact phone</Label>
                      <Input
                        id="contactPhone"
                        value={biz.contactPhone}
                        onChange={(e) => setBiz({ ...biz, contactPhone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={biz.currency}
                        onChange={(e) => setBiz({ ...biz, currency: e.target.value })}
                        placeholder="USD"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={biz.timezone}
                        onChange={(e) => setBiz({ ...biz, timezone: e.target.value })}
                        placeholder="America/New_York"
                      />
                    </div>
                  </div>
                </fieldset>
                {bizError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{bizError}</p>
                )}
                {bizSaved && (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    Settings saved.
                  </p>
                )}
                {isAdmin && (
                  <div className="flex justify-end">
                    <Button type="submit" loading={savingBiz}>
                      Save changes
                    </Button>
                  </div>
                )}
              </form>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Team */}
      {tab === 'team' && (
        <Card>
          <CardHeader
            title="Team members"
            subtitle={`${users.length} user${users.length === 1 ? '' : 's'}`}
            action={
              isAdmin ? (
                <Button size="sm" onClick={() => { setInviteError(''); setInviteOpen(true); }}>
                  Invite user
                </Button>
              ) : undefined
            }
          />
          {users.length === 0 ? (
            <CardBody>
              <EmptyState title="No team members" description="No users found for this organization." />
            </CardBody>
          ) : (
            <Table>
              <thead>
                <tr className="border-b border-slate-100">
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <Td className="font-medium">
                      {u.firstName} {u.lastName}
                    </Td>
                    <Td className="text-muted">{u.email}</Td>
                    <Td>
                      <Badge className="bg-slate-100 text-slate-600">{labelize(u.role)}</Badge>
                    </Td>
                    <Td>
                      <Badge
                        className={
                          u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {/* Properties */}
      {tab === 'properties' && (
        <Card>
          <CardHeader title="Properties" subtitle={`${properties.length} propert${properties.length === 1 ? 'y' : 'ies'}`} />
          {properties.length === 0 ? (
            <CardBody>
              <EmptyState title="No properties" description="No properties found for this organization." />
            </CardBody>
          ) : (
            <Table>
              <thead>
                <tr className="border-b border-slate-100">
                  <Th>Name</Th>
                  <Th>City</Th>
                  <Th>Country</Th>
                  <Th>Currency</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <Td className="font-medium">{p.name}</Td>
                    <Td>{p.city || '—'}</Td>
                    <Td>{p.country}</Td>
                    <Td>{p.currency}</Td>
                    <Td>
                      <Badge
                        className={
                          p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {/* Invite modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite user">
        <form onSubmit={sendInvite} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inviteFirst">First name</Label>
              <Input
                id="inviteFirst"
                value={invite.firstName}
                onChange={(e) => setInvite({ ...invite, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="inviteLast">Last name</Label>
              <Input
                id="inviteLast"
                value={invite.lastName}
                onChange={(e) => setInvite({ ...invite, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="inviteEmail">Email</Label>
            <Input
              id="inviteEmail"
              type="email"
              value={invite.email}
              onChange={(e) => setInvite({ ...invite, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invitePassword">Temporary password</Label>
              <Input
                id="invitePassword"
                type="password"
                value={invite.password}
                onChange={(e) => setInvite({ ...invite, password: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="inviteRole">Role</Label>
              <Select
                id="inviteRole"
                value={invite.role}
                onChange={(e) => setInvite({ ...invite, role: e.target.value as UserRole })}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {labelize(r)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="invitePhone">Phone</Label>
            <Input
              id="invitePhone"
              value={invite.phone}
              onChange={(e) => setInvite({ ...invite, phone: e.target.value })}
            />
          </div>
          {inviteError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{inviteError}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={inviting}>
              Send invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

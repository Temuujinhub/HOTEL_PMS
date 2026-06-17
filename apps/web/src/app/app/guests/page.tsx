'use client';

import { useEffect, useState } from 'react';
import { api, qs } from '@/lib/api';
import {
  Avatar,
  Badge,
  Button,
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
import { formatDate, initials, labelize, vipColor } from '@/lib/format';
import type { Guest, Paginated, Reservation } from '@/lib/types';

const VIP_LEVELS = ['NONE', 'SILVER', 'GOLD', 'PLATINUM'] as const;

type GuestDetail = Guest & { reservations?: Reservation[] };

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nationality: '',
  vipLevel: 'NONE',
  passportNo: '',
  loyaltyPoints: '',
};

export default function GuestsPage() {
  const [data, setData] = useState<Paginated<Guest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Create / edit modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Detail modal
  const [detail, setDetail] = useState<GuestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<Paginated<Guest>>(`/guests${qs({ search: term, page, limit })}`)
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(load, [term, page]);

  // Debounce search input → term
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setTerm(search.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (g: Guest) => {
    setEditingId(g.id);
    setForm({
      firstName: g.firstName,
      lastName: g.lastName,
      email: g.email ?? '',
      phone: g.phone ?? '',
      nationality: g.nationality ?? '',
      vipLevel: g.vipLevel,
      passportNo: '',
      loyaltyPoints: String(g.loyaltyPoints ?? ''),
    });
    setFormError('');
    setDetail(null);
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const body: Record<string, unknown> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || undefined,
      phone: form.phone || undefined,
      nationality: form.nationality || undefined,
      vipLevel: form.vipLevel,
      passportNo: form.passportNo || undefined,
      loyaltyPoints: form.loyaltyPoints === '' ? undefined : Number(form.loyaltyPoints),
    };
    try {
      if (editingId) {
        await api.patch<Guest>(`/guests/${editingId}`, body);
      } else {
        await api.post<Guest>('/guests', body);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save guest');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    api
      .get<GuestDetail>(`/guests/${id}`)
      .then(setDetail)
      .finally(() => setDetailLoading(false));
  };

  const guests = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Guests"
        subtitle="Search and manage guest profiles"
        action={<Button onClick={openCreate}>Add guest</Button>}
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingState label="Loading guests…" />
      ) : guests.length === 0 ? (
        <EmptyState
          title="No guests found"
          description={term ? 'Try a different search term.' : 'Add your first guest to get started.'}
          action={<Button onClick={openCreate}>Add guest</Button>}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-card">
          <Table>
            <thead>
              <tr className="border-b border-slate-100">
                <Th>Guest</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Nationality</Th>
                <Th>VIP</Th>
                <Th className="text-right">Loyalty points</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {guests.map((g) => (
                <tr
                  key={g.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => openDetail(g.id)}
                >
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar text={initials(g.firstName, g.lastName)} className="h-8 w-8 text-xs" />
                      <span className="font-medium">
                        {g.firstName} {g.lastName}
                      </span>
                    </div>
                  </Td>
                  <Td className="text-muted">{g.email || '—'}</Td>
                  <Td className="text-muted">{g.phone || '—'}</Td>
                  <Td>{g.nationality || '—'}</Td>
                  <Td>
                    <Badge className={vipColor(g.vipLevel)}>{labelize(g.vipLevel)}</Badge>
                  </Td>
                  <Td className="text-right font-semibold">{g.loyaltyPoints ?? 0}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create / edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit guest' : 'Add guest'}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="vipLevel">VIP level</Label>
              <Select
                id="vipLevel"
                value={form.vipLevel}
                onChange={(e) => setForm({ ...form, vipLevel: e.target.value })}
              >
                {VIP_LEVELS.map((v) => (
                  <option key={v} value={v}>
                    {labelize(v)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passportNo">Passport number</Label>
              <Input
                id="passportNo"
                value={form.passportNo}
                onChange={(e) => setForm({ ...form, passportNo: e.target.value })}
                placeholder={editingId ? 'Leave blank to keep' : ''}
              />
            </div>
            <div>
              <Label htmlFor="loyaltyPoints">Loyalty points</Label>
              <Input
                id="loyaltyPoints"
                type="number"
                min="0"
                value={form.loyaltyPoints}
                onChange={(e) => setForm({ ...form, loyaltyPoints: e.target.value })}
              />
            </div>
          </div>
          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Save changes' : 'Create guest'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal
        open={detailLoading || !!detail}
        onClose={() => setDetail(null)}
        title="Guest details"
        wide
      >
        {detailLoading || !detail ? (
          <LoadingState label="Loading guest…" />
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar text={initials(detail.firstName, detail.lastName)} />
                <div>
                  <p className="text-lg font-semibold text-ink">
                    {detail.firstName} {detail.lastName}
                  </p>
                  <Badge className={vipColor(detail.vipLevel)}>{labelize(detail.vipLevel)}</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => openEdit(detail)}>
                Edit
              </Button>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="font-medium text-ink">{detail.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-muted">Phone</dt>
                <dd className="font-medium text-ink">{detail.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-muted">Nationality</dt>
                <dd className="font-medium text-ink">{detail.nationality || '—'}</dd>
              </div>
              <div>
                <dt className="text-muted">Loyalty points</dt>
                <dd className="font-medium text-ink">{detail.loyaltyPoints ?? 0}</dd>
              </div>
              <div>
                <dt className="text-muted">Passport</dt>
                <dd className="font-mono font-medium text-ink">{detail.passportNoMasked || '—'}</dd>
              </div>
            </dl>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-ink">Recent reservations</h4>
              {!detail.reservations || detail.reservations.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-muted">
                  No reservations on file.
                </p>
              ) : (
                <Table>
                  <thead>
                    <tr className="border-b border-slate-100">
                      <Th>Confirmation</Th>
                      <Th>Check-in</Th>
                      <Th>Check-out</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {detail.reservations.map((r) => (
                      <tr key={r.id}>
                        <Td className="font-mono text-xs text-muted">{r.confirmationNo}</Td>
                        <Td>{formatDate(r.checkInDate)}</Td>
                        <Td>{formatDate(r.checkOutDate)}</Td>
                        <Td>{labelize(r.status)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

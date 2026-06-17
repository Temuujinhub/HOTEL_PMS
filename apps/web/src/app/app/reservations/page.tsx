'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, qs, ApiError } from '@/lib/api';
import { useProperty } from '@/components/shell';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Label,
  LoadingState,
  Modal,
  PageHeader,
  Select,
  Table,
  Td,
  Th,
} from '@/components/ui';
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  initials,
  labelize,
  reservationColor,
  toDateInput,
} from '@/lib/format';
import type { Paginated, Reservation, ReservationStatus, Room, RoomType } from '@/lib/types';

const STATUSES: ReservationStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
  'NO_SHOW',
];

const CHANNELS = [
  'DIRECT',
  'WALK_IN',
  'BOOKING_COM',
  'AIRBNB',
  'EXPEDIA',
  'AGODA',
  'TRIP_COM',
  'VRBO',
  'GOOGLE',
  'OTHER',
];

const PAGE_LIMIT = 15;

function todayInput(): string {
  return toDateInput(new Date());
}

function tomorrowInput(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateInput(d);
}

export default function ReservationsPage() {
  const { property } = useProperty();

  const [data, setData] = useState<Paginated<Reservation> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const cur = property?.currency || 'USD';

  const load = useCallback(() => {
    if (!property) return;
    setLoading(true);
    api
      .get<Paginated<Reservation>>(
        `/reservations${qs({
          propertyId: property.id,
          status: status || undefined,
          search: search || undefined,
          from: from || undefined,
          to: to || undefined,
          page,
          limit: PAGE_LIMIT,
        })}`,
      )
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [property, status, search, from, to, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [status, search, from, to, property]);

  if (!property) return <LoadingState />;

  const meta = data?.meta;
  const rows = data?.data ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reservations"
        subtitle="Manage bookings, arrivals and departures"
        action={<Button onClick={() => setCreateOpen(true)}>New reservation</Button>}
      />

      {/* Filters */}
      <Card className="mb-4">
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="f-status">Status</Label>
            <Select id="f-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {labelize(s)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="f-search">Search</Label>
            <Input
              id="f-search"
              placeholder="Confirmation or guest"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="f-from">From</Label>
            <Input id="f-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="f-to">To</Label>
            <Input id="f-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <LoadingState label="Loading reservations…" />
        ) : rows.length === 0 ? (
          <CardBody>
            <EmptyState
              title="No reservations found"
              description="Try adjusting your filters or create a new reservation."
              action={<Button onClick={() => setCreateOpen(true)}>New reservation</Button>}
            />
          </CardBody>
        ) : (
          <>
            <Table>
              <thead>
                <tr className="border-b border-slate-100">
                  <Th>Guest</Th>
                  <Th>Confirmation</Th>
                  <Th>Room type</Th>
                  <Th>Dates</Th>
                  <Th>Channel</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setDetailId(r.id)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        <Avatar text={initials(r.guest?.firstName, r.guest?.lastName)} className="h-8 w-8 text-xs" />
                        <span className="font-medium">
                          {r.guest?.firstName} {r.guest?.lastName}
                        </span>
                      </div>
                    </Td>
                    <Td className="font-mono text-xs text-muted">{r.confirmationNo}</Td>
                    <Td>{r.roomType?.name ?? '—'}</Td>
                    <Td>
                      <span className="text-sm">
                        {formatDateShort(r.checkInDate)} → {formatDateShort(r.checkOutDate)}
                      </span>
                      <span className="ml-1 text-xs text-muted">
                        ({r.nights} {r.nights === 1 ? 'night' : 'nights'})
                      </span>
                    </Td>
                    <Td>{labelize(r.channel)}</Td>
                    <Td>
                      <Badge className={reservationColor(r.status)}>{labelize(r.status)}</Badge>
                    </Td>
                    <Td className="text-right font-semibold">{formatCurrency(r.totalAmount, r.currency)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            {meta && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
                <span className="text-muted">
                  Page {meta.page} of {meta.totalPages || 1} · {meta.total} total
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page >= (meta.totalPages || 1)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {createOpen && (
        <CreateReservationModal
          propertyId={property.id}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            load();
          }}
        />
      )}

      {detailId && (
        <DetailModal
          id={detailId}
          currency={cur}
          onClose={() => setDetailId(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

// ---- Create reservation modal ---------------------------------------------

function CreateReservationModal({
  propertyId,
  onClose,
  onCreated,
}: {
  propertyId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomTypeId, setRoomTypeId] = useState('');
  const [checkInDate, setCheckInDate] = useState(todayInput());
  const [checkOutDate, setCheckOutDate] = useState(tomorrowInput());
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [channel, setChannel] = useState('DIRECT');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<RoomType[]>(`/rooms/types${qs({ propertyId })}`)
      .then((types) => {
        setRoomTypes(types);
        setRoomTypeId((cur) => cur || types[0]?.id || '');
      })
      .catch(() => setRoomTypes([]));
  }, [propertyId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post<Reservation>('/reservations', {
        propertyId,
        roomTypeId,
        guest: {
          firstName,
          lastName,
          email: email || undefined,
          phone: phone || undefined,
          nationality: nationality || undefined,
        },
        checkInDate,
        checkOutDate,
        adults,
        children,
        channel,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create reservation');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="New reservation" wide>
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="r-type">Room type</Label>
            <Select
              id="r-type"
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              required
            >
              {roomTypes.length === 0 && <option value="">No room types available</option>}
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="r-in">Check-in</Label>
            <Input
              id="r-in"
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="r-out">Check-out</Label>
            <Input
              id="r-out"
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="r-adults">Adults</Label>
            <Input
              id="r-adults"
              type="number"
              min={1}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="r-children">Children</Label>
            <Input
              id="r-children"
              type="number"
              min={0}
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-3 text-sm font-semibold text-ink">Guest details</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="g-first">First name</Label>
              <Input
                id="g-first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="g-last">Last name</Label>
              <Input
                id="g-last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="g-email">Email</Label>
              <Input
                id="g-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="g-phone">Phone</Label>
              <Input id="g-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="g-nat">Nationality</Label>
              <Input
                id="g-nat"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="g-channel">Channel</Label>
              <Select id="g-channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {labelize(c)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={!roomTypeId}>
            Create reservation
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ---- Detail modal ----------------------------------------------------------

function DetailModal({
  id,
  currency,
  onClose,
  onChanged,
}: {
  id: string;
  currency: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [res, setRes] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check-in room selection
  const [availableRooms, setAvailableRooms] = useState<Room[] | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [pickingRoom, setPickingRoom] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    api
      .get<Reservation>(`/reservations/${id}`)
      .then(setRes)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load reservation'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function startCheckIn() {
    if (!res) return;
    setError(null);
    // Room already assigned → check in directly.
    if (res.room?.id) {
      await doCheckIn();
      return;
    }
    // Otherwise fetch availability so the user can pick a room.
    setBusy(true);
    try {
      const avail = await api.get<{ rooms: Room[] }>(
        `/reservations/availability${qs({
          propertyId: (res as Reservation & { propertyId?: string }).propertyId,
          roomTypeId: res.roomType?.id,
          checkInDate: res.checkInDate.slice(0, 10),
          checkOutDate: res.checkOutDate.slice(0, 10),
        })}`,
      );
      setAvailableRooms(avail.rooms ?? []);
      setSelectedRoomId(avail.rooms?.[0]?.id ?? '');
      setPickingRoom(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load availability');
    } finally {
      setBusy(false);
    }
  }

  async function doCheckIn() {
    setError(null);
    setBusy(true);
    try {
      await api.post(`/reservations/${id}/check-in`, selectedRoomId ? { roomId: selectedRoomId } : {});
      setPickingRoom(false);
      reload();
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Check-in failed');
    } finally {
      setBusy(false);
    }
  }

  async function doCheckOut() {
    setError(null);
    setBusy(true);
    try {
      await api.post(`/reservations/${id}/check-out`);
      reload();
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Check-out failed');
    } finally {
      setBusy(false);
    }
  }

  async function doCancel() {
    setError(null);
    setBusy(true);
    try {
      await api.post(`/reservations/${id}/cancel`, { reason: 'Cancelled from dashboard' });
      reload();
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Cancellation failed');
    } finally {
      setBusy(false);
    }
  }

  const canCheckIn = res?.status === 'CONFIRMED' || res?.status === 'PENDING';
  const canCheckOut = res?.status === 'CHECKED_IN';
  const canCancel = res?.status === 'CONFIRMED' || res?.status === 'PENDING';

  return (
    <Modal open onClose={onClose} title={res ? `Reservation ${res.confirmationNo}` : 'Reservation'} wide>
      {loading ? (
        <LoadingState label="Loading reservation…" />
      ) : !res ? (
        <p className="py-6 text-center text-sm text-muted">{error || 'Reservation not found.'}</p>
      ) : (
        <div className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Avatar text={initials(res.guest?.firstName, res.guest?.lastName)} />
            <div>
              <p className="font-semibold text-ink">
                {res.guest?.firstName} {res.guest?.lastName}
              </p>
              <p className="text-xs text-muted">{res.guest?.email || 'No email on file'}</p>
            </div>
            <Badge className={`ml-auto ${reservationColor(res.status)}`}>{labelize(res.status)}</Badge>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            <Info label="Room type" value={res.roomType?.name ?? '—'} />
            <Info label="Room" value={res.room?.roomNumber ?? 'Unassigned'} />
            <Info label="Channel" value={labelize(res.channel)} />
            <Info label="Check-in" value={formatDate(res.checkInDate)} />
            <Info label="Check-out" value={formatDate(res.checkOutDate)} />
            <Info label="Nights" value={String(res.nights)} />
            <Info label="Adults" value={String(res.adults)} />
            <Info label="Children" value={String(res.children)} />
          </div>

          {/* Folio summary */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-sm font-semibold text-ink">Folio summary</p>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Info
                label="Total charges"
                value={formatCurrency(res.folio?.totalCharges ?? res.totalAmount, res.folio?.currency ?? currency)}
              />
              <Info
                label="Payments"
                value={formatCurrency(res.folio?.totalPayments ?? res.paidAmount, res.folio?.currency ?? currency)}
              />
              <Info
                label="Balance"
                value={formatCurrency(res.folio?.balance ?? 0, res.folio?.currency ?? currency)}
                accent="text-brand-700 font-semibold"
              />
            </div>
          </div>

          {/* Room picker for unassigned check-in */}
          {pickingRoom && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
              <Label htmlFor="ci-room">Assign a room to check in</Label>
              {availableRooms && availableRooms.length > 0 ? (
                <Select
                  id="ci-room"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  {availableRooms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      Room {rm.roomNumber}
                      {rm.roomType?.code ? ` · ${rm.roomType.code}` : ''}
                      {rm.floor != null ? ` · Floor ${rm.floor}` : ''}
                    </option>
                  ))}
                </Select>
              ) : (
                <p className="text-sm text-muted">No rooms available for these dates.</p>
              )}
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPickingRoom(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  loading={busy}
                  disabled={!selectedRoomId}
                  onClick={doCheckIn}
                >
                  Confirm check-in
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          {!pickingRoom && (canCheckIn || canCheckOut || canCancel) && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              {canCancel && (
                <Button variant="danger" loading={busy} onClick={doCancel}>
                  Cancel
                </Button>
              )}
              {canCheckIn && (
                <Button loading={busy} onClick={startCheckIn}>
                  Check in
                </Button>
              )}
              {canCheckOut && (
                <Button loading={busy} onClick={doCheckOut}>
                  Check out
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function Info({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 ${accent ?? 'text-ink'}`}>{value}</p>
    </div>
  );
}

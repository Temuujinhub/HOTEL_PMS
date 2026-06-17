'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, qs, ApiError } from '@/lib/api';
import { useProperty } from '@/components/shell';
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Label,
  LoadingState,
  Modal,
  PageHeader,
  Select,
  StatCard,
} from '@/components/ui';
import { formatDateShort, labelize, roomColor } from '@/lib/format';
import type { Room, RoomStatus } from '@/lib/types';

const ROOM_STATUSES: RoomStatus[] = [
  'AVAILABLE',
  'OCCUPIED',
  'DIRTY',
  'CLEAN',
  'INSPECTED',
  'OUT_OF_ORDER',
  'DND',
];

// Statuses surfaced in the legend / summary cards.
const LEGEND: RoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'DIRTY', 'CLEAN', 'INSPECTED', 'OUT_OF_ORDER', 'DND'];

export default function RoomsPage() {
  const { property } = useProperty();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Room | null>(null);

  const load = useCallback(() => {
    if (!property) return;
    setLoading(true);
    api
      .get<Room[]>(`/rooms/rack${qs({ propertyId: property.id })}`)
      .then(setRooms)
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [property]);

  useEffect(() => {
    load();
  }, [load]);

  // Counts by status for the summary cards.
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rooms) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rooms]);

  // Group rooms by floor (ascending), unknown floors last.
  const floors = useMemo(() => {
    const map = new Map<number | 'none', Room[]>();
    for (const r of rooms) {
      const key = r.floor ?? 'none';
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    const sortedFloors = Array.from(map.keys()).sort((a, b) => {
      if (a === 'none') return 1;
      if (b === 'none') return -1;
      return (a as number) - (b as number);
    });
    return sortedFloors.map((floor) => ({
      floor,
      rooms: (map.get(floor) ?? []).sort((a, b) =>
        a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }),
      ),
    }));
  }, [rooms]);

  if (!property) return <LoadingState />;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Rooms" subtitle="Live room rack and housekeeping status" />

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Available" value={counts.AVAILABLE ?? 0} accent="text-emerald-600" />
        <StatCard label="Occupied" value={counts.OCCUPIED ?? 0} accent="text-blue-600" />
        <StatCard label="Dirty" value={counts.DIRTY ?? 0} accent="text-amber-600" />
        <StatCard label="Out of order" value={counts.OUT_OF_ORDER ?? 0} accent="text-red-600" />
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Legend:</span>
        {LEGEND.map((s) => (
          <Badge key={s} className={roomColor(s)}>
            {labelize(s)}
          </Badge>
        ))}
      </div>

      {/* Rack */}
      {loading ? (
        <LoadingState label="Loading rooms…" />
      ) : rooms.length === 0 ? (
        <EmptyState
          title="No rooms found"
          description="This property doesn't have any rooms configured yet."
        />
      ) : (
        <div className="space-y-6">
          {floors.map(({ floor, rooms: floorRooms }) => (
            <Card key={String(floor)}>
              <div className="border-b border-slate-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-ink">
                  {floor === 'none' ? 'Unassigned floor' : `Floor ${floor}`}
                  <span className="ml-2 text-xs font-normal text-muted">
                    {floorRooms.length} {floorRooms.length === 1 ? 'room' : 'rooms'}
                  </span>
                </h3>
              </div>
              <CardBody>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {floorRooms.map((room) => (
                    <RoomTile key={room.id} room={room} onClick={() => setSelected(room)} />
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <RoomStatusModal
          room={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function RoomTile({ room, onClick }: { room: Room; onClick: () => void }) {
  const res = room.currentReservation;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col rounded-lg border p-3 text-left transition hover:shadow-card ${roomColor(room.status)}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-bold">{room.roomNumber}</span>
        {room.roomType?.code && (
          <span className="rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-semibold">
            {room.roomType.code}
          </span>
        )}
      </div>
      <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide opacity-80">
        {labelize(room.status)}
      </span>
      {res ? (
        <span className="mt-2 truncate text-xs font-medium">
          {res.guest?.lastName} · out {formatDateShort(res.checkOutDate)}
        </span>
      ) : (
        <span className="mt-2 text-xs opacity-60">Vacant</span>
      )}
    </button>
  );
}

function RoomStatusModal({
  room,
  onClose,
  onSaved,
}: {
  room: Room;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<RoomStatus>(room.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setBusy(true);
    try {
      await api.patch(`/rooms/${room.id}/status`, { status });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update room status');
    } finally {
      setBusy(false);
    }
  }

  const res = room.currentReservation;

  return (
    <Modal open onClose={onClose} title={`Room ${room.roomNumber}`}>
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted">Room type</p>
            <p className="mt-0.5 text-ink">
              {room.roomType?.name ?? '—'}
              {room.roomType?.code ? ` (${room.roomType.code})` : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Floor</p>
            <p className="mt-0.5 text-ink">{room.floor ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Current status</p>
            <p className="mt-0.5">
              <Badge className={roomColor(room.status)}>{labelize(room.status)}</Badge>
            </p>
          </div>
          {res && (
            <div>
              <p className="text-xs text-muted">Guest</p>
              <p className="mt-0.5 text-ink">
                {res.guest?.firstName} {res.guest?.lastName}
              </p>
              <p className="text-xs text-muted">Out {formatDateShort(res.checkOutDate)}</p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="room-status">Change status</Label>
          <Select
            id="room-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as RoomStatus)}
          >
            {ROOM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {labelize(s)}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={status === room.status} onClick={save}>
            Save status
          </Button>
        </div>
      </div>
    </Modal>
  );
}

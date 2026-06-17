'use client';

import { useEffect, useState } from 'react';
import { api, qs } from '@/lib/api';
import { useProperty } from '@/components/shell';
import {
  Badge,
  EmptyState,
  LoadingState,
  PageHeader,
  Select,
  StatCard,
  Table,
  Td,
  Th,
} from '@/components/ui';
import { hkColor, labelize } from '@/lib/format';
import type { HousekeepingStatus, HousekeepingTask } from '@/lib/types';

const STATUSES: HousekeepingStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'INSPECTED',
  'REJECTED',
];

const HK_ROLES = ['HOUSEKEEPING', 'HOUSEKEEPING_SUPERVISOR'];

interface UserLite {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function HousekeepingPage() {
  const { property } = useProperty();
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [housekeepers, setHousekeepers] = useState<UserLite[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    if (!property) return;
    setLoading(true);
    api
      .get<HousekeepingTask[]>(
        `/housekeeping/tasks${qs({ propertyId: property.id, status: statusFilter || undefined })}`,
      )
      .then(setTasks)
      .finally(() => setLoading(false));
  };

  useEffect(load, [property, statusFilter]);

  useEffect(() => {
    api
      .get<UserLite[]>('/users')
      .then((users) => setHousekeepers(users.filter((u) => HK_ROLES.includes(u.role))))
      .catch(() => setHousekeepers([]));
  }, []);

  const changeStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      await api.patch(`/housekeeping/tasks/${id}/status`, { status });
      load();
    } finally {
      setBusyId(null);
    }
  };

  const assign = async (id: string, assignedToId: string) => {
    setBusyId(id);
    try {
      await api.patch(`/housekeeping/tasks/${id}/assign`, { assignedToId });
      load();
    } finally {
      setBusyId(null);
    }
  };

  if (!property) return <LoadingState label="Loading property…" />;

  // Counts by status (always over the currently loaded set)
  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s).length;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Housekeeping"
        subtitle="Track and assign room cleaning tasks"
        action={
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {labelize(s)}
              </option>
            ))}
          </Select>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {STATUSES.map((s) => (
          <StatCard key={s} label={labelize(s)} value={counts[s] ?? 0} />
        ))}
      </div>

      {loading ? (
        <LoadingState label="Loading tasks…" />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No housekeeping tasks"
          description={
            statusFilter
              ? 'No tasks match this status filter.'
              : 'There are no housekeeping tasks for this property.'
          }
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-card">
          <Table>
            <thead>
              <tr className="border-b border-slate-100">
                <Th>Room</Th>
                <Th>Type</Th>
                <Th>Priority</Th>
                <Th>Assigned to</Th>
                <Th>Status</Th>
                <Th>Change status</Th>
                <Th>Assign</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <Td>
                    <span className="font-medium">{t.room?.roomNumber ?? '—'}</span>
                    {t.room?.floor != null && (
                      <span className="ml-1 text-xs text-muted">Floor {t.room.floor}</span>
                    )}
                  </Td>
                  <Td>{labelize(t.type)}</Td>
                  <Td>
                    <Badge className="bg-slate-100 text-slate-600">{labelize(t.priority)}</Badge>
                  </Td>
                  <Td>
                    {t.assignedTo ? (
                      `${t.assignedTo.firstName} ${t.assignedTo.lastName}`
                    ) : (
                      <span className="text-muted">Unassigned</span>
                    )}
                  </Td>
                  <Td>
                    <Badge className={hkColor(t.status)}>{labelize(t.status)}</Badge>
                  </Td>
                  <Td>
                    <Select
                      className="w-36"
                      value={t.status}
                      disabled={busyId === t.id}
                      onChange={(e) => changeStatus(t.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {labelize(s)}
                        </option>
                      ))}
                    </Select>
                  </Td>
                  <Td>
                    <Select
                      className="w-44"
                      value=""
                      disabled={busyId === t.id}
                      onChange={(e) => {
                        if (e.target.value) assign(t.id, e.target.value);
                      }}
                    >
                      <option value="">Assign to…</option>
                      {housekeepers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName}
                        </option>
                      ))}
                    </Select>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

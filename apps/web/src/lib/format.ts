export function formatCurrency(amount: number | string, currency = 'USD'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(isNaN(n) ? 0 : n);
  } catch {
    return `${currency} ${(n || 0).toFixed(0)}`;
  }
}

export function formatMoney(amount: number | string, currency = 'USD'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(isNaN(n) ? 0 : n);
  } catch {
    return `${currency} ${(n || 0).toFixed(2)}`;
  }
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function initials(first?: string, last?: string): string {
  return `${(first?.[0] ?? '').toUpperCase()}${(last?.[0] ?? '').toUpperCase()}` || '?';
}

const RESERVATION_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  CHECKED_IN: 'bg-emerald-100 text-emerald-700',
  CHECKED_OUT: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-red-100 text-red-700',
};

const ROOM_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  OCCUPIED: 'bg-blue-100 text-blue-700 border-blue-200',
  DIRTY: 'bg-amber-100 text-amber-700 border-amber-200',
  CLEAN: 'bg-teal-100 text-teal-700 border-teal-200',
  INSPECTED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  OUT_OF_ORDER: 'bg-red-100 text-red-700 border-red-200',
  DND: 'bg-purple-100 text-purple-700 border-purple-200',
};

const HK_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-teal-100 text-teal-700',
  INSPECTED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const VIP_COLORS: Record<string, string> = {
  NONE: 'bg-slate-100 text-slate-500',
  SILVER: 'bg-slate-200 text-slate-700',
  GOLD: 'bg-amber-100 text-amber-700',
  PLATINUM: 'bg-violet-100 text-violet-700',
};

export function reservationColor(s: string): string {
  return RESERVATION_COLORS[s] ?? 'bg-slate-100 text-slate-600';
}
export function roomColor(s: string): string {
  return ROOM_COLORS[s] ?? 'bg-slate-100 text-slate-600 border-slate-200';
}
export function hkColor(s: string): string {
  return HK_COLORS[s] ?? 'bg-slate-100 text-slate-600';
}
export function vipColor(s: string): string {
  return VIP_COLORS[s] ?? 'bg-slate-100 text-slate-500';
}
export function labelize(s: string): string {
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

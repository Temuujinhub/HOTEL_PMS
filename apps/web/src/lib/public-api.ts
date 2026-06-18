// Client for the unauthenticated per-hotel booking API.
export const PUBLIC_API_BASE =
  (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '') + '/api/v1/public';

async function handle(res: Response) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const msg = data?.message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg || `Request failed (${res.status})`);
  }
  return data;
}

export type PublicRoomType = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  baseRate: number;
  maxOccupancy: number;
  maxAdults: number;
  bedType?: string | null;
  sizeSqm?: number | null;
  amenities: string[];
  photos: string[];
  available?: number;
  nightlyRate?: number;
  nights?: number;
  totalPrice?: number;
};

export type PublicProperty = {
  slug: string;
  name: string;
  description?: string | null;
  city?: string | null;
  country?: string | null;
  addressLine?: string | null;
  phone?: string | null;
  email?: string | null;
  currency: string;
  checkInTime: string;
  checkOutTime: string;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  images: string[];
};

export type BookingResult = {
  confirmationNo: string;
  status: string;
  propertyName: string;
  guestName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  currency: string;
  totalAmount: number;
  checkInTime?: string;
  checkOutTime?: string;
};

export const publicApi = {
  async property(slug: string): Promise<{ property: PublicProperty; roomTypes: PublicRoomType[] }> {
    return handle(await fetch(`${PUBLIC_API_BASE}/properties/${slug}`, { cache: 'no-store' }));
  },
  async availability(
    slug: string,
    q: { checkInDate: string; checkOutDate: string; adults?: number; children?: number },
  ): Promise<{ checkInDate: string; checkOutDate: string; nights: number; currency: string; roomTypes: PublicRoomType[] }> {
    const params = new URLSearchParams({
      checkInDate: q.checkInDate,
      checkOutDate: q.checkOutDate,
      adults: String(q.adults ?? 1),
      children: String(q.children ?? 0),
    });
    return handle(await fetch(`${PUBLIC_API_BASE}/properties/${slug}/availability?${params}`, { cache: 'no-store' }));
  },
  async book(
    slug: string,
    body: {
      roomTypeId: string;
      checkInDate: string;
      checkOutDate: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      nationality?: string;
      adults?: number;
      children?: number;
      specialRequests?: string;
    },
  ): Promise<BookingResult> {
    return handle(
      await fetch(`${PUBLIC_API_BASE}/properties/${slug}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
  },
  async lookup(slug: string, confirmationNo: string, lastName: string) {
    const params = new URLSearchParams({ lastName });
    return handle(
      await fetch(`${PUBLIC_API_BASE}/properties/${slug}/reservations/${confirmationNo}?${params}`, {
        cache: 'no-store',
      }),
    );
  },
};

// Date helpers
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
export function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

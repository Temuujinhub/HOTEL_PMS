// Shared types mirroring the API responses.

export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'GM'
  | 'FRONT_DESK_MANAGER'
  | 'FRONT_DESK'
  | 'HOUSEKEEPING_SUPERVISOR'
  | 'HOUSEKEEPING'
  | 'FINANCE_MANAGER'
  | 'REVENUE_MANAGER';

export type RoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'DIRTY'
  | 'CLEAN'
  | 'INSPECTED'
  | 'OUT_OF_ORDER'
  | 'DND';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

export type HousekeepingStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'INSPECTED'
  | 'REJECTED';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  propertyId?: string | null;
  tenant?: { id: string; name: string; slug: string; currency: string };
  property?: { id: string; name: string; currency: string; taxRate: string };
}

export interface Property {
  id: string;
  name: string;
  city?: string | null;
  country: string;
  currency: string;
  taxRate: string;
  checkInTime: string;
  checkOutTime: string;
  totalFloors?: number | null;
  isActive: boolean;
}

export interface RoomType {
  id: string;
  name: string;
  code: string;
  baseRate: string;
  maxOccupancy: number;
  bedType?: string | null;
  _count?: { rooms: number };
}

export interface Room {
  id: string;
  roomNumber: string;
  floor?: number | null;
  status: RoomStatus;
  roomTypeId: string;
  roomType?: { id: string; name: string; code: string };
  lockProvider: string;
  currentReservation?: {
    id: string;
    status: ReservationStatus;
    confirmationNo: string;
    checkOutDate: string;
    guest: { firstName: string; lastName: string; vipLevel: string };
  } | null;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  nationality?: string | null;
  vipLevel: 'NONE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  loyaltyPoints: number;
  passportNoMasked?: string | null;
}

export interface Reservation {
  id: string;
  confirmationNo: string;
  status: ReservationStatus;
  channel: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  children: number;
  currency: string;
  totalAmount: string;
  paidAmount: string;
  guest?: { id: string; firstName: string; lastName: string; vipLevel?: string; email?: string };
  room?: { id: string; roomNumber: string } | null;
  roomType?: { id: string; name: string };
  folio?: Folio;
}

export interface FolioItem {
  id: string;
  type: string;
  description: string;
  quantity: number;
  amount: string;
  taxAmount: string;
  currency: string;
}

export interface Payment {
  id: string;
  direction: 'CHARGE' | 'REFUND';
  method: string;
  status: string;
  amount: string;
  currency: string;
  createdAt: string;
}

export interface Folio {
  id: string;
  number: string;
  status: string;
  currency: string;
  totalCharges: string;
  totalPayments: string;
  balance: string;
  items?: FolioItem[];
  payments?: Payment[];
}

export interface HousekeepingTask {
  id: string;
  type: string;
  priority: string;
  status: HousekeepingStatus;
  roomId: string;
  room?: { roomNumber: string; floor?: number | null };
  assignedTo?: { firstName: string; lastName: string } | null;
  createdAt: string;
}

export interface Dashboard {
  date: string;
  occupancy: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: number;
  };
  kpis: { adr: number; revpar: number; roomRevenueToday: number; paymentsToday: number };
  movements: { arrivalsToday: number; departuresToday: number; inHouse: number };
  housekeeping: { dirtyRooms: number; pendingTasks: number };
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const APP_NAME = "SPID Library Management System";
export const APP_VERSION = "1.0.0";

export const USER_ROLES = {
  ADMIN: 'admin',
  LIBRARIAN: 'librarian',
  STUDENT: 'student'
} as const;

export const BOOK_STATUSES = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  DELETED: 'deleted'
} as const;

export const ISSUE_STATUSES = {
  ISSUED: 'issued',
  RETURNED: 'returned',
  OVERDUE: 'overdue',
  RENEWED: 'renewed'
} as const;

export const RESERVATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  EXPIRED: 'expired'
} as const;

export const FINE_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  WAIVED: 'waived'
} as const;

export const DEFAULT_BOOK_COVER = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400";

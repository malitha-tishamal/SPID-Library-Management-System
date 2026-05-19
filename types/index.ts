export type UserRole = 'admin' | 'librarian' | 'student';
export type BookStatus = 'available' | 'unavailable' | 'deleted';
export type IssueStatus = 'issued' | 'returned' | 'overdue' | 'renewed';
export type ReservationStatus = 'pending' | 'approved' | 'cancelled' | 'completed' | 'expired';
export type FineStatus = 'pending' | 'paid' | 'waived';
export type ResourceType = 'ebook' | 'research_paper' | 'journal' | 'magazine' | 'other';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  student_id?: string;
  department?: string;
  token_balance: number;
  max_tokens: number;
  is_active: boolean;
  address?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  photo_url?: string;
  nationality?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
}

export interface Publisher {
  id: string;
  name: string;
  address?: string;
  website?: string;
  email?: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  isbn?: string;
  description?: string;
  cover_image_url?: string;
  pdf_url?: string;
  author_id?: string;
  category_id?: string;
  publisher_id?: string;
  author?: Author;
  category?: Category;
  publisher?: Publisher;
  total_copies: number;
  available_copies: number;
  shelf_number?: string;
  rack_number?: string;
  language: string;
  edition?: string;
  publication_year?: number;
  pages?: number;
  status: BookStatus;
  is_featured: boolean;
  is_digital: boolean;
  view_count: number;
  deleted_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface IssuedBook {
  id: string;
  book_id: string;
  user_id: string;
  issued_by?: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: IssueStatus;
  renewal_count: number;
  max_renewals: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  book?: Book;
  user?: Profile;
  issuer?: Profile;
  fine?: Fine[];
}

export interface Fine {
  id: string;
  issued_book_id: string;
  user_id: string;
  days_overdue: number;
  amount_per_day: number;
  total_amount: number;
  status: FineStatus;
  paid_at?: string;
  waived_by?: string;
  waive_reason?: string;
  created_at: string;
  updated_at: string;
  issued_book?: IssuedBook;
  user?: Profile;
}

export interface Reservation {
  id: string;
  book_id: string;
  user_id: string;
  status: ReservationStatus;
  reserved_at: string;
  expires_at?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  book?: Book;
  user?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_book_id?: string;
  related_issue_id?: string;
  created_at: string;
  book?: Book;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
  user?: Profile;
}

export interface DigitalResource {
  id: string;
  book_id?: string;
  title: string;
  description?: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  resource_type: ResourceType;
  download_count: number;
  is_public: boolean;
  created_by?: string;
  created_at: string;
  book?: Book;
}

export interface Favorite {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
  book?: Book;
}

export interface DashboardStats {
  total_books: number;
  total_students: number;
  total_librarians: number;
  currently_issued: number;
  overdue_books: number;
  fine_revenue_month: number;
  low_stock_count: number;
}

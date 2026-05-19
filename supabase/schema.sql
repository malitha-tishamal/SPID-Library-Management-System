-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'librarian', 'student');
CREATE TYPE book_status AS ENUM ('available', 'unavailable', 'deleted');
CREATE TYPE issue_status AS ENUM ('issued', 'returned', 'overdue', 'renewed');
CREATE TYPE reservation_status AS ENUM ('pending', 'approved', 'cancelled', 'completed', 'expired');
CREATE TYPE notification_type AS ENUM ('due_reminder', 'overdue', 'reservation', 'new_book', 'token_warning', 'fine', 'general');
CREATE TYPE fine_status AS ENUM ('pending', 'paid', 'waived');
CREATE TYPE resource_type AS ENUM ('ebook', 'research_paper', 'journal', 'magazine', 'other');

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  student_id TEXT UNIQUE,
  department TEXT,
  token_balance INTEGER NOT NULL DEFAULT 3,
  max_tokens INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  address TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUTHORS
-- ============================================================
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  nationality TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'Book',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PUBLISHERS
-- ============================================================
CREATE TABLE IF NOT EXISTS publishers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  website TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  isbn TEXT UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  pdf_url TEXT,
  author_id UUID REFERENCES authors(id),
  category_id UUID REFERENCES categories(id),
  publisher_id UUID REFERENCES publishers(id),
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  shelf_number TEXT,
  rack_number TEXT,
  language TEXT DEFAULT 'English',
  edition TEXT,
  publication_year INTEGER,
  pages INTEGER,
  status book_status NOT NULL DEFAULT 'available',
  is_featured BOOLEAN DEFAULT FALSE,
  is_digital BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Search vector for full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(isbn, '')), 'C')
  ) STORED,
  
  CONSTRAINT positive_copies CHECK (available_copies >= 0),
  CONSTRAINT copies_not_exceed_total CHECK (available_copies <= total_copies)
);

-- ============================================================
-- ISSUED BOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS issued_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  issued_by UUID REFERENCES profiles(id),  -- librarian who issued
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  status issue_status NOT NULL DEFAULT 'issued',
  renewal_count INTEGER DEFAULT 0,
  max_renewals INTEGER DEFAULT 2,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FINES
-- ============================================================
CREATE TABLE IF NOT EXISTS fines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issued_book_id UUID NOT NULL REFERENCES issued_books(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  days_overdue INTEGER NOT NULL DEFAULT 0,
  amount_per_day DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status fine_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  waived_by UUID REFERENCES profiles(id),
  waive_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  status reservation_status NOT NULL DEFAULT 'pending',
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  related_book_id UUID REFERENCES books(id),
  related_issue_id UUID REFERENCES issued_books(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REVIEWS / RATINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(book_id, user_id)
);

-- ============================================================
-- DIGITAL RESOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS digital_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  resource_type resource_type NOT NULL DEFAULT 'ebook',
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FAVORITES / WISHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  book_id UUID NOT NULL REFERENCES books(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default settings
INSERT INTO settings (key, value, description) VALUES
  ('max_borrow_tokens', '3', 'Maximum books a student can borrow at once'),
  ('fine_per_day', '5.00', 'Fine amount per overdue day (in currency)'),
  ('default_borrow_days', '14', 'Default borrow duration in days'),
  ('max_renewals', '2', 'Maximum renewal count per issue'),
  ('reservation_expiry_hours', '48', 'Hours before reservation expires')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_books_search ON books USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_available ON books(available_copies) WHERE available_copies > 0;
CREATE INDEX IF NOT EXISTS idx_issued_status ON issued_books(status);
CREATE INDEX IF NOT EXISTS idx_issued_user ON issued_books(user_id);
CREATE INDEX IF NOT EXISTS idx_issued_due ON issued_books(due_date) WHERE status = 'issued';
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_book ON reservations(book_id);

-- ============================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_books_updated BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_issued_updated BEFORE UPDATE ON issued_books FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_fines_updated BEFORE UPDATE ON fines FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Issue book: decrement available copies + decrement user token
CREATE OR REPLACE FUNCTION issue_book(
  p_book_id UUID,
  p_user_id UUID,
  p_issued_by UUID,
  p_due_date DATE
) RETURNS UUID AS $$
DECLARE
  v_issue_id UUID;
  v_available INT;
  v_token_balance INT;
BEGIN
  -- Lock and check book availability
  SELECT available_copies INTO v_available FROM books WHERE id = p_book_id FOR UPDATE;
  IF v_available <= 0 THEN RAISE EXCEPTION 'Book is not available'; END IF;

  -- Check user token
  SELECT token_balance INTO v_token_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF v_token_balance <= 0 THEN RAISE EXCEPTION 'Insufficient tokens'; END IF;

  -- Insert issue record
  INSERT INTO issued_books (book_id, user_id, issued_by, due_date)
  VALUES (p_book_id, p_user_id, p_issued_by, p_due_date)
  RETURNING id INTO v_issue_id;

  -- Decrement book copies
  UPDATE books SET available_copies = available_copies - 1 WHERE id = p_book_id;

  -- Decrement user token
  UPDATE profiles SET token_balance = token_balance - 1 WHERE id = p_user_id;

  RETURN v_issue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Return book: increment copies + restore token + calculate fine
CREATE OR REPLACE FUNCTION return_book(
  p_issue_id UUID,
  p_returned_by UUID
) RETURNS JSONB AS $$
DECLARE
  v_issue issued_books%ROWTYPE;
  v_days_overdue INT;
  v_fine_amount DECIMAL;
  v_fine_per_day DECIMAL;
  v_fine_id UUID;
BEGIN
  SELECT * INTO v_issue FROM issued_books WHERE id = p_issue_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Issue record not found'; END IF;
  IF v_issue.status = 'returned' THEN RAISE EXCEPTION 'Book already returned'; END IF;

  -- Calculate overdue
  v_days_overdue := GREATEST(0, CURRENT_DATE - v_issue.due_date);
  SELECT (value::TEXT)::DECIMAL INTO v_fine_per_day FROM settings WHERE key = 'fine_per_day';
  v_fine_amount := v_days_overdue * COALESCE(v_fine_per_day, 5.00);

  -- Update issue record
  UPDATE issued_books
  SET status = 'returned', return_date = CURRENT_DATE, updated_at = NOW()
  WHERE id = p_issue_id;

  -- Restore book copy
  UPDATE books SET available_copies = available_copies + 1 WHERE id = v_issue.book_id;

  -- Restore user token
  UPDATE profiles SET token_balance = token_balance + 1 WHERE id = v_issue.user_id;

  -- Create fine if overdue
  IF v_days_overdue > 0 THEN
    INSERT INTO fines (issued_book_id, user_id, days_overdue, amount_per_day, total_amount)
    VALUES (p_issue_id, v_issue.user_id, v_days_overdue, COALESCE(v_fine_per_day, 5.00), v_fine_amount)
    RETURNING id INTO v_fine_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'days_overdue', v_days_overdue,
    'fine_amount', v_fine_amount,
    'fine_id', v_fine_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark overdue books (run via cron / edge function)
CREATE OR REPLACE FUNCTION mark_overdue_books() RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  UPDATE issued_books
  SET status = 'overdue', updated_at = NOW()
  WHERE status = 'issued' AND due_date < CURRENT_DATE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recommendation function: books based on user category history
CREATE OR REPLACE FUNCTION get_recommendations(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE(book_id UUID, score FLOAT) AS $$
BEGIN
  RETURN QUERY
  WITH user_categories AS (
    SELECT b.category_id, COUNT(*) AS borrow_count
    FROM issued_books ib
    JOIN books b ON b.id = ib.book_id
    WHERE ib.user_id = p_user_id
    GROUP BY b.category_id
  ),
  already_borrowed AS (
    SELECT book_id FROM issued_books WHERE user_id = p_user_id
  )
  SELECT 
    b.id AS book_id,
    (COALESCE(uc.borrow_count, 0)::FLOAT * 3 + b.view_count::FLOAT * 0.1) AS score
  FROM books b
  LEFT JOIN user_categories uc ON uc.category_id = b.category_id
  WHERE b.status = 'available'
    AND b.available_copies > 0
    AND b.id NOT IN (SELECT book_id FROM already_borrowed)
  ORDER BY score DESC, b.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

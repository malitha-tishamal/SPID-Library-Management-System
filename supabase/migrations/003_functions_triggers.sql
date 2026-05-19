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

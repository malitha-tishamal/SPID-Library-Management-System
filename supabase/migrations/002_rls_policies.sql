-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE issued_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_resources ENABLE ROW LEVEL SECURITY;

-- Helper function to get role of current user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admin/Lib see all profiles" ON profiles FOR SELECT USING (get_my_role() IN ('admin','librarian'));
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin manages all profiles" ON profiles FOR ALL USING (get_my_role() = 'admin');

-- BOOKS POLICIES
CREATE POLICY "Anyone can view active books" ON books FOR SELECT USING (status != 'deleted' OR get_my_role() IN ('admin','librarian'));
CREATE POLICY "Admin/Librarian can manage books" ON books FOR ALL USING (get_my_role() IN ('admin','librarian'));

-- ISSUED BOOKS POLICIES
CREATE POLICY "Students see own issues" ON issued_books FOR SELECT USING (user_id = auth.uid() OR get_my_role() IN ('admin','librarian'));
CREATE POLICY "Librarian/Admin manage issues" ON issued_books FOR ALL USING (get_my_role() IN ('admin','librarian'));

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admin/Lib create notifications" ON notifications FOR INSERT WITH CHECK (get_my_role() IN ('admin','librarian'));

-- FINES POLICIES
CREATE POLICY "Users see own fines" ON fines FOR SELECT USING (user_id = auth.uid() OR get_my_role() IN ('admin','librarian'));
CREATE POLICY "Admin/Lib manage fines" ON fines FOR ALL USING (get_my_role() IN ('admin','librarian'));

-- RESERVATIONS POLICIES
CREATE POLICY "Users see own reservations" ON reservations FOR SELECT USING (user_id = auth.uid() OR get_my_role() IN ('admin','librarian'));
CREATE POLICY "Students manage own reservations" ON reservations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Librarian/Admin manage reservations" ON reservations FOR ALL USING (get_my_role() IN ('admin','librarian'));

-- REVIEWS POLICIES
CREATE POLICY "Anyone see reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Students write own reviews" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Students update own reviews" ON reviews FOR UPDATE USING (user_id = auth.uid());

-- FAVORITES POLICIES
CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (user_id = auth.uid());

-- DIGITAL RESOURCES POLICIES
CREATE POLICY "Public resources visible to all" ON digital_resources FOR SELECT USING (is_public = TRUE OR get_my_role() IN ('admin','librarian'));
CREATE POLICY "Admin/Lib manage digital resources" ON digital_resources FOR ALL USING (get_my_role() IN ('admin','librarian'));

-- ACTIVITY LOGS POLICIES
CREATE POLICY "Users see own activity logs" ON activity_logs FOR SELECT USING (user_id = auth.uid() OR get_my_role() IN ('admin','librarian'));
CREATE POLICY "System inserts logs" ON activity_logs FOR INSERT WITH CHECK (TRUE);

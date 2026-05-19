-- Populate Default settings
INSERT INTO settings (key, value, description) VALUES
  ('max_borrow_tokens', '3', 'Maximum books a student can borrow at once'),
  ('fine_per_day', '5.00', 'Fine amount per overdue day (in currency)'),
  ('default_borrow_days', '14', 'Default borrow duration in days'),
  ('max_renewals', '2', 'Maximum renewal count per issue'),
  ('reservation_expiry_hours', '48', 'Hours before reservation expires')
ON CONFLICT (key) DO NOTHING;

-- Populate Categories
INSERT INTO categories (id, name, description, color, icon) VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Computer Science & IT', 'Programming, algorithms, databases, AI and networking', '#6366F1', 'Laptop'),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Mathematics & Science', 'Calculus, linear algebra, physics, chemistry and biology', '#10B981', 'Binary'),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Literature & Fiction', 'Classic novels, modern prose, drama, poetry and stories', '#EC4899', 'BookOpen'),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'History & Social Sciences', 'World history, anthropology, sociology and geography', '#F59E0B', 'Globe'),
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Business & Economics', 'Finance, management, macroeconomics and startup guides', '#06B6D4', 'Briefcase')
ON CONFLICT (name) DO NOTHING;

-- Populate Authors
INSERT INTO authors (id, name, bio, nationality) VALUES
  ('9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', 'Donald Knuth', 'Renowned computer scientist and author of The Art of Computer Programming.', 'American'),
  ('8b7c6d5e-4f3a-2b1c-0d9e-8f7a6b5c4d3e', 'Isaac Asimov', 'Prolific sci-fi writer and biochemistry professor, best known for Foundation.', 'Russian-American'),
  ('7c6d5e4f-3a2b-1c0d-9e8f-7a6b5c4d3e2f', 'Carl Sagan', 'Astronomer, planetary scientist, cosmologist, and famous science communicator.', 'American'),
  ('6d5e4f3a-2b1c-0d9e-8f7a-6b5c4d3e2f1a', 'F. Scott Fitzgerald', 'Greatest American novelist of the 20th century, author of The Great Gatsby.', 'American')
ON CONFLICT DO NOTHING;

-- Populate Publishers
INSERT INTO publishers (id, name, address, website, email) VALUES
  ('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Addison-Wesley', 'Boston, MA, USA', 'https://www.pearson.com', 'info@addisonwesley.com'),
  ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Gnome Publishing', 'New York, NY, USA', 'https://gnomepub.com', 'contact@gnomepub.com'),
  ('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Random House', 'New York, NY, USA', 'https://www.penguinrandomhouse.com', 'support@randomhouse.com'),
  ('4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'Charles Scribner''s Sons', 'New York, NY, USA', 'https://www.simonandschuster.com', 'scribner@simonandschuster.com')
ON CONFLICT DO NOTHING;

-- Populate Books
INSERT INTO books (title, isbn, description, cover_image_url, author_id, category_id, publisher_id, total_copies, available_copies, shelf_number, rack_number, language, edition, publication_year, pages, status, is_featured) VALUES
  ('The Art of Computer Programming, Vol 1', '9780201896831', 'Fundamental algorithms and computer science concepts explained by the master of computing.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400', '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 5, 5, 'CS-01', 'A-3', 'English', '3rd Edition', 1997, 672, 'available', true),
  ('Foundation', '9780553293357', 'The classic science fiction saga of a mathematical psychologist predicting the fall of an empire.', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400', '8b7c6d5e-4f3a-2b1c-0d9e-8f7a6b5c4d3e', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 8, 8, 'FIC-04', 'B-1', 'English', 'Mass Market Paper', 1951, 244, 'available', true),
  ('Cosmos', '9780345331359', 'A magnificent exploration of the universe, space, time, and science in clear and lyrical prose.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400', '7c6d5e4f-3a2b-1c0d-9e8f-7a6b5c4d3e2f', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 3, 3, 'SCI-02', 'C-2', 'English', 'Reissue Edition', 1980, 384, 'available', false),
  ('The Great Gatsby', '9780743273565', 'A portrait of the Jazz Age, wealth, ambition, and unrequited love in American society.', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400', '6d5e4f3a-2b1c-0d9e-8f7a-6b5c4d3e2f1a', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 12, 12, 'FIC-01', 'A-1', 'English', 'Scribner Classic', 1925, 180, 'available', false)
ON CONFLICT (isbn) DO NOTHING;

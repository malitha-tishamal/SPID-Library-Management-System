import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['admin', 'librarian', 'student']),
  studentId: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.role === 'student' && !data.studentId) {
    return false;
  }
  return true;
}, {
  message: "Student ID is required for student registration",
  path: ["studentId"],
});

export const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  isbn: z.string().min(10, 'ISBN must be at least 10 characters').optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  author_id: z.string().min(1, 'Author is required'),
  category_id: z.string().min(1, 'Category is required'),
  publisher_id: z.string().min(1, 'Publisher is required'),
  total_copies: z.coerce.number().min(1, 'Total copies must be at least 1'),
  available_copies: z.coerce.number().min(0).optional(),
  shelf_number: z.string().optional().or(z.literal('')),
  rack_number: z.string().optional().or(z.literal('')),
  language: z.string().min(1, 'Language is required').default('English'),
  edition: z.string().optional().or(z.literal('')),
  publication_year: z.coerce.number().int().min(1000).max(new Date().getFullYear() + 1).optional(),
  pages: z.coerce.number().int().positive().optional(),
  is_featured: z.boolean().default(false),
  is_digital: z.boolean().default(false),
  cover_image_url: z.string().url('Must be a valid cover URL').optional().or(z.literal('')),
  pdf_url: z.string().url('Must be a valid eBook PDF URL').optional().or(z.literal('')),
});

export const issueFormSchema = z.object({
  userId: z.string().min(1, 'Please select a student'),
  bookId: z.string().min(1, 'Please select a book'),
  durationDays: z.coerce.number().min(1, 'Borrow duration is required').default(14),
  notes: z.string().optional(),
});

export const returnFormSchema = z.object({
  issueId: z.string().min(1, 'Issue record is required'),
  notes: z.string().optional(),
});

export const waiveFineSchema = z.object({
  reason: z.string().min(5, 'Please provide a waive reason of at least 5 characters'),
});

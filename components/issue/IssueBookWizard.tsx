'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { issueFormSchema } from '@/lib/validators';
import { IssueService } from '@/services/issue.service';
import { UsersService } from '@/services/users.service';
import { BooksService } from '@/services/books.service';
import { Profile, Book } from '@/types';
import { z } from 'zod';
import {
  User,
  BookMarked,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Search,
  BadgeAlert,
  Printer,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';
import { cn, formatCurrency } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

type IssueFormValues = z.infer<typeof issueFormSchema>;

export default function IssueBookWizard() {
  const { profile: librarian } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successIssueId, setSuccessIssueId] = useState<string | null>(null);

  // Metadata selections
  const [students, setStudents] = useState<Profile[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

  // Selected details
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Search filters
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  // Fetch student profiles & books catalog
  useEffect(() => {
    const fetchWizardData = async () => {
      try {
        const stds = await UsersService.getProfiles('student');
        setStudents(stds);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWizardData();
  }, []);

  useEffect(() => {
    const fetchBooksCatalog = async () => {
      try {
        const booksData = await BooksService.getBooks({ search: bookSearch || undefined });
        setBooks(booksData.books.filter(b => !b.is_digital)); // only issue physical books
      } catch (err) {
        console.error(err);
      }
    };
    const timer = setTimeout(fetchBooksCatalog, 300);
    return () => clearTimeout(timer);
  }, [bookSearch]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema) as any,
    defaultValues: {
      userId: '',
      bookId: '',
      durationDays: 14,
      notes: ''
    }
  });

  const durationDaysWatch = watch('durationDays');

  // Filter students client-side
  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleSelectStudent = (student: Profile) => {
    if (!student.is_active) {
      toast.error('This student account has been marked as inactive/suspended.');
      return;
    }
    if (student.token_balance <= 0) {
      toast.error('Student has reached maximum borrow token limit (3/3 books already issued).');
      return;
    }
    setSelectedStudent(student);
    setValue('userId', student.id);
  };

  const handleSelectBook = (book: Book) => {
    if (book.available_copies <= 0) {
      toast.error('This volume is currently out of stock. You can place a reservation instead.');
      return;
    }
    setSelectedBook(book);
    setValue('bookId', book.id);
  };

  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && !selectedStudent) {
      toast.error('Please select a student first');
      return;
    }
    if (step === 2 && !selectedBook) {
      toast.error('Please select a book first');
      return;
    }
    setStep(s => s + 1);
  };

  const handleConfirmCheckout = async () => {
    if (!selectedStudent || !selectedBook || !librarian) return;
    setIsSubmitting(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Number(durationDaysWatch));

      const issueId = await IssueService.issueBook(
        selectedBook.id,
        selectedStudent.id,
        librarian.id,
        dueDate
      );

      setSuccessIssueId(issueId);
      toast.success('Book checkout completed successfully!');
      setStep(5); // Show success receipt
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedStudent(null);
    setSelectedBook(null);
    setStudentSearch('');
    setBookSearch('');
    setSuccessIssueId(null);
    setValue('userId', '');
    setValue('bookId', '');
    setValue('durationDays', 14);
    setValue('notes', '');
  };

  const dueDateCalculated = new Date();
  dueDateCalculated.setDate(dueDateCalculated.getDate() + Number(durationDaysWatch));

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm max-w-4xl mx-auto space-y-8">
      
      {/* Wizard Steps indicator */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <h3 className="font-sora font-extrabold text-lg text-slate-800 flex items-center gap-2">
          <BookMarked size={20} className="text-accent" />
          Book Issue Wizard
        </h3>

        {/* Steps visual badge list */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center font-bold border transition-colors",
                s === step
                  ? "bg-accent border-accent text-white"
                  : s < step
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-400"
              )}
            >
              {s < step ? <CheckCircle2 size={14} className="fill-emerald-500 text-white" /> : s}
            </div>
          ))}
        </div>
      </div>

      {/* Main wizard sections based on steps */}
      {step === 1 && (
        <form onSubmit={handleStepSubmit} className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-sora font-bold text-md text-slate-800">
              Step 1: Locate Student Profile
            </h4>
            <p className="text-slate-400 text-xs">
              Search by name, student registration number, or email to verify their borrowing allowance.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
            <input
              type="text"
              placeholder="Search by full name, student registration ID..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-800 text-xs focus:outline-none"
            />
          </div>

          {/* Student details display list */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-white pr-2">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-450 text-xs">
                No matching active student profiles found.
              </div>
            ) : (
              filteredStudents.map((std) => {
                const isCurrent = selectedStudent?.id === std.id;
                return (
                  <div
                    key={std.id}
                    onClick={() => handleSelectStudent(std)}
                    className={cn(
                      "p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors",
                      isCurrent && "bg-indigo-50/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-55 text-accent font-bold text-xs flex items-center justify-center bg-indigo-50">
                        {std.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-800 block">{std.full_name}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          ID: {std.student_id || 'N/A'} • {std.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border text-[10px] font-bold text-slate-650">
                        Tokens: {std.token_balance}/3
                      </span>
                      {isCurrent && <CheckCircle2 size={18} className="text-accent fill-accent text-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-accent hover:bg-accent-dark text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1 shadow-md"
            >
              Continue Book Pick
              <ChevronRight size={14} />
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStepSubmit} className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-sora font-bold text-md text-slate-800">
              Step 2: Select Book Volume
            </h4>
            <p className="text-slate-400 text-xs">
              Search the physical catalog by title, author name, or ISBN code to check available copy count.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
            <input
              type="text"
              placeholder="Search by title, authors, ISBN barcode..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-800 text-xs focus:outline-none"
            />
          </div>

          {/* Book results list */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-white pr-2">
            {books.length === 0 ? (
              <div className="p-8 text-center text-slate-450 text-xs">
                No matching physical books found.
              </div>
            ) : (
              books.map((b) => {
                const isCurrent = selectedBook?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBook(b)}
                    className={cn(
                      "p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors",
                      isCurrent && "bg-indigo-50/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={b.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
                        alt={b.title}
                        className="w-8 h-11 object-cover rounded shadow-sm border border-slate-200"
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-850 block">{b.title}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          by {b.author?.name || 'Unknown Author'} • Shelf: {b.shelf_number || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-bold text-[10px] border shadow-sm",
                        b.available_copies > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                      )}>
                        Stock: {b.available_copies}/{b.total_copies}
                      </span>
                      {isCurrent && <CheckCircle2 size={18} className="text-accent fill-accent text-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 px-6 border border-slate-250 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Go Back
            </button>
            
            <button
              type="submit"
              className="bg-accent hover:bg-accent-dark text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1 shadow-md"
            >
              Select Details
              <ChevronRight size={14} />
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleStepSubmit} className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-sora font-bold text-md text-slate-800">
              Step 3: Loan Duration & Notes
            </h4>
            <p className="text-slate-400 text-xs">
              Determine the checkout period length (default: 14 days) and record any librarian check-out notes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 block">Borrow Duration (Days)</label>
              <select
                {...register('durationDays')}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-accent"
              >
                <option value={7}>7 Days (Short course reference)</option>
                <option value={14}>14 Days (Standard study checkout)</option>
                <option value={30}>30 Days (Extended research module)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 block">Due Date Calendar Calculation</label>
              <div className="bg-indigo-50/20 border border-indigo-100 p-2.5 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
                <Calendar size={16} className="text-accent" />
                <span>
                  Expected Return Date: <strong>{dueDateCalculated.toLocaleDateString(undefined, { dateStyle: 'long' })}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 block">Librarian Internal Notes</label>
            <textarea
              rows={3}
              {...register('notes')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-855 text-xs focus:outline-none"
              placeholder="e.g. Student provided valid ID card card proof..."
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-2.5 px-6 border border-slate-250 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Go Back
            </button>
            
            <button
              type="submit"
              className="bg-accent hover:bg-accent-dark text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1 shadow-md"
            >
              Checkout Summary
              <ChevronRight size={14} />
            </button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-sora font-bold text-md text-slate-800">
              Step 4: Confirm Checkout Transaction
            </h4>
            <p className="text-slate-400 text-xs">
              Double check the checkout details prior to committing the borrowing loan.
            </p>
          </div>

          {/* Checkout Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-150 p-6 rounded-3xl">
            {/* Student metadata */}
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Student Profile</span>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-accent/10 text-accent font-bold text-sm flex items-center justify-center rounded-xl">
                  {selectedStudent?.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h5 className="font-bold text-slate-850 text-xs">{selectedStudent?.full_name}</h5>
                  <span className="text-[10px] text-slate-500 block">ID: {selectedStudent?.student_id}</span>
                </div>
              </div>
            </div>

            {/* Book metadata */}
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Book Catalog Details</span>
              <div className="flex items-center gap-3">
                <img
                  src={selectedBook?.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
                  alt={selectedBook?.title}
                  className="w-8 h-11 object-cover rounded shadow-sm border border-slate-200"
                />
                <div>
                  <h5 className="font-bold text-slate-850 text-xs line-clamp-1">{selectedBook?.title}</h5>
                  <span className="text-[10px] text-slate-500 block">Shelf location: {selectedBook?.shelf_number || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 col-span-1 md:col-span-2 pt-4 border-t border-slate-200">
              <div className="flex justify-between text-xs font-semibold text-slate-650">
                <span>Expected Checkout Duration:</span>
                <span className="text-slate-900 font-bold">{durationDaysWatch} Days</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-650 mt-2">
                <span>Calculated Due Date:</span>
                <span className="text-accent font-extrabold">{dueDateCalculated.toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-650 mt-2">
                <span>Account Rest Tokens Allowance:</span>
                <span className="text-indigo-600 font-bold">{selectedStudent ? selectedStudent.token_balance - 1 : 0} Remaining</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="py-2.5 px-6 border border-slate-250 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Go Back
            </button>
            
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmCheckout}
              className="bg-accent hover:bg-accent-dark text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <LoadingSpinner size={14} className="text-white" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Confirm Book Loan
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner border border-emerald-100 mb-4">
              <CheckCircle2 size={32} className="fill-emerald-500 text-white" />
            </div>
            <h3 className="font-sora font-extrabold text-xl text-slate-800 tracking-tight">
              Checkout Transaction Completed!
            </h3>
            <p className="text-slate-400 text-xs max-w-sm mt-1">
              Book has been successfully registered to the student's borrowing account.
            </p>
          </div>

          {/* Receipt Layout Box */}
          <div className="border border-slate-200 rounded-3xl p-6 max-w-md mx-auto text-left space-y-4 bg-slate-50/50">
            <div className="text-center border-b border-slate-200 pb-3">
              <span className="font-sora font-extrabold text-[13px] text-slate-800 tracking-wide uppercase">University Library Receipt</span>
              <span className="block text-[9px] text-slate-450 mt-1">Transaction Ref ID: {successIssueId || 'N/A'}</span>
            </div>

            <div className="space-y-2 text-xs font-semibold text-slate-550">
              <div className="flex justify-between">
                <span>Book Title:</span>
                <span className="text-slate-800 text-right truncate max-w-[200px]">{selectedBook?.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Student Recipient:</span>
                <span className="text-slate-850">{selectedStudent?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date Issued:</span>
                <span className="text-slate-700">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Deadline Due Date:</span>
                <span className="text-rose-600 font-extrabold">{dueDateCalculated.toLocaleDateString()}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400 leading-normal">
              Please return this volume before the due date to avoid late check-in fine accrual.
            </div>
          </div>

          {/* Success actions */}
          <div className="flex items-center gap-3 justify-center max-w-xs mx-auto pt-4">
            <button
              onClick={resetWizard}
              className="flex-1 py-2.5 border border-slate-250 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650"
            >
              Issue Another
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <Printer size={14} />
              Print Slip
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

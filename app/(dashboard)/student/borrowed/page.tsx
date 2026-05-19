'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { IssueService } from '@/services/issue.service';
import { IssuedBook } from '@/types';
import StatCard from '@/components/dashboard/StatCard';
import { BookMarked, CalendarDays, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getDaysRemaining, isOverdue } from '@/lib/date-helpers';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function StudentBorrowedPage() {
  const { profile } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState<IssuedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const fetchBorrowedBooks = async () => {
    if (!profile) return;
    try {
      const data = await IssueService.getStudentIssues(profile.id, true);
      setBorrowedBooks(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load borrowed books');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, [profile]);

  const handleRenewBook = async (issueId: string) => {
    setRenewingId(issueId);
    try {
      await IssueService.renewIssue(issueId);
      toast.success('Book successfully renewed!');
      await fetchBorrowedBooks(); // Refresh list
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Renewal failed');
    } finally {
      setRenewingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Checking your borrowed items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          My Borrowed Books
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Review borrowing deadlines, active issue details, and extend book borrowing windows.
        </p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-100 space-y-4">
        {borrowedBooks.length === 0 ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-6">
            <BookMarked size={40} className="text-slate-350" />
            <h4 className="font-semibold text-slate-800 text-sm mt-3">No Active Borrows</h4>
            <p className="text-slate-400 text-xs mt-1 max-w-xs">
              You do not have any active books checked out at the moment.
            </p>
            <Link
              href="/student/search"
              className="mt-4 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Search Book Catalog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-105 space-y-4">
            {borrowedBooks.map((issue) => {
              const daysRemaining = getDaysRemaining(issue.due_date);
              const late = isOverdue(issue.due_date);
              const canRenew = issue.renewal_count < issue.max_renewals && !late;

              return (
                <div
                  key={issue.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 first:pt-0 gap-4"
                >
                  {/* Left: Book Cover + Details */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-100 border border-slate-200/50">
                      <img
                        src={issue.book?.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
                        alt={issue.book?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-[15px]">
                        {issue.book?.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span>Borrowed: {new Date(issue.issue_date).toLocaleDateString()}</span>
                        <span className="text-slate-300">•</span>
                        <span>Due: {new Date(issue.due_date).toLocaleDateString()}</span>
                        <span className="text-slate-300">•</span>
                        <span>Renewals: {issue.renewal_count}/{issue.max_renewals}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges & CTAs */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full font-bold text-xs shadow-sm",
                        late
                          ? "bg-rose-100 text-rose-700"
                          : daysRemaining <= 3
                          ? "bg-amber-100 text-amber-700 animate-pulse"
                          : "bg-indigo-50 text-indigo-700"
                      )}
                    >
                      {late ? `Overdue by ${Math.abs(daysRemaining)} days` : `${daysRemaining} days remaining`}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Inspect details */}
                      <Link
                        href={`/student/books/${issue.book_id}`}
                        className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                      >
                        <Eye size={16} />
                      </Link>

                      {/* Renew button */}
                      <button
                        disabled={!canRenew || renewingId === issue.id}
                        onClick={() => handleRenewBook(issue.id)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm",
                          canRenew
                            ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            : "bg-slate-50 border-slate-150 text-slate-400 cursor-not-allowed"
                        )}
                      >
                        {renewingId === issue.id ? (
                          <LoadingSpinner size={14} />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        Extend
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

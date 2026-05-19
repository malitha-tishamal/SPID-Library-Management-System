'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { UsersService } from '../../../services/users.service';
import { IssueService } from '../../../services/issue.service';
import { BooksService } from '../../../services/books.service';
import { ReturnService } from '../../../services/return.service';
import { IssuedBook, Book, DashboardStats } from '../../../types';
import StatCard from '../../../components/dashboard/StatCard';
import {
  BookMarked,
  CalendarCheck,
  AlertTriangle,
  History,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { getDaysRemaining } from '../../../lib/date-helpers';
import { cn } from '../../../lib/utils';
import { toast } from 'react-hot-toast';

export default function LibrarianDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [overdueBooks, setOverdueBooks] = useState<IssuedBook[]>([]);
  const [lowStockBooks, setLowStockBooks] = useState<Book[]>([]);
  const [recentIssues, setRecentIssues] = useState<IssuedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLibrarianData = async () => {
    try {
      const statsData = await UsersService.getDashboardStats();
      setStats(statsData);

      // Fetch active borrowings (potential overdue)
      const allActive = await IssueService.getActiveIssues();
      const overdue = allActive.filter(issue => issue.status === 'overdue' || getDaysRemaining(issue.due_date) < 0);
      setOverdueBooks(overdue.slice(0, 5));

      // Fetch low stock physical books
      const booksData = await BooksService.getBooks({ limit: 5 });
      const lowStock = booksData.books.filter(b => !b.is_digital && b.available_copies < 3);
      setLowStockBooks(lowStock);

      // Fetch recent checkout history
      const historyData = await IssueService.getIssueHistory();
      setRecentIssues(historyData.slice(0, 5));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load librarian dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrarianData();
  }, []);

  const handleQuickCheckin = async (issueId: string) => {
    if (!profile) return;
    try {
      await ReturnService.returnBook(issueId, profile.id);
      toast.success('Book returned and checked-in successfully');
      fetchLibrarianData(); // refresh
    } catch (err) {
      console.error(err);
      toast.error('Failed to process check-in');
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Opening librarian workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Page Header */}
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          Librarian Console
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Perform user book issue/returns, monitor outstanding deadlines, and keep track of physical inventory.
        </p>
      </div>

      {/* Grid: Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Issues"
          value={stats.currently_issued}
          icon={BookMarked}
          description="Total physical books currently on-loan"
          iconColorClass="text-accent"
          iconBgClass="bg-indigo-50 border border-indigo-100"
        />

        <StatCard
          title="Overdue Loan Items"
          value={stats.overdue_books}
          icon={AlertTriangle}
          description="Books pending late check-in returns"
          iconColorClass={stats.overdue_books > 0 ? "text-rose-500" : "text-emerald-500"}
          iconBgClass={stats.overdue_books > 0 ? "bg-rose-50 border border-rose-100" : "bg-emerald-50 border border-emerald-100"}
        />

        <StatCard
          title="Low Stock Alert"
          value={stats.low_stock_count}
          icon={TrendingDown}
          description="Cataloged books with < 3 physical copies"
          iconColorClass={stats.low_stock_count > 0 ? "text-amber-500" : "text-emerald-500"}
          iconBgClass={stats.low_stock_count > 0 ? "bg-amber-50 border border-amber-100" : "bg-emerald-50 border border-emerald-100"}
        />

        <StatCard
          title="Total Students"
          value={stats.total_students}
          icon={UserCheck}
          description="Registered library student profiles"
          iconColorClass="text-slate-600"
          iconBgClass="bg-slate-100 border border-slate-200"
        />
      </div>

      {/* Grid: Overdue list & recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue loan list */}
        <div className="glass-card p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sora font-bold text-md text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-500" />
                Urgent Overdue Loans
              </h3>
              <Link
                href="/librarian/overdue"
                className="text-xs font-bold text-accent hover:underline flex items-center gap-0.5"
              >
                Inspect All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-4">
              {overdueBooks.length === 0 ? (
                <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <ShieldCheck size={32} className="text-emerald-500" />
                  <span className="text-slate-400 text-xs font-semibold mt-2">Zero overdue items!</span>
                  <span className="text-slate-350 text-[10px] mt-0.5">All student borrowing accounts are in perfect order.</span>
                </div>
              ) : (
                overdueBooks.map((issue) => {
                  const daysRemaining = getDaysRemaining(issue.due_date);
                  return (
                    <div
                      key={issue.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors gap-3"
                    >
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">{issue.book?.title}</span>
                        <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                          Student: {issue.user?.full_name} ({issue.user?.student_id || 'N/A'})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                          Late {Math.abs(daysRemaining)}d
                        </span>
                        <button
                          onClick={() => handleQuickCheckin(issue.id)}
                          className="px-2.5 py-1 bg-accent hover:bg-accent-dark text-white rounded-lg font-bold text-[10px] transition-all"
                        >
                          Check In
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Transaction logs */}
        <div className="glass-card p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sora font-bold text-md text-slate-800 flex items-center gap-2">
                <History size={18} className="text-accent" />
                Recent Transactions Feed
              </h3>
              <Link
                href="/librarian/transactions"
                className="text-xs font-bold text-accent hover:underline flex items-center gap-0.5"
              >
                Full History <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-4">
              {recentIssues.length === 0 ? (
                <div className="min-h-[200px] flex items-center justify-center text-slate-400 text-xs">
                  No borrowing records cataloged yet.
                </div>
              ) : (
                recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/20"
                  >
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">{issue.book?.title}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Borrowed by {issue.user?.full_name}
                      </span>
                    </div>

                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full font-bold text-[10px] capitalize border shadow-sm",
                        issue.status === 'returned'
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-indigo-50 text-indigo-700 border-indigo-100"
                      )}
                    >
                      {issue.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

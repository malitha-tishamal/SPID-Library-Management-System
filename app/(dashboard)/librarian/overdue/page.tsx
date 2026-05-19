'use client';

import React, { useEffect, useState } from 'react';
import { IssueService } from '@/services/issue.service';
import { ReturnService } from '@/services/return.service';
import { IssuedBook } from '@/types';
import { AlertTriangle, Search, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getDaysRemaining } from '@/lib/date-helpers';
import { toast } from 'react-hot-toast';

export default function LibrarianOverduePage() {
  const [overdueLoans, setOverdueLoans] = useState<IssuedBook[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverdueLoans = async () => {
    setIsLoading(true);
    try {
      const data = await IssueService.getActiveIssues({ search: search || undefined });
      const filtered = data.filter(issue => issue.status === 'overdue' || getDaysRemaining(issue.due_date) < 0);
      setOverdueLoans(filtered);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load overdue records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(fetchOverdueLoans, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleCheckin = async (id: string) => {
    try {
      await ReturnService.returnBook(id, 'quick-lib');
      toast.success('Book returned successfully!');
      fetchOverdueLoans();
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete check-in');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          Overdue Summary
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Monitor physical loans that have exceeded their borrowing windows and track overdue days.
        </p>
      </div>

      <div className="glass-card p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search overdue list by student email, registration ID or book title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-800 text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 min-h-[250px]">
            <LoadingSpinner className="h-8 w-8 text-accent animate-spin" />
          </div>
        ) : overdueLoans.length === 0 ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl">
            <ShieldCheck size={40} className="text-emerald-500" />
            <h4 className="font-semibold text-slate-850 text-sm mt-3">No Overdue Books</h4>
            <p className="text-slate-400 text-xs mt-1">
              Fantastic! All physical books are currently checked-in on time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-4 px-6 rounded-l-2xl">Book details</th>
                  <th className="py-4 px-6">Student Borrower</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Late Days</th>
                  <th className="py-4 px-6 rounded-r-2xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105">
                {overdueLoans.map((row) => {
                  const days = Math.abs(getDaysRemaining(row.due_date));
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800">{row.book?.title}</td>
                      <td className="py-4 px-6 text-slate-700">
                        <span className="block font-bold">{row.user?.full_name}</span>
                        <span className="text-[10px] text-slate-450 mt-0.5 block">{row.user?.student_id || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-6">{new Date(row.due_date).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 font-extrabold text-[10px]">
                          Late {days}d
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleCheckin(row.id)}
                          className="px-3 py-1.5 bg-accent hover:bg-accent-dark text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                        >
                          Check In Return
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

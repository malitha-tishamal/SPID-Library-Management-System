'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { IssueService } from '@/services/issue.service';
import { IssuedBook } from '@/types';
import { History, BookOpen } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function StudentHistoryPage() {
  const { profile } = useAuth();
  const [history, setHistory] = useState<IssuedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchHistory = async () => {
      try {
        const data = await IssueService.getIssueHistory(profile.id);
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [profile]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Checking checkout logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          Borrowing History
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Review all checked-out books, historical return dates, and past readings.
        </p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-100">
        {history.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-6">
            <History size={36} className="text-slate-350" />
            <span className="text-slate-400 text-sm font-semibold mt-2">No historical logs found</span>
            <span className="text-slate-300 text-xs mt-1">You haven't completed any book borrow sessions yet.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Book details</th>
                  <th className="py-3 px-4">Borrow Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">
                      <Link href={`/student/books/${row.book_id}`} className="hover:text-accent flex items-center gap-2">
                        <BookOpen size={16} className="text-slate-400" />
                        {row.book?.title || 'Unknown Title'}
                      </Link>
                    </td>
                    <td className="py-4 px-4">{new Date(row.issue_date).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      {row.return_date ? new Date(row.return_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-4 capitalize">
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border ${
                        row.status === 'returned'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

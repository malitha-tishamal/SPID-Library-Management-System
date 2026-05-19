'use client';

import React, { useEffect, useState } from 'react';
import { IssueService } from '@/services/issue.service';
import { IssuedBook } from '@/types';
import { History, Search } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export default function AdminTransactionsPage() {
  const [history, setHistory] = useState<IssuedBook[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await IssueService.getIssueHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredHistory = history.filter(row =>
    row.book?.title.toLowerCase().includes(search.toLowerCase()) ||
    row.user?.full_name.toLowerCase().includes(search.toLowerCase()) ||
    row.user?.student_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          System Circulation Logs
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Complete audit feed of book checkouts, renewals, and student check-ins.
        </p>
      </div>

      <div className="glass-card p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Filter logs by student registration ID, email or book title..."
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
        ) : filteredHistory.length === 0 ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl">
            <History size={36} className="text-slate-350" />
            <span className="text-slate-450 text-sm font-semibold mt-2">No Records Cataloged</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-4 px-6 rounded-l-2xl">Book details</th>
                  <th className="py-4 px-6">Student Borrower</th>
                  <th className="py-4 px-6">Borrow Date</th>
                  <th className="py-4 px-6">Return Date</th>
                  <th className="py-4 px-6 rounded-r-2xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105">
                {filteredHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">{row.book?.title}</td>
                    <td className="py-4 px-6 text-slate-700">
                      <span className="block font-bold">{row.user?.full_name}</span>
                      <span className="text-[10px] text-slate-450 mt-0.5 block">{row.user?.student_id || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-6">{new Date(row.issue_date).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      {row.return_date ? new Date(row.return_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-6 capitalize">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border shadow-sm",
                          row.status === 'returned'
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : row.status === 'overdue'
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-indigo-50 text-indigo-700 border-indigo-100"
                        )}
                      >
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

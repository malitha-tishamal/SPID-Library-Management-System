'use client';

import React, { useEffect, useState } from 'react';
import { ReturnService } from '@/services/return.service';
import { useAuth } from '@/hooks/useAuth';
import { Fine } from '@/types';
import { AlertTriangle, DollarSign, X, Check, Eye } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function AdminFinesPage() {
  const { profile: admin } = useAuth();
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Waive Dialog control
  const [waivingFine, setWaivingFine] = useState<Fine | null>(null);
  const [waiveReason, setWaiveReason] = useState('');
  const [isWaivingSubmit, setIsWaivingSubmit] = useState(false);

  const fetchFinesLedger = async () => {
    setIsLoading(true);
    try {
      const data = await ReturnService.getFines();
      setFines(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load late fine records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinesLedger();
  }, []);

  const handlePayFine = async (fineId: string, name: string) => {
    if (!window.confirm(`Mark LKR fine invoice for ${name} as PAID/SETTLED?`)) return;
    try {
      await ReturnService.payFine(fineId);
      toast.success('Late fine successfully settled!');
      fetchFinesLedger();
    } catch (err) {
      console.error(err);
      toast.error('Failed to settle fine');
    }
  };

  const handleWaiveFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waivingFine || !admin || waiveReason.trim().length < 5) {
      toast.error('Please specify a valid excuse explanation of at least 5 characters');
      return;
    }
    setIsWaivingSubmit(true);
    try {
      await ReturnService.waiveFine(waivingFine.id, admin.id, waiveReason);
      toast.success('Fine successfully waived!');
      setWaivingFine(null);
      setWaiveReason('');
      fetchFinesLedger();
    } catch (err) {
      console.error(err);
      toast.error('Failed to waive fine');
    } finally {
      setIsWaivingSubmit(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Checking accounts ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          Fines & Surcharges Ledger
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Review generated student late-fees, mark cash payments as settled, and waive academic surcharges.
        </p>
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {fines.length === 0 ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl">
            <DollarSign size={40} className="text-emerald-500" />
            <h4 className="font-semibold text-slate-850 text-sm mt-3">No Fines Accrued</h4>
            <p className="text-slate-400 text-xs mt-1">
              Perfect compliance! No late fees have been generated in the system.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-4 px-6 rounded-l-2xl">Student details</th>
                  <th className="py-4 px-6">Book Title</th>
                  <th className="py-4 px-6">Accrued Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 rounded-r-2xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105">
                {fines.map((row) => {
                  const pending = row.status === 'pending';
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Student info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">
                            {row.user?.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">{row.user?.full_name}</span>
                            <span className="text-[10px] text-slate-450 mt-0.5 block">ID: {row.user?.student_id || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Book Title */}
                      <td className="py-4 px-6 font-bold text-slate-805 truncate max-w-[180px]">
                        {row.issued_book?.book?.title || 'Unknown Title'}
                      </td>

                      {/* Accrued Fine Amount */}
                      <td className="py-4 px-6 font-bold text-rose-600">
                        {formatCurrency(row.total_amount as unknown as number)}
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-6 capitalize">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border shadow-sm",
                          row.status === 'paid'
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : row.status === 'waived'
                            ? "bg-slate-55 text-slate-500 border-slate-200 bg-slate-50"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        )}>
                          {row.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-right">
                        {pending ? (
                          <div className="flex items-center justify-end gap-2">
                            {/* Pay fine */}
                            <button
                              onClick={() => handlePayFine(row.id, row.user?.full_name || 'Student')}
                              className="p-2 bg-emerald-55 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl transition-all shadow-sm"
                              title="Settle/Pay fine"
                            >
                              <Check size={14} />
                            </button>

                            {/* Waive fine */}
                            <button
                              onClick={() => setWaivingFine(row)}
                              className="p-2 bg-slate-55 hover:bg-slate-100 border border-slate-200 text-slate-550 rounded-xl transition-all shadow-sm"
                              title="Waive late fine"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Audited</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Waive Fine Modal overlay */}
      {waivingFine && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-150 space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-sora font-extrabold text-sm text-slate-800">Waive late surcharges</h4>
              <button onClick={() => setWaivingFine(null)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleWaiveFine} className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                  <AlertTriangle size={14} />
                  <span>WAIVING SURCHARGE METRIC</span>
                </div>
                <p className="text-amber-600 leading-relaxed font-semibold">
                  You are waiving the late fine of{' '}
                  <strong>{formatCurrency(waivingFine.total_amount as unknown as number)}</strong> accrued by{' '}
                  <strong>{waivingFine.user?.full_name}</strong>. Provide an explanation.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Waive Excuse / Reason *</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Student submitted a verified medical certificate for the borrowing delay..."
                  value={waiveReason}
                  onChange={(e) => setWaiveReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-850 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWaivingFine(null)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-650"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWaivingSubmit || waiveReason.trim().length < 5}
                  className="flex-1 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center disabled:opacity-50"
                >
                  {isWaivingSubmit ? <LoadingSpinner size={12} className="text-white" /> : 'Confirm Waive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

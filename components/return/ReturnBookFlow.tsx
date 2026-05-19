'use client';

import React, { useState, useEffect } from 'react';
import { ReturnService } from '../../services/return.service';
import { IssueService } from '../../services/issue.service';
import { IssuedBook } from '../../types';
import { Search, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck, Printer, CalendarClock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';
import { cn, formatCurrency } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

export default function ReturnBookFlow() {
  const { profile: librarian } = useAuth();
  
  // Lists
  const [activeIssues, setActiveIssues] = useState<IssuedBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected issue details
  const [selectedIssue, setSelectedIssue] = useState<IssuedBook | null>(null);
  
  // Fine estimations
  const [overdueDays, setOverdueDays] = useState(0);
  const [estimatedFine, setEstimatedFine] = useState(0);
  const [isCalculatingFine, setIsCalculatingFine] = useState(false);
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false);

  // Success summary details
  const [successSummary, setSuccessSummary] = useState<any | null>(null);

  const fetchActiveIssues = async () => {
    setIsLoading(true);
    try {
      const data = await IssueService.getActiveIssues({ search: searchQuery || undefined });
      setActiveIssues(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load active loan records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchActiveIssues();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectIssue = async (issue: IssuedBook) => {
    setSelectedIssue(issue);
    setSuccessSummary(null);
    setIsCalculatingFine(true);
    try {
      const fineDetails = await ReturnService.calculatePotentialFine(issue.due_date);
      setOverdueDays(fineDetails.daysOverdue);
      setEstimatedFine(fineDetails.fineAmount);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculatingFine(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!selectedIssue || !librarian) return;
    setIsSubmittingCheckin(true);
    try {
      const returnResult = await ReturnService.returnBook(selectedIssue.id, librarian.id);
      setSuccessSummary(returnResult);
      toast.success('Book returned and checked-in successfully!');
      
      // Reset selected issue and reload lists
      setSelectedIssue(null);
      fetchActiveIssues();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to complete book return check-in');
    } finally {
      setIsSubmittingCheckin(false);
    }
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm max-w-4xl mx-auto space-y-8">
      
      {/* Return Flow Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <h3 className="font-sora font-extrabold text-lg text-slate-800 flex items-center gap-2">
          <RotateCcw size={20} className="text-accent" />
          Book Check-In Desk
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Search & Select Active Borrow Loan */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-sora font-bold text-sm text-slate-800">
              1. Search Active Borrow Loans
            </h4>
            <p className="text-slate-400 text-xs">
              Search by student email, registration ID, or book title to inspect their borrowing files.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
            <input
              type="text"
              placeholder="Search by student ID, book title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-slate-800 text-xs focus:outline-none"
            />
          </div>

          {/* Active Issues selection grid/list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-white pr-2">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center">
                <LoadingSpinner size={16} />
              </div>
            ) : activeIssues.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active borrowings matching query.
              </div>
            ) : (
              activeIssues.map((issue) => {
                const isSelected = selectedIssue?.id === issue.id;
                return (
                  <div
                    key={issue.id}
                    onClick={() => handleSelectIssue(issue)}
                    className={cn(
                      "p-3.5 flex items-start justify-between cursor-pointer hover:bg-slate-50 transition-colors gap-3",
                      isSelected && "bg-indigo-50/20"
                    )}
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800 block line-clamp-1">{issue.book?.title}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
                        Student: {issue.user?.full_name} ({issue.user?.student_id || 'N/A'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSelected && <CheckCircle2 size={16} className="text-accent fill-accent text-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Calculations & Confirm Check-In */}
        <div className="glass-card p-6 rounded-2xl border border-slate-150 bg-slate-50/40 flex flex-col justify-between min-h-[300px]">
          {selectedIssue ? (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-sora font-extrabold text-sm text-slate-900">2. Inspect Check-In Details</h4>
                <span className="text-[10px] text-slate-400 block mt-0.5">Evaluating deadline compliance</span>
              </div>

              {/* Book & Student Info */}
              <div className="space-y-3.5 text-xs text-slate-650 font-semibold">
                <div className="flex justify-between">
                  <span>Selected Book:</span>
                  <span className="text-slate-900 text-right truncate max-w-[180px]">{selectedIssue.book?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Student Borrower:</span>
                  <span className="text-slate-900">{selectedIssue.user?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date Target:</span>
                  <span className="text-slate-700">{new Date(selectedIssue.due_date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Overdue and fine calculations */}
              {isCalculatingFine ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size={18} />
                </div>
              ) : overdueDays > 0 ? (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold">
                    <AlertTriangle size={16} />
                    <span>LATE CHECK-IN DETECTED</span>
                  </div>
                  <p className="text-rose-600 leading-normal">
                    This book is overdue by <strong>{overdueDays} days</strong>. An automatic fine invoice of{' '}
                    <strong>{formatCurrency(estimatedFine)}</strong> will be created in the student's name upon checkout.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs flex items-center gap-2 text-emerald-700 font-semibold">
                  <ShieldCheck size={18} className="text-emerald-500 fill-emerald-50" />
                  <span>Returns Compliant! No outstanding fines will be generated.</span>
                </div>
              )}

              {/* Checkin button */}
              <button
                onClick={handleConfirmReturn}
                disabled={isSubmittingCheckin}
                className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-3 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingCheckin ? (
                  <LoadingSpinner size={14} className="text-white" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Confirm Return & Check-In
              </button>
            </div>
          ) : successSummary ? (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center">
                <div className="h-11 w-11 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner border border-emerald-100 mb-2">
                  <CheckCircle2 size={24} className="fill-emerald-500 text-white" />
                </div>
                <h5 className="font-sora font-extrabold text-sm text-slate-800">Check-In Completed!</h5>
                <span className="text-[10px] text-slate-400 mt-0.5">Inventory and student tokens successfully credited.</span>
              </div>

              {/* Receipt Summary */}
              <div className="border border-slate-200 bg-white p-4 rounded-2xl text-left text-xs font-semibold text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span>Overdue Days:</span>
                  <span className={successSummary.days_overdue > 0 ? "text-rose-600 font-bold" : ""}>
                    {successSummary.days_overdue} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fine Accrued:</span>
                  <span className={successSummary.fine_amount > 0 ? "text-rose-600 font-extrabold" : ""}>
                    {formatCurrency(successSummary.fine_amount)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <CalendarClock size={36} className="text-slate-300 mb-2" />
              <span className="text-xs font-semibold">2. Select loan item to check-in</span>
              <span className="text-[10px] mt-0.5 max-w-[200px] leading-relaxed">
                Choose a student's borrowed volume from the left panel to inspect its overdue calculations.
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

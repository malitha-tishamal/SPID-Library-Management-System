'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { IssueService } from '@/services/issue.service';
import { ReturnService } from '@/services/return.service';
import { IssuedBook } from '@/types';
import TokenMeter from '@/components/dashboard/TokenMeter';
import RecommendationSection from '@/components/recommendations/RecommendationSection';
import StatCard from '@/components/dashboard/StatCard';
import { BookMarked, CalendarDays, ShieldAlert, Sparkles, FolderOpen, ArrowRight, Eye, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getDaysRemaining } from '@/lib/date-helpers';
import { cn, formatCurrency } from '@/lib/utils';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [activeIssues, setActiveIssues] = useState<IssuedBook[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const fetchDashboardData = async () => {
      try {
        const issuesData = await IssueService.getStudentIssues(profile.id, true);
        const finesData = await ReturnService.getFines(profile.id);
        setActiveIssues(issuesData);
        setFines(finesData.filter(f => f.status === 'pending'));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile]);

  if (!profile) return null;

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Compiling your reading summary...</span>
      </div>
    );
  }

  const overdueCount = activeIssues.filter(i => i.status === 'overdue').length;
  const totalFineAmt = fines.reduce((sum, fine) => sum + parseFloat(fine.total_amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl gap-4">
        <div>
          <h2 className="font-sora font-extrabold text-2xl md:text-3xl text-white tracking-tight">
            Welcome back, {profile.full_name}!
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Access your university resources, digital documents, and course library books.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-left">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide">ID reference</span>
          <span className="block font-bold text-white text-sm">{profile.student_id || 'N/A'}</span>
        </div>
      </div>

      {/* Grid: Stat Cards & Token allowance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Currently Borrowed"
          value={activeIssues.length}
          icon={BookMarked}
          description={`${activeIssues.length} active books checked out`}
          iconColorClass="text-accent"
          iconBgClass="bg-indigo-50 border border-indigo-100"
        />
        
        <StatCard
          title="Overdue Books"
          value={overdueCount}
          icon={ShieldAlert}
          description={overdueCount > 0 ? `${overdueCount} overdue books need check-in` : 'No outstanding books'}
          iconColorClass={overdueCount > 0 ? "text-rose-500" : "text-emerald-500"}
          iconBgClass={overdueCount > 0 ? "bg-rose-50 border border-rose-100" : "bg-emerald-50 border border-emerald-100"}
        />

        <StatCard
          title="Outstanding Fines"
          value={formatCurrency(totalFineAmt)}
          icon={CalendarClock}
          description={totalFineAmt > 0 ? 'Fines accrued due to late check-in' : 'All accounts fully settled'}
          iconColorClass={totalFineAmt > 0 ? "text-amber-500" : "text-emerald-500"}
          iconBgClass={totalFineAmt > 0 ? "bg-amber-50 border border-amber-100" : "bg-emerald-50 border border-emerald-100"}
        />
      </div>

      {/* Grid: Active Borrows list + Token Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Balance Gauge (2/3 width or 1/3 depending on choice) */}
        <div className="lg:col-span-1">
          <TokenMeter balance={profile.token_balance} max={profile.max_tokens} />
        </div>

        {/* Active borrowed books list (2/3 width) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sora font-bold text-lg text-slate-800 flex items-center gap-2">
              <BookMarked size={20} className="text-accent" />
              Active Borrowings
            </h3>
            <Link
              href="/student/borrowed"
              className="text-xs font-bold text-accent hover:text-accent-dark flex items-center gap-1 hover:underline"
            >
              Manage Books
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {activeIssues.length === 0 ? (
              <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <span className="text-slate-400 text-sm">No books currently borrowed.</span>
                <Link
                  href="/student/search"
                  className="mt-2 text-xs font-bold text-accent hover:underline flex items-center gap-1"
                >
                  Explore book catalog <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              activeIssues.map((issue) => {
                const daysRemaining = getDaysRemaining(issue.due_date);
                const isLate = daysRemaining < 0;

                return (
                  <div
                    key={issue.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 p-4 rounded-xl hover:bg-slate-50/50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 shadow-sm border border-slate-200/50">
                        <img
                          src={issue.book?.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
                          alt={issue.book?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-850 text-sm line-clamp-1">
                          {issue.book?.title}
                        </h4>
                        <span className="text-xs text-slate-500">
                          Due Date: {new Date(issue.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full font-bold text-xs shadow-sm",
                          isLate
                            ? "bg-rose-100 text-rose-700"
                            : daysRemaining <= 3
                            ? "bg-amber-100 text-amber-700"
                            : "bg-indigo-50 text-indigo-700"
                        )}
                      >
                        {isLate ? `Overdue by ${Math.abs(daysRemaining)} days` : `${daysRemaining} days left`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Personalized recommendations grid */}
      <RecommendationSection />
    </div>
  );
}

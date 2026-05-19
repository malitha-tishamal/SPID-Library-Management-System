'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UsersService } from '@/services/users.service';
import { IssueService } from '@/services/issue.service';
import { Book, Profile, DashboardStats } from '@/types';
import StatCard from '@/components/dashboard/StatCard';
import {
  Library,
  Users,
  BookMarked,
  AlertTriangle,
  History,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { supabase } from '@/services/supabase';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Mock chart datasets
const loanActivityData = [
  { name: 'Mon', count: 12 },
  { name: 'Tue', count: 19 },
  { name: 'Wed', count: 15 },
  { name: 'Thu', count: 28 },
  { name: 'Fri', count: 22 },
  { name: 'Sat', count: 8 },
  { name: 'Sun', count: 10 }
];

const categoryDistributionData = [
  { name: 'Tech', value: 45, color: '#6366F1' },
  { name: 'Science', value: 25, color: '#10B981' },
  { name: 'Math', value: 15, color: '#F59E0B' },
  { name: 'Literature', value: 15, color: '#F43F5E' }
];

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsData = await UsersService.getDashboardStats();
        setStats(statsData);

        // Fetch recent logs
        const { data: logs } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentLogs(logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Opening Admin Hub...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Welcome & System Summary banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl gap-4">
        <div>
          <h2 className="font-sora font-extrabold text-2xl md:text-3xl text-white tracking-tight">
            Administrator Portal
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Global system health indicator. Monitor academic resources, library staff, and audit trails.
          </p>
        </div>
      </div>

      {/* Grid: Admin KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Catalog Library Books"
          value={stats.total_books}
          icon={Library}
          description="Total physical and digital volumes cataloged"
          iconColorClass="text-accent"
          iconBgClass="bg-indigo-50 border border-indigo-100"
        />

        <StatCard
          title="Active Students"
          value={stats.total_students}
          icon={Users}
          description="Enrolled student library profiles"
          iconColorClass="text-emerald-500"
          iconBgClass="bg-emerald-50 border border-emerald-100"
        />

        <StatCard
          title="Active Book Issue Loans"
          value={stats.currently_issued}
          icon={BookMarked}
          description="Total volumes checked out"
          iconColorClass="text-indigo-600"
          iconBgClass="bg-indigo-50 border border-indigo-100"
        />

        <StatCard
          title="Outstanding Fines Alert"
          value={stats.overdue_books}
          icon={AlertTriangle}
          description="Late check-in book issues"
          iconColorClass={stats.overdue_books > 0 ? "text-rose-500" : "text-emerald-500"}
          iconBgClass={stats.overdue_books > 0 ? "bg-rose-50 border border-rose-100" : "bg-emerald-50 border border-emerald-100"}
        />
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan patterns Area Chart (2/3 width) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-100 flex flex-col h-[380px]">
          <h3 className="font-sora font-bold text-sm text-slate-800 mb-4 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-accent" />
            Weekly Borrowing Trends
          </h3>

          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loanActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution Pie Chart (1/3 width) */}
        <div className="glass-card p-6 rounded-2xl border border-slate-100 flex flex-col h-[380px] justify-between">
          <h3 className="font-sora font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <Library size={16} className="text-emerald-500" />
            Category Allocation
          </h3>

          <div className="flex-1 flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Popularity</span>
              <span className="font-extrabold text-2xl text-slate-800">Tech</span>
            </div>
          </div>

          {/* Custom Legends list */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-550 border-t border-slate-100 pt-3">
            {categoryDistributionData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span>{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit trails log section */}
      <div className="glass-card p-6 rounded-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-sora font-bold text-sm text-slate-800 flex items-center gap-2">
            <History size={16} className="text-slate-500" />
            Global System Activity & Audit Trail
          </h3>
        </div>

        <div className="divide-y divide-slate-105">
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent administrative actions logged.
            </div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                    <FileText size={14} />
                  </div>
                  <div>
                    <span className="text-slate-800 capitalize font-extrabold">{log.action.replace('_', ' ')}</span>
                    <span className="text-slate-450 font-medium block sm:inline sm:ml-2">
                      Entity: {log.entity_type} ({log.entity_id.substring(0, 8)})
                    </span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

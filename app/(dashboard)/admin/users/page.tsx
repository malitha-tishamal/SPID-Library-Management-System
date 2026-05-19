'use client';

import React, { useEffect, useState } from 'react';
import { UsersService } from '@/services/users.service';
import { Profile } from '@/types';
import { Users, Search, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const data = await UsersService.getProfiles('student');
      setProfiles(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user profiles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleStatus = async (user: Profile) => {
    const nextActiveState = !user.is_active;
    const confirmMsg = nextActiveState
      ? `Are you sure you want to reactivate ${user.full_name}'s student card?`
      : `Are you sure you want to suspend ${user.full_name}'s borrowing privileges? They will no longer be able to borrow books.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await UsersService.updateProfile(user.id, { is_active: nextActiveState });
      toast.success(`${user.full_name}'s status updated!`);
      fetchProfiles();
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle active status');
    }
  };

  const filteredProfiles = profiles.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.student_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
            Manage Student Profiles
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Authorize new registrations, audit study balances, check remaining tokens, and toggle account suspensions.
          </p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="glass-card p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search student profiles by full name, registration ID or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-800 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Profiles list table */}
      <div className="glass-card rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 min-h-[300px]">
            <LoadingSpinner className="h-8 w-8 text-accent animate-spin" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl">
            <Users size={36} className="text-slate-350" />
            <span className="text-slate-450 text-sm font-semibold mt-2">No Profiles Found</span>
            <span className="text-slate-300 text-xs mt-1">No student profiles match your search criteria.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-4 px-6 rounded-l-2xl">Student details</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Token Balance</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 rounded-r-2xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105">
                {filteredProfiles.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name and ID details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 text-accent font-bold text-xs flex items-center justify-center">
                          {row.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">{row.full_name}</span>
                          <span className="text-[10px] text-slate-450 mt-0.5 block">ID: {row.student_id || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 text-slate-700">{row.email}</td>

                    {/* Department */}
                    <td className="py-4 px-6 text-slate-700">{row.department || 'General Science'}</td>

                    {/* Token */}
                    <td className="py-4 px-6 text-slate-700">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px]">
                        {row.token_balance} / {row.max_tokens}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-sm",
                        row.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                      )}>
                        {row.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    {/* Action button status toggle */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(row)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ml-auto",
                          row.is_active
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100"
                        )}
                      >
                        {row.is_active ? (
                          <>
                            <Ban size={14} />
                            Suspend account
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} />
                            Activate card
                          </>
                        )}
                      </button>
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

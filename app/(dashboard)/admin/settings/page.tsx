'use client';

import React, { useEffect, useState } from 'react';
import { UsersService } from '@/services/users.service';
import { useAuth } from '@/hooks/useAuth';
import { Save, Settings, Info, DollarSign, Calendar, ShieldCheck, Coins } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  // Local settings forms
  const [tokenLimit, setTokenLimit] = useState('3');
  const [fineRate, setFineRate] = useState('5.00');
  const [duration, setDuration] = useState('14');
  const [maxRenewals, setMaxRenewals] = useState('2');

  const fetchSettings = async () => {
    try {
      const data = await UsersService.getSettings();
      setSettings(data);
      
      // Map database settings to states
      data.forEach((setting: any) => {
        if (setting.key === 'max_borrow_tokens') setTokenLimit(setting.value);
        if (setting.key === 'fine_per_day') setFineRate(setting.value);
        if (setting.key === 'default_borrow_days') setDuration(setting.value);
        if (setting.key === 'max_renewals') setMaxRenewals(setting.value);
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load global configuration');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSetting = async (key: string, value: string) => {
    if (!profile) return;
    setIsSaving(key);
    try {
      await UsersService.updateSetting(key, value, profile.id);
      toast.success(`Configuration [${key}] updated successfully!`);
      fetchSettings();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update configuration setting');
    } finally {
      setIsSaving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Retrieving system registries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header title */}
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          System Rules & Configuration
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Adjust fine rates, borrowing limits, token thresholds, and catalog parameters. Rules are applied system-wide instantly.
        </p>
      </div>

      {/* Warning Alert Box */}
      <div className="bg-amber-50 border border-amber-150 p-4.5 rounded-2xl flex items-start gap-3">
        <Info className="text-amber-600 h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed font-semibold">
          <strong>Important Warning:</strong> Changing borrowing rules or late-check-in fines will alter the calculations in SQL triggers.
          Ensure changes are verified before committing.
        </div>
      </div>

      {/* Rules list/cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Token Limit config card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Circulation Allowance</span>
              <h4 className="font-sora font-bold text-sm text-slate-850 flex items-center gap-1.5">
                <Coins size={16} className="text-accent" />
                Borrow Token Allowance
              </h4>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The max number of physical books a student can hold simultaneously (e.g. 3 tokens = 3 concurrent issues).
          </p>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="number"
              value={tokenLimit}
              onChange={(e) => setTokenLimit(e.target.value)}
              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-bold focus:outline-none"
            />
            <button
              onClick={() => handleSaveSetting('max_borrow_tokens', tokenLimit)}
              disabled={isSaving === 'max_borrow_tokens'}
              className="bg-accent hover:bg-accent-dark text-white p-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 disabled:opacity-50"
            >
              {isSaving === 'max_borrow_tokens' ? <LoadingSpinner size={12} className="text-white" /> : <Save size={12} />}
              Save
            </button>
          </div>
        </div>

        {/* Borrow duration config card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Checkout Periods</span>
              <h4 className="font-sora font-bold text-sm text-slate-850 flex items-center gap-1.5">
                <Calendar size={16} className="text-indigo-500" />
                Default Borrow Days
              </h4>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The standard checkout length in days. Default checkouts use this duration calculation.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-bold focus:outline-none"
            />
            <button
              onClick={() => handleSaveSetting('default_borrow_days', duration)}
              disabled={isSaving === 'default_borrow_days'}
              className="bg-accent hover:bg-accent-dark text-white p-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 disabled:opacity-50"
            >
              {isSaving === 'default_borrow_days' ? <LoadingSpinner size={12} className="text-white" /> : <Save size={12} />}
              Save
            </button>
          </div>
        </div>

        {/* Fine per day late config card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Late Fine Rate</span>
              <h4 className="font-sora font-bold text-sm text-slate-850 flex items-center gap-1.5">
                <DollarSign size={16} className="text-amber-500" />
                Late Fine Per Day (LKR)
              </h4>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The daily late fee added to fine invoices for each overdue day (e.g. 5.00 = LKR 5.00 late fee per day).
          </p>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="number"
              step="0.01"
              value={fineRate}
              onChange={(e) => setFineRate(e.target.value)}
              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-bold focus:outline-none"
            />
            <button
              onClick={() => handleSaveSetting('fine_per_day', fineRate)}
              disabled={isSaving === 'fine_per_day'}
              className="bg-accent hover:bg-accent-dark text-white p-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 disabled:opacity-50"
            >
              {isSaving === 'fine_per_day' ? <LoadingSpinner size={12} className="text-white" /> : <Save size={12} />}
              Save
            </button>
          </div>
        </div>

        {/* Max renewals limit config card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Extension thresholds</span>
              <h4 className="font-sora font-bold text-sm text-slate-850 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-500" />
                Max Renewal Actions Limit
              </h4>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The max number of times a student can extend/renew a borrow timeline without checking the book back into physical catalog.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="number"
              value={maxRenewals}
              onChange={(e) => setMaxRenewals(e.target.value)}
              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-bold focus:outline-none"
            />
            <button
              onClick={() => handleSaveSetting('max_renewals', maxRenewals)}
              disabled={isSaving === 'max_renewals'}
              className="bg-accent hover:bg-accent-dark text-white p-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 disabled:opacity-50"
            >
              {isSaving === 'max_renewals' ? <LoadingSpinner size={12} className="text-white" /> : <Save size={12} />}
              Save
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

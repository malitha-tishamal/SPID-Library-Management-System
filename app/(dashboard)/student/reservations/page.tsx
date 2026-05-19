'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { Reservation } from '@/types';
import { CalendarCheck, ShieldAlert, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function StudentReservationsPage() {
  const { profile } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReservations = async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, book:books(*)')
        .eq('user_id', profile.id)
        .order('reserved_at', { ascending: false });

      if (error) throw error;
      setReservations(data as unknown as Reservation[]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reservations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [profile]);

  const handleCancelReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Reservation cancelled');
      fetchReservations();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel reservation');
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Checking your book holds...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          My Reservations
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Review out-of-stock reserved volumes, waitlist rankings, and expiration periods.
        </p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-100">
        {reservations.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-6">
            <CalendarCheck size={36} className="text-slate-350" />
            <span className="text-slate-400 text-sm font-semibold mt-2">No reservations found</span>
            <span className="text-slate-300 text-xs mt-1">You don't have any book hold reservations currently.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Book details</th>
                  <th className="py-3 px-4">Reserved Date</th>
                  <th className="py-3 px-4">Expires At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105">
                {reservations.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">
                      <Link href={`/student/books/${row.book_id}`} className="hover:text-accent">
                        {row.book?.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4">{new Date(row.reserved_at).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      {row.expires_at ? new Date(row.expires_at).toLocaleString() : '-'}
                    </td>
                    <td className="py-4 px-4 capitalize">
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border ${
                        row.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : row.status === 'approved'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse'
                          : row.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-slate-55 text-slate-500 border-slate-200 bg-slate-50'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {row.status === 'pending' && (
                        <button
                          onClick={() => handleCancelReservation(row.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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

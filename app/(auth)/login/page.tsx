'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validators';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { BookOpen, LogIn, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading, error, setError } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setError(null);
      await login(values.email, values.password);
      toast.success('Welcome back to the SPID Library!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
        {/* Branding header */}
        <div className="flex items-center gap-4 mb-4 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-lg">
          <img src="/images/logo/gov.png" alt="Gov Logo" className="h-14 w-auto object-contain" />
          <div className="h-10 w-px bg-white/20" />
          <img src="/images/logo/logo.png" alt="SPID Logo" className="h-14 w-auto object-contain" />
        </div>
        <h2 className="font-sora font-extrabold text-[13px] text-white tracking-wider text-center uppercase leading-snug">
          දකුණු පළාත් වාරිමාර්ග දෙපාර්තමේන්තුව
        </h2>
        <p className="text-slate-300 text-center font-bold text-[10px] uppercase tracking-wider mt-1">
          Southern Provincial Irrigation Department
        </p>
        <p className="text-accent text-[11px] font-extrabold tracking-widest text-center uppercase mt-1.5 mb-6">
          Library Management System
        </p>

        {/* Dynamic warning banner */}
        {(error) && (
          <div className="w-full bg-rose-500/10 border border-rose-500/25 p-3 rounded-2xl flex items-start gap-2.5 mb-6">
            <AlertCircle className="text-rose-400 h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-rose-200 text-xs leading-relaxed">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. malitha@spid.gov.lk"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            {errors.email && (
              <span className="text-[11px] text-rose-400 block ml-1 mt-0.5">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 block">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-accent-light hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            {errors.password && (
              <span className="text-[11px] text-rose-400 block ml-1 mt-0.5">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-3.5 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm mt-8 disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingSpinner className="text-white h-5 w-5" />
            ) : (
              <>
                <LogIn size={18} />
                Access Library
              </>
            )}
          </button>
        </form>

        {/* Footer actions */}
        <p className="text-xs text-slate-400 mt-8 font-medium">
          Don't have an account yet?{' '}
          <Link href="/register" className="text-accent-light hover:underline font-bold">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}

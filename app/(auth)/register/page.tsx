'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validators';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { BookOpen, UserPlus, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: signUp, isLoading, error, setError } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'librarian' | 'student'>('student');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      role: 'student',
    }
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setError(null);
      await signUp(
        values.email,
        values.password,
        values.fullName,
        values.role,
        values.studentId,
        values.department
      );
      toast.success('Registration successful! Please check email or login.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
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

        {/* Warning notification banner */}
        {error && (
          <div className="w-full bg-rose-500/10 border border-rose-500/25 p-3 rounded-2xl flex items-start gap-2.5 mb-6">
            <AlertCircle className="text-rose-400 h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-rose-200 text-xs leading-relaxed">{error}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Full Name
            </label>
            <input
              type="text"
              {...register('fullName')}
              placeholder="e.g. Malitha Tishamal"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            {errors.fullName && (
              <span className="text-[11px] text-rose-400 block ml-1 mt-0.5">
                {errors.fullName.message}
              </span>
            )}
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Role
              </label>
              <select
                {...register('role')}
                onChange={(e) => {
                  const role = e.target.value as any;
                  setSelectedRole(role);
                  setValue('role', role);
                }}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent transition-all"
              >
                <option value="student">User</option>
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="Min 6 characters"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              {errors.password && (
                <span className="text-[11px] text-rose-400 block ml-1 mt-0.5">
                  {errors.password.message}
                </span>
              )}
            </div>
          </div>

          {/* Conditional inputs specifically for officers */}
          {selectedRole === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Employee / Officer ID
                </label>
                <input
                  type="text"
                  {...register('studentId')}
                  placeholder="e.g. SPID-ENG-2026-089"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
                {errors.studentId && (
                  <span className="text-[11px] text-rose-400 block ml-1 mt-0.5">
                    {errors.studentId.message}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Division / Branch
                </label>
                <input
                  type="text"
                  {...register('department')}
                  placeholder="e.g. Engineering & Design"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
                {errors.department && (
                  <span className="text-[11px] text-rose-400 block ml-1 mt-0.5">
                    {errors.department.message}
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-3.5 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm mt-8 disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingSpinner className="text-white h-5 w-5" />
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer actions */}
        <p className="text-xs text-slate-400 mt-8 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-light hover:underline font-bold">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}

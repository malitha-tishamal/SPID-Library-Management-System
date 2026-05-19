'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';
import { useAuthStore } from '../../store/authStore';
import { AuthService } from '../../services/auth.service';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, isLoading, setIsLoading } = useAuthStore();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user: currentUser, profile: currentProfile } = await AuthService.getCurrentUser();
        if (!currentUser) {
          router.push('/login');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        router.push('/login');
      } finally {
        setIsInitializing(false);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router, setIsLoading]);

  if (isInitializing || isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-slate-500 font-medium mt-4">Setting up your academic workspace...</span>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/*Collapsible Role-Based Sidebar*/}
      <Sidebar />

      {/*Main Dashboard Workspace Grid*/}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/*Top Glassmorphic Navbar Header*/}
        <Navbar />

        {/*Responsive Scrollable Page Body*/}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

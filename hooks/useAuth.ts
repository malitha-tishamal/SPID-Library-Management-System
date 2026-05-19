import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../types';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const { user, profile, isLoading, error, setError } = useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const { profile: userProfile } = await AuthService.login(email, password);
      if (userProfile) {
        router.push(`/${userProfile.role}`);
      }
    } catch (err: any) {
      throw err;
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'student',
    studentId?: string,
    department?: string
  ) => {
    try {
      await AuthService.register(email, password, fullName, role, studentId, department);
      router.push('/login?registered=true');
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      router.push('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await AuthService.forgotPassword(email);
    } catch (err: any) {
      throw err;
    }
  };

  return {
    user,
    profile,
    isLoading,
    error,
    setError,
    login,
    register,
    logout,
    forgotPassword,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isLibrarian: profile?.role === 'librarian',
    isStudent: profile?.role === 'student',
  };
};

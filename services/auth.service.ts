import { supabase } from './supabase';
import { useAuthStore } from '../store/authStore';
import { Profile, UserRole } from '../types';

export const AuthService = {
  async getCurrentUser() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      useAuthStore.getState().reset();
      return { user: null, profile: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { user, profile: null };
    }

    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setProfile(profile as Profile);
    return { user, profile: profile as Profile };
  },

  async login(email: string, password: string) {
    useAuthStore.getState().setIsLoading(true);
    useAuthStore.getState().setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      useAuthStore.getState().setUser(data.user);
      useAuthStore.getState().setProfile(profile as Profile);
      useAuthStore.getState().setIsLoading(false);

      return { user: data.user, profile: profile as Profile };
    } catch (err: any) {
      useAuthStore.getState().setError(err.message || 'Login failed');
      useAuthStore.getState().setIsLoading(false);
      throw err;
    }
  },

  async register(email: string, password: string, fullName: string, role: UserRole = 'student', studentId?: string, department?: string) {
    useAuthStore.getState().setIsLoading(true);
    useAuthStore.getState().setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Registration failed. Please try again.');

      // Insert profile directly in case trigger fails or for local control
      const newProfile = {
        id: data.user.id,
        full_name: fullName,
        email,
        role,
        student_id: role === 'student' ? studentId : null,
        department: role === 'student' ? department : null,
        token_balance: 3,
        max_tokens: 3,
        is_active: true,
      };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select('*')
        .single();

      if (profileError) throw profileError;

      useAuthStore.getState().setIsLoading(false);
      return { user: data.user, profile: profile as Profile };
    } catch (err: any) {
      useAuthStore.getState().setError(err.message || 'Registration failed');
      useAuthStore.getState().setIsLoading(false);
      throw err;
    }
  },

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async logout() {
    useAuthStore.getState().setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } finally {
      useAuthStore.getState().reset();
    }
  }
};

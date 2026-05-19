import { supabase } from './supabase';
import { Profile, DashboardStats } from '../types';

export const UsersService = {
  async getProfiles(role?: 'admin' | 'librarian' | 'student') {
    let query = supabase.from('profiles').select('*');
    if (role) {
      query = query.eq('role', role);
    }
    query = query.order('full_name');
    
    const { data, error } = await query;
    if (error) throw error;
    return (data as Profile[]) || [];
  },

  async getProfileById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(id: string, profileData: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async getSettings() {
    const { data, error } = await supabase.from('settings').select('*').order('key');
    if (error) throw error;
    return data;
  },

  async updateSetting(key: string, value: string, updatedBy: string) {
    const { data, error } = await supabase
      .from('settings')
      .update({
        value,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    // 1. Total books
    const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true }).neq('status', 'deleted');
    
    // 2. Total students
    const { count: studentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');

    // 3. Total librarians
    const { count: librariansCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'librarian');

    // 4. Currently issued books
    const { count: issuedCount } = await supabase.from('issued_books').select('*', { count: 'exact', head: true }).eq('status', 'issued');

    // 5. Overdue books
    const { count: overdueCount } = await supabase.from('issued_books').select('*', { count: 'exact', head: true }).eq('status', 'overdue');

    // 6. Fine revenue (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const { data: finesData } = await supabase
      .from('fines')
      .select('total_amount')
      .eq('status', 'paid')
      .gte('paid_at', startOfMonth.toISOString());
    
    const fineRevenue = finesData?.reduce((sum, fine) => sum + parseFloat(fine.total_amount as unknown as string), 0) || 0;

    // 7. Low stock books (< 3 available copies and not digital and not deleted)
    const { count: lowStockCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'deleted')
      .eq('is_digital', false)
      .lt('available_copies', 3);

    return {
      total_books: booksCount || 0,
      total_students: studentsCount || 0,
      total_librarians: librariansCount || 0,
      currently_issued: issuedCount || 0,
      overdue_books: overdueCount || 0,
      fine_revenue_month: fineRevenue,
      low_stock_count: lowStockCount || 0
    };
  }
};

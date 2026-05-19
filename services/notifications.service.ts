import { supabase } from './supabase';
import { Notification } from '../types';

export const NotificationsService = {
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, book:books(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as unknown as Notification[]) || [];
  },

  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data;
  },

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'general',
    relatedBookId?: string,
    relatedIssueId?: string
  ) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title,
        message,
        type,
        related_book_id: relatedBookId,
        related_issue_id: relatedIssueId,
        is_read: false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

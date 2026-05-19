import { supabase } from './supabase';
import { Fine } from '../types';

export const ReturnService = {
  async returnBook(issueId: string, returnedBy: string) {
    // Call the PostgreSQL return_book function
    const { data, error } = await supabase.rpc('return_book', {
      p_issue_id: issueId,
      p_returned_by: returnedBy,
    });

    if (error) throw error;

    // Create activity log
    const { data: issue } = await supabase.from('issued_books').select('book_id, user_id').eq('id', issueId).single();
    if (issue) {
      await supabase.from('activity_logs').insert({
        user_id: issue.user_id,
        action: 'return',
        entity_type: 'book',
        entity_id: issue.book_id,
        details: { issue_id: issueId, returned_by: returnedBy, fine_details: data }
      });

      // Notification
      const { data: book } = await supabase.from('books').select('title').eq('id', issue.book_id).single();
      await supabase.from('notifications').insert({
        user_id: issue.user_id,
        title: 'Book Returned',
        message: `Your borrowed copy of "${book?.title || 'a book'}" has been successfully returned.`,
        type: 'general',
        related_book_id: issue.book_id,
        related_issue_id: issueId
      });
    }

    return data; // Returns JSONB object: { success: boolean, days_overdue: number, fine_amount: number, fine_id: UUID }
  },

  async calculatePotentialFine(dueDateStr: string) {
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    if (daysOverdue === 0) {
      return { daysOverdue: 0, fineAmount: 0 };
    }

    // Fetch per day fine rate from settings
    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'fine_per_day')
      .single();

    const rate = setting?.value ? parseFloat(setting.value as string) : 5.00;
    const fineAmount = daysOverdue * rate;

    return { daysOverdue, fineAmount };
  },

  async getFines(userId?: string) {
    let query = supabase
      .from('fines')
      .select('*, user:profiles(*), issued_book:issued_books(*, book:books(*))');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return (data as unknown as Fine[]) || [];
  },

  async payFine(fineId: string) {
    const { data, error } = await supabase
      .from('fines')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', fineId)
      .select()
      .single();

    if (error) throw error;

    // Log action
    await supabase.from('activity_logs').insert({
      user_id: data.user_id,
      action: 'pay_fine',
      entity_type: 'fine',
      entity_id: fineId,
      details: { amount: data.total_amount }
    });

    // Notify
    await supabase.from('notifications').insert({
      user_id: data.user_id,
      title: 'Fine Payment Confirmed',
      message: `Your payment of LKR ${data.total_amount} has been successfully recorded.`,
      type: 'fine'
    });

    return data;
  },

  async waiveFine(fineId: string, waivedBy: string, reason: string) {
    const { data, error } = await supabase
      .from('fines')
      .update({
        status: 'waived',
        waived_by: waivedBy,
        waive_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', fineId)
      .select()
      .single();

    if (error) throw error;

    // Log action
    await supabase.from('activity_logs').insert({
      user_id: data.user_id,
      action: 'waive_fine',
      entity_type: 'fine',
      entity_id: fineId,
      details: { amount: data.total_amount, waived_by: waivedBy, reason }
    });

    // Notify
    await supabase.from('notifications').insert({
      user_id: data.user_id,
      title: 'Fine Waived',
      message: `Your fine of LKR ${data.total_amount} has been waived. Reason: ${reason}.`,
      type: 'fine'
    });

    return data;
  }
};

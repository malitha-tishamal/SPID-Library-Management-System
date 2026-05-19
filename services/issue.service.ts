import { supabase } from './supabase';
import { IssuedBook } from '../types';

export const IssueService = {
  async issueBook(bookId: string, userId: string, issuedBy: string, dueDate: Date) {
    const formattedDueDate = dueDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD
    
    // Call the PostgreSQL stored function 'issue_book'
    const { data, error } = await supabase.rpc('issue_book', {
      p_book_id: bookId,
      p_user_id: userId,
      p_issued_by: issuedBy,
      p_due_date: formattedDueDate,
    });

    if (error) throw error;
    
    // Create activity log
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action: 'borrow',
      entity_type: 'book',
      entity_id: bookId,
      details: { issue_id: data, issued_by: issuedBy }
    });

    // Create student notification
    const { data: book } = await supabase.from('books').select('title').eq('id', bookId).single();
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Book Issued Successfully',
      message: `You have successfully borrowed "${book?.title || 'a book'}". Due date is ${formattedDueDate}.`,
      type: 'general',
      related_book_id: bookId,
      related_issue_id: data
    });

    return data as string; // Returns the issue_id
  },

  async getActiveIssues(filters?: { search?: string; status?: string }) {
    let query = supabase
      .from('issued_books')
      .select('*, book:books(*), user:profiles(*), issuer:profiles!issued_by(*)')
      .neq('status', 'returned');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    let results = (data as unknown as IssuedBook[]) || [];

    // Filter by search client side or via query if needed
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(
        (issue) =>
          issue.book?.title.toLowerCase().includes(search) ||
          issue.user?.full_name.toLowerCase().includes(search) ||
          issue.user?.student_id?.toLowerCase().includes(search)
      );
    }

    return results;
  },

  async getStudentIssues(studentId: string, activeOnly = true) {
    let query = supabase
      .from('issued_books')
      .select('*, book:books(*), fine:fines(*)')
      .eq('user_id', studentId);

    if (activeOnly) {
      query = query.neq('status', 'returned');
    }

    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return (data as unknown as IssuedBook[]) || [];
  },

  async getIssueHistory(studentId?: string) {
    let query = supabase
      .from('issued_books')
      .select('*, book:books(*), user:profiles(*)');

    if (studentId) {
      query = query.eq('user_id', studentId);
    }

    query = query.order('return_date', { ascending: false, nullsFirst: true }).order('issue_date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return (data as unknown as IssuedBook[]) || [];
  },

  async renewIssue(issueId: string) {
    const { data: issue, error: fetchError } = await supabase
      .from('issued_books')
      .select('*')
      .eq('id', issueId)
      .single();

    if (fetchError) throw fetchError;
    if (issue.status === 'returned') throw new Error('Cannot renew an already returned book.');
    if (issue.renewal_count >= issue.max_renewals) {
      throw new Error(`Maximum renewal limit (${issue.max_renewals}) reached.`);
    }

    const currentDueDate = new Date(issue.due_date);
    const newDueDate = new Date(currentDueDate.getTime() + 14 * 24 * 60 * 60 * 1000); // Add 14 days
    const newDueDateStr = newDueDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('issued_books')
      .update({
        due_date: newDueDateStr,
        renewal_count: issue.renewal_count + 1,
        status: 'renewed',
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .select('*, book:books(*)')
      .single();

    if (error) throw error;

    // Create notifications
    await supabase.from('notifications').insert({
      user_id: issue.user_id,
      title: 'Book Renewed',
      message: `Your borrow duration for "${data.book?.title || 'the book'}" has been extended by 14 days. New due date is ${newDueDateStr}.`,
      type: 'general',
      related_book_id: issue.book_id,
      related_issue_id: issueId
    });

    return data;
  }
};

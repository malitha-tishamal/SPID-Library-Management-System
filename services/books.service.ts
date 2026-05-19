import { supabase } from './supabase';
import { Book, BookStatus } from '../types';

export const BooksService = {
  async getBooks(filters?: {
    search?: string;
    category?: string;
    status?: BookStatus;
    isFeatured?: boolean;
    isDigital?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*), publisher:publishers(*)', { count: 'exact' });

    // Exclude deleted books by default unless explicitly searching for them
    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.neq('status', 'deleted');
    }

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }

    if (filters?.isDigital !== undefined) {
      query = query.eq('is_digital', filters.isDigital);
    }

    if (filters?.search) {
      // Full text search using search_vector
      query = query.textSearch('search_vector', filters.search);
    }

    // Sorting: default to newest books
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      books: (data as Book[]) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  async getBookById(id: string) {
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*), publisher:publishers(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Book;
  },

  async createBook(bookData: Partial<Book>) {
    const { data, error } = await supabase
      .from('books')
      .insert([bookData])
      .select()
      .single();

    if (error) throw error;
    return data as Book;
  },

  async updateBook(id: string, bookData: Partial<Book>) {
    const { data, error } = await supabase
      .from('books')
      .update(bookData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Book;
  },

  async softDeleteBook(id: string) {
    const { data, error } = await supabase
      .from('books')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Book;
  },

  async getTrashBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*)')
      .eq('status', 'deleted')
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return (data as Book[]) || [];
  },

  async restoreBook(id: string) {
    const { data, error } = await supabase
      .from('books')
      .update({
        status: 'available',
        deleted_at: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Book;
  },

  async permanentlyDeleteBook(id: string) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async incrementViewCount(id: string) {
    // Calling rpc to increment view count by 1 in a safe atomic manner
    const { data, error } = await supabase.rpc('increment_view_count', { book_id: id });
    // Fallback if rpc is not present yet: update directly
    if (error) {
      const { data: book } = await supabase.from('books').select('view_count').eq('id', id).single();
      const currentViews = book?.view_count || 0;
      await supabase.from('books').update({ view_count: currentViews + 1 }).eq('id', id);
    }
  },

  // Author, Category, Publisher fetchers for select inputs
  async getCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async getAuthors() {
    const { data, error } = await supabase.from('authors').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async getPublishers() {
    const { data, error } = await supabase.from('publishers').select('*').order('name');
    if (error) throw error;
    return data;
  }
};

import { supabase } from './supabase';
import { Book } from '../types';

export const RecommendationsService = {
  async getRecommendations(userId: string, limit = 10): Promise<Book[]> {
    try {
      // Call the stored database function `get_recommendations`
      const { data, error } = await supabase.rpc('get_recommendations', {
        p_user_id: userId,
        p_limit: limit
      });

      if (error) throw error;
      if (!data || data.length === 0) {
        // Fallback to popular books if no personalized recommendations yet
        return this.getPopularBooks(limit);
      }

      // Fetch book details for each recommended book_id
      const bookIds = data.map((item: any) => item.book_id);
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('*, author:authors(*), category:categories(*), publisher:publishers(*)')
        .in('id', bookIds);

      if (booksError) throw booksError;

      // Sort the returned books back to match the recommendation score order
      const booksMap = new Map(books.map((b) => [b.id, b]));
      return bookIds
        .map((id: string) => booksMap.get(id))
        .filter((b: any) => !!b) as Book[];
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      return this.getPopularBooks(limit);
    }
  },

  async getFeaturedBooks(limit = 6): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*)')
      .eq('is_featured', true)
      .neq('status', 'deleted')
      .limit(limit);

    if (error) throw error;
    return (data as Book[]) || [];
  },

  async getPopularBooks(limit = 6): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*)')
      .neq('status', 'deleted')
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as Book[]) || [];
  },

  async getNewArrivals(limit = 6): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*)')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as Book[]) || [];
  }
};

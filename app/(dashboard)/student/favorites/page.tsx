'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { Book } from '@/types';
import BookCard from '@/components/books/BookCard';
import { Heart, Library } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function StudentFavoritesPage() {
  const { profile } = useAuth();
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('*, book:books(*, author:authors(*), category:categories(*))')
          .eq('user_id', profile.id);

        if (error) throw error;
        const books = (data?.map((f) => f.book) || []).filter(b => b && b.status !== 'deleted');
        setFavorites(books as Book[]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavorites();
  }, [profile]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Retrieving your favorites list...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          My Favorites
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Access your bookmarked novels, research documents, and favorite textbook collections quickly.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <Heart size={40} className="text-slate-300" />
          <h4 className="font-semibold text-slate-800 text-sm mt-3">Wishlist is empty</h4>
          <p className="text-slate-400 text-xs mt-1 max-w-xs">
            Tap the heart icon on any book's detail page to add it to your favorite study shelf!
          </p>
          <Link
            href="/student/search"
            className="mt-4 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

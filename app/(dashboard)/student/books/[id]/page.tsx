'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BooksService } from '@/services/books.service';
import { useAuth } from '@/hooks/useAuth';
import { Book, Favorite } from '@/types';
import PDFViewer from '@/components/ui/PDFViewer';
import StatCard from '@/components/dashboard/StatCard';
import { supabase } from '@/services/supabase';
import {
  ArrowLeft,
  Heart,
  Eye,
  Calendar,
  Layers,
  MapPin,
  FileText,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function BookDetailPage() {
  const { id } = useParams() as { id: string };
  const { profile } = useAuth();
  const router = useRouter();
  
  const [book, setBook] = useState<Book | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteRecord, setFavoriteRecord] = useState<Favorite | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review input fields
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Reservation details
  const [isReserved, setIsReserved] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    if (!id || !profile) return;

    const loadBookDetails = async () => {
      try {
        // Fetch book details
        const data = await BooksService.getBookById(id);
        setBook(data);

        // Increment view count
        await BooksService.incrementViewCount(id);

        // Check if book is favorited by the current student
        const { data: favs } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', profile.id)
          .eq('book_id', id)
          .maybeSingle();
        
        if (favs) {
          setIsFavorite(true);
          setFavoriteRecord(favs);
        }

        // Check if student has a pending reservation
        const { data: res } = await supabase
          .from('reservations')
          .select('*')
          .eq('user_id', profile.id)
          .eq('book_id', id)
          .eq('status', 'pending')
          .maybeSingle();

        if (res) {
          setIsReserved(true);
        }

        // Fetch book reviews
        const { data: revs } = await supabase
          .from('reviews')
          .select('*, user:profiles(full_name, avatar_url)')
          .eq('book_id', id)
          .order('created_at', { ascending: false });

        setReviews(revs || []);

      } catch (err) {
        console.error(err);
        toast.error('Failed to load book data');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookDetails();
  }, [id, profile]);

  const handleToggleFavorite = async () => {
    if (!profile || !book) return;
    try {
      if (isFavorite && favoriteRecord) {
        await supabase.from('favorites').delete().eq('id', favoriteRecord.id);
        setIsFavorite(false);
        setFavoriteRecord(null);
        toast.success('Removed from Favorites');
      } else {
        const { data, error } = await supabase
          .from('favorites')
          .insert([{ user_id: profile.id, book_id: book.id }])
          .select()
          .single();

        if (error) throw error;
        setIsFavorite(true);
        setFavoriteRecord(data);
        toast.success('Added to Favorites');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error toggling Favorites');
    }
  };

  const handleReserveBook = async () => {
    if (!profile || !book) return;
    setIsReserving(true);
    try {
      if (isReserved) {
        // Cancel reservation
        await supabase
          .from('reservations')
          .update({ status: 'cancelled' })
          .eq('user_id', profile.id)
          .eq('book_id', book.id)
          .eq('status', 'pending');

        setIsReserved(false);
        toast.success('Reservation cancelled');
      } else {
        // Create reservation
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48); // Expires in 48 hours

        const { error } = await supabase
          .from('reservations')
          .insert([{
            book_id: book.id,
            user_id: profile.id,
            status: 'pending',
            expires_at: expiresAt.toISOString()
          }]);

        if (error) throw error;

        // Notification
        await supabase.from('notifications').insert({
          user_id: profile.id,
          title: 'Book Reserved',
          message: `Your reservation request for "${book.title}" is pending approval.`,
          type: 'reservation',
          related_book_id: book.id
        });

        setIsReserved(true);
        toast.success('Book successfully reserved!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to place reservation');
    } finally {
      setIsReserving(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !book || !userComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          book_id: book.id,
          user_id: profile.id,
          rating: userRating,
          comment: userComment
        }])
        .select('*, user:profiles(full_name, avatar_url)')
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already submitted a review for this book.');
        }
        throw error;
      }

      setReviews(prev => [data, ...prev]);
      setUserComment('');
      toast.success('Review submitted successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Retrieving catalog records...</span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-center">
        <AlertCircle size={40} className="text-slate-400" />
        <h4 className="font-semibold text-slate-800 text-lg mt-3">Book Not Found</h4>
        <Link href="/student/search" className="mt-2 text-xs font-bold text-accent hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = book.available_copies === 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to list
        </button>
      </div>

      {/* Book details card */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-8 shadow-sm">
        {/* Book cover (left) */}
        <div className="relative w-full md:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-slate-100 flex-shrink-0">
          <img
            src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Book meta (right) */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span
                style={{ backgroundColor: `${book.category?.color || '#6366F1'}15`, color: book.category?.color || '#6366F1' }}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-current shadow-sm"
              >
                {book.category?.name || 'General'}
              </span>
              {book.is_digital && (
                <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                  Digital eBook
                </span>
              )}
            </div>

            <h2 className="font-sora font-extrabold text-2xl md:text-3xl text-slate-800 tracking-tight leading-tight">
              {book.title}
            </h2>
            <span className="text-sm text-slate-500 font-semibold block">
              by {book.author?.name || 'Unknown Author'}
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            {book.description || 'No summary description has been added for this volume.'}
          </p>

          {/* Grid properties */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-slate-100 py-4 text-xs font-semibold text-slate-500">
            <div className="space-y-1">
              <span className="text-slate-400 block font-normal text-[10px] uppercase">ISBN</span>
              <span className="text-slate-800 font-bold">{book.isbn || 'N/A'}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block font-normal text-[10px] uppercase">Publisher</span>
              <span className="text-slate-800 font-bold">{book.publisher?.name || 'N/A'}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block font-normal text-[10px] uppercase">Edition</span>
              <span className="text-slate-800 font-bold">{book.edition || '1st Edition'}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block font-normal text-[10px] uppercase">Lang & Pages</span>
              <span className="text-slate-800 font-bold">{book.language} ({book.pages || '-'} pp.)</span>
            </div>
          </div>

          {/* Location & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            {!book.is_digital && book.shelf_number ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-450 bg-slate-50 border border-slate-150 px-3.5 py-2 rounded-2xl">
                <MapPin size={16} className="text-accent" />
                <span>
                  Located at: <strong>Shelf {book.shelf_number}</strong> • <strong>Rack {book.rack_number || 'N/A'}</strong>
                </span>
              </div>
            ) : (
              <div />
            )}

            {/* Favorite & Reserve CTAs */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleToggleFavorite}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isFavorite
                    ? "bg-rose-50 border-rose-100 text-rose-500"
                    : "bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-slate-50"
                }`}
              >
                <Heart size={20} className={isFavorite ? "fill-rose-500" : ""} />
              </button>

              {/* Physical check-in reserving */}
              {!book.is_digital && (
                <button
                  disabled={!isOutOfStock && !isReserved}
                  onClick={handleReserveBook}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold border shadow-sm transition-all flex items-center gap-1.5 ${
                    isReserved
                      ? "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200"
                      : isOutOfStock
                      ? "bg-accent text-white border-accent hover:bg-accent-dark"
                      : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  }`}
                >
                  {isReserved ? (
                    <>
                      <Clock size={16} />
                      Cancel Reservation
                    </>
                  ) : isOutOfStock ? (
                    <>
                      <Calendar size={16} />
                      Reserve Copy
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      In Stock
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* digital eBook Reader embed (if digital book format) */}
      {book.is_digital && book.pdf_url && (
        <div className="space-y-4">
          <h3 className="font-sora font-bold text-lg text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-accent" />
            Digital eBook Reader
          </h3>
          <PDFViewer url={book.pdf_url} title={book.title} />
        </div>
      )}

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Write a review (1/3 width) */}
        <div className="glass-card p-6 rounded-2xl border border-slate-100 h-fit space-y-4">
          <h3 className="font-sora font-bold text-md text-slate-800">
            Submit Rating & Review
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setUserRating(stars)}
                    className="text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star size={24} className={stars <= userRating ? "fill-amber-400" : "text-slate-200"} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Your Review</label>
              <textarea
                rows={3}
                placeholder="Share your feedback regarding the technical clarity, contents, or utility of this book..."
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-855 text-xs focus:outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview || !userComment.trim()}
              className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isSubmittingReview ? <LoadingSpinner className="text-white h-4 w-4" /> : 'Publish Review'}
            </button>
          </form>
        </div>

        {/* Existing Reviews List (2/3 width) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-100 space-y-4">
          <h3 className="font-sora font-bold text-md text-slate-800">
            Reader Reviews ({reviews.length})
          </h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto divide-y divide-slate-100 pr-2">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No reviews have been written for this volume yet.
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-indigo-50 text-accent flex items-center justify-center font-bold text-xs">
                        {rev.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-800 block">
                          {rev.user?.full_name || 'Anonymous User'}
                        </span>
                        <span className="text-[9px] text-slate-450 block">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-9">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Book } from '../../types';
import { BookOpen, MapPin, Tablet } from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../lib/utils';

interface BookCardProps {
  book: Book;
  className?: string;
}

export default function BookCard({ book, className }: BookCardProps) {
  const isAvailable = book.available_copies > 0;
  
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-150 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 group flex flex-col justify-between",
        className
      )}
    >
      {/* Cover Image container */}
      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden border-b border-slate-100 flex items-center justify-center">
        <img
          src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Digital eBook Tag */}
        {book.is_digital && (
          <span className="absolute top-3 right-3 bg-indigo-600 text-white p-2 rounded-xl flex items-center gap-1 shadow-md">
            <Tablet size={14} />
          </span>
        )}

        {/* Category Tag */}
        <span 
          style={{ backgroundColor: `${book.category?.color || '#6366F1'}15`, color: book.category?.color || '#6366F1' }}
          className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-current shadow-sm"
        >
          {book.category?.name || 'General'}
        </span>
      </div>

      {/* Details Box */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1">
          <h4 className="font-semibold text-slate-800 text-[15px] leading-snug line-clamp-2 group-hover:text-accent transition-colors">
            {book.title}
          </h4>
          <span className="text-xs text-slate-500 block">
            by {book.author?.name || 'Unknown Author'}
          </span>
        </div>

        {/* Shelf location & Available counts */}
        <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
          {/* Location row */}
          {!book.is_digital && book.shelf_number && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <MapPin size={13} className="text-slate-400" />
              <span>Shelf {book.shelf_number} • Rack {book.rack_number || 'N/A'}</span>
            </div>
          )}

          {/* Availability badge */}
          <div className="flex items-center justify-between mt-1">
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm",
                isAvailable 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                  : "bg-rose-50 text-rose-700 border-rose-100"
              )}
            >
              {isAvailable ? `Available (${book.available_copies} copies)` : 'Out of Stock'}
            </span>

            <Link
              href={`/student/books/${book.id}`}
              className="text-xs font-bold text-accent hover:text-accent-dark flex items-center gap-1 group-hover:underline"
            >
              Inspect
              <BookOpen size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

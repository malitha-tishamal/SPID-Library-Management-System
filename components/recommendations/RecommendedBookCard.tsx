'use client';

import React from 'react';
import { Book } from '../../types';
import { Bookmark, Eye, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface RecommendedBookCardProps {
  book: Book;
}

export default function RecommendedBookCard({ book }: RecommendedBookCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-lg transition-all duration-300 group flex gap-4">
      {/* Cover Image Thumbnail */}
      <div className="relative w-20 h-28 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-100">
        <img
          src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Book details */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          {/* Category Tag */}
          <span className="text-[10px] font-bold text-accent uppercase tracking-wide">
            {book.category?.name || 'General'}
          </span>
          <h4 className="font-semibold text-slate-800 text-sm mt-0.5 line-clamp-1 group-hover:text-accent transition-colors">
            {book.title}
          </h4>
          <span className="text-xs text-slate-500 line-clamp-1">
            by {book.author?.name || 'Unknown Author'}
          </span>
        </div>

        {/* Foot Stats and View Details Button */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Eye size={12} />
            <span>{book.view_count} views</span>
          </div>

          <Link
            href={`/student/books/${book.id}`}
            className="text-xs font-bold text-accent hover:text-accent-dark flex items-center gap-0.5 hover:underline"
          >
            Details
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

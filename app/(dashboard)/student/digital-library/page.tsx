'use client';

import React, { useEffect, useState } from 'react';
import { BooksService } from '@/services/books.service';
import { Book } from '@/types';
import BookCard from '@/components/books/BookCard';
import { FolderOpen, HelpCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function StudentDigitalLibraryPage() {
  const [digitalBooks, setDigitalBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDigitalBooks = async () => {
      try {
        const data = await BooksService.getBooks({
          isDigital: true,
          limit: 12
        });
        setDigitalBooks(data.books);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDigitalBooks();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Opening Digital Archives...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          Digital eBook Library
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Instant access to our online eBook collections, research documents, and magazines with inline reading tools.
        </p>
      </div>

      {digitalBooks.length === 0 ? (
        <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <HelpCircle size={40} className="text-slate-350" />
          <h4 className="font-semibold text-slate-800 text-sm mt-3">eBook archive is empty</h4>
          <p className="text-slate-400 text-xs mt-1 max-w-xs">
            No digital PDFs or eBooks have been cataloged in the system yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {digitalBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

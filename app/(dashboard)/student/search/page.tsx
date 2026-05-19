'use client';

import React, { useEffect, useState } from 'react';
import { BooksService } from '@/services/books.service';
import { Book, Category } from '@/types';
import BookCard from '@/components/books/BookCard';
import { Search, SlidersHorizontal, BookOpen, Layers, Tablet, HelpCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function StudentSearchCatalog() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [format, setFormat] = useState<'all' | 'physical' | 'digital'>('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isLoading, setIsLoading] = useState(true);

  // Debounced search effect
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await BooksService.getCategories();
        setCategories(cats as Category[]);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const data = await BooksService.getBooks({
          search: search || undefined,
          category: selectedCategory || undefined,
          isDigital: format === 'all' ? undefined : format === 'digital',
          page,
          limit: 8
        });
        setBooks(data.books);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('Failed to fetch books:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, format, page]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header and subtitle */}
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          Explore Book Catalog
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Search the university collections, check shelf locations, or open digital PDF eBooks.
        </p>
      </div>

      {/* Grid search and filters panel */}
      <div className="glass-card p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search input field */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by title, author, ISBN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset to first page
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        {/* Filters dropdown category */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:border-accent transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Format switches */}
          <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200/50">
            <button
              onClick={() => { setFormat('all'); setPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                format === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setFormat('physical'); setPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                format === 'physical' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Physical
            </button>
            <button
              onClick={() => { setFormat('digital'); setPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                format === 'digital' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Digital
            </button>
          </div>
        </div>
      </div>

      {/* Book Grid Rendering */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-150 p-4 h-[350px] animate-pulse space-y-4">
              <div className="w-full h-48 bg-slate-100 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-5/6 pt-4 border-t border-slate-50" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-100 rounded-2xl">
          <HelpCircle size={40} className="text-slate-350" />
          <h4 className="font-semibold text-slate-800 text-lg mt-3">No Books Found</h4>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">
            We couldn't find any books matching your filters or search keywords. Please adjust your criteria and try again.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-600 px-4">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

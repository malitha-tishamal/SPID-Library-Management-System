'use client';

import React, { useEffect, useState } from 'react';
import { BooksService } from '@/services/books.service';
import { Book } from '@/types';
import { Trash2, RotateCcw, AlertTriangle, Library, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AdminTrashPage() {
  const [deletedBooks, setDeletedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeletedBooks = async () => {
    setIsLoading(true);
    try {
      const data = await BooksService.getTrashBooks();
      setDeletedBooks(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load trash inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedBooks();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await BooksService.restoreBook(id);
      toast.success('Book restored to inventory successfully!');
      fetchDeletedBooks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to restore book');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to permanently delete this book record? This action is destructive and cannot be undone.')) return;
    try {
      await BooksService.permanentlyDeleteBook(id);
      toast.success('Book permanently wiped from database!');
      fetchDeletedBooks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to permanently wipe book');
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <LoadingSpinner className="h-10 w-10 text-accent animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Checking trash archives...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          Soft Deleted Books Trash
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Restore soft-deleted volumes back to the physical collections catalog, or permanently purge them.
        </p>
      </div>

      {/* Main trash container */}
      <div className="glass-card rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {deletedBooks.length === 0 ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl">
            <Trash2 size={40} className="text-slate-300" />
            <h4 className="font-semibold text-slate-800 text-sm mt-3">Trash is Empty</h4>
            <p className="text-slate-450 text-xs mt-1">
              No soft-deleted books are currently in the trash database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-4 px-6 rounded-l-2xl">Book details</th>
                  <th className="py-4 px-6">Deleted At</th>
                  <th className="py-4 px-6">ISBN</th>
                  <th className="py-4 px-6 rounded-r-2xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105">
                {deletedBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                          <img
                            src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">{book.title}</span>
                          <span className="text-[10px] text-slate-450 mt-0.5 block">by {book.author?.name || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600">
                      {book.deleted_at ? new Date(book.deleted_at).toLocaleString() : '-'}
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-700 tracking-wider">
                      {book.isbn || 'N/A'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {/* Restore book */}
                        <button
                          onClick={() => handleRestore(book.id)}
                          className="px-3.5 py-1.5 border border-indigo-200 text-accent bg-indigo-50/50 hover:bg-indigo-100 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>

                        {/* Permanent delete */}
                        <button
                          onClick={() => handlePermanentDelete(book.id)}
                          className="px-3.5 py-1.5 border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
                        >
                          <Trash2 size={14} />
                          Purge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

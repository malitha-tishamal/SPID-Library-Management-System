'use client';

import React, { useEffect, useState } from 'react';
import { BooksService } from '@/services/books.service';
import { Book, Category } from '@/types';
import BookForm from '@/components/books/BookForm';
import BookLabelsPrinter from '@/components/books/BookLabelsPrinter';
import { Search, Plus, Printer, Edit, Trash2, Library, Layers, MapPin, Tablet } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filtering states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [printingLabelBook, setPrintingLabelBook] = useState<Book | null>(null);

  const fetchMetadata = async () => {
    try {
      const cats = await BooksService.getCategories();
      setCategories(cats as Category[]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const data = await BooksService.getBooks({
        search: search || undefined,
        category: selectedCategory || undefined,
        page,
        limit: 8
      });
      setBooks(data.books);
      setTotalPages(data.totalPages);
      setTotalBooks(data.total);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBooks();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory, page]);

  const handleSoftDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to soft-delete this book? It can be restored later from the trash system.')) return;
    try {
      await BooksService.softDeleteBook(id);
      toast.success('Book moved to trash');
      fetchBooks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete book');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header section with CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
            Book Catalog Inventory
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Total of {totalBooks} items cataloged. Complete control over metadata, shelf allocations, and barcodes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-accent hover:bg-accent-dark text-white font-bold py-2.5 px-5 rounded-2xl text-xs shadow-md transition-colors flex items-center gap-1.5"
        >
          <Plus size={16} />
          Catalog New Book
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="glass-card p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by title, author name, ISBN..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-800 text-xs focus:outline-none focus:border-accent"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-xs focus:outline-none focus:border-accent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Inventory list/table */}
      <div className="glass-card rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 min-h-[300px]">
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner className="h-8 w-8 text-accent animate-spin" />
              <span className="text-xs font-semibold text-slate-400">Loading catalog records...</span>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl">
            <Library size={40} className="text-slate-300" />
            <h4 className="font-semibold text-slate-800 text-sm mt-3">Inventory is Empty</h4>
            <p className="text-slate-400 text-xs mt-1 max-w-xs">
              No matching books were found in the database catalog.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-4 px-6 rounded-l-2xl">Book Title</th>
                  <th className="py-4 px-6">Author & Cat</th>
                  <th className="py-4 px-6">ISBN</th>
                  <th className="py-4 px-6">Available / Total</th>
                  <th className="py-4 px-6">Shelf Loc</th>
                  <th className="py-4 px-6 rounded-r-2xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105">
                {books.map((book) => {
                  const outOfStock = book.available_copies === 0;
                  return (
                    <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Title & Cover info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200/50">
                            <img
                              src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                            {book.is_digital && (
                              <span className="absolute top-0 right-0 bg-indigo-600 text-white p-0.5 rounded-bl">
                                <Tablet size={8} />
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-850 text-xs block truncate max-w-[200px]">
                              {book.title}
                            </span>
                            <span className="text-[10px] text-slate-455 mt-0.5 block">
                              Year: {book.publication_year || 'N/A'} • Ed: {book.edition || '1st'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Author and Cat tags */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-700 block">{book.author?.name || 'N/A'}</span>
                        <span 
                          style={{ color: book.category?.color || '#6366F1' }}
                          className="text-[9px] font-extrabold uppercase mt-0.5 block"
                        >
                          {book.category?.name || 'General'}
                        </span>
                      </td>

                      {/* ISBN code */}
                      <td className="py-4 px-6 font-bold text-slate-700 tracking-wider">
                        {book.isbn || 'N/A'}
                      </td>

                      {/* Available count */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full font-bold text-[10px] border shadow-sm",
                              outOfStock
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : book.available_copies < 3
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            )}
                          >
                            {book.available_copies} / {book.total_copies}
                          </span>
                        </div>
                      </td>

                      {/* Shelf location */}
                      <td className="py-4 px-6 text-slate-650">
                        {book.is_digital ? (
                          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">Digital</span>
                        ) : book.shelf_number ? (
                          <span className="font-bold text-xs">
                            S: {book.shelf_number} • R: {book.rack_number || 'N/A'}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">Not set</span>
                        )}
                      </td>

                      {/* Actions toolbar */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Print labels */}
                          <button
                            onClick={() => setPrintingLabelBook(book)}
                            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Print label (QR & Barcode)"
                          >
                            <Printer size={14} />
                          </button>

                          {/* Edit book */}
                          <button
                            onClick={() => setEditingBook(book)}
                            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
                            title="Edit book details"
                          >
                            <Edit size={14} />
                          </button>

                          {/* Delete book */}
                          <button
                            onClick={() => handleSoftDelete(book.id)}
                            className="p-2 border border-slate-200 rounded-xl hover:bg-rose-50 text-slate-450 hover:text-rose-600 transition-colors"
                            title="Move to trash"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-slate-100 bg-slate-50/20">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-slate-650">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add New Book Modal/Drawer */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-150 pb-4">
              <h3 className="font-sora font-bold text-lg text-slate-800">
                Catalog New Book Volume
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 font-bold"
              >
                Close
              </button>
            </div>
            <BookForm
              onSuccess={() => {
                setShowAddModal(false);
                fetchBooks();
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Book Modal/Drawer */}
      {editingBook && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-150 pb-4">
              <h3 className="font-sora font-bold text-lg text-slate-800">
                Edit Book Volume Details
              </h3>
              <button
                onClick={() => setEditingBook(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 font-bold"
              >
                Close
              </button>
            </div>
            <BookForm
              initialBook={editingBook}
              onSuccess={() => {
                setEditingBook(null);
                fetchBooks();
              }}
            />
          </div>
        </div>
      )}

      {/* Label Printer component */}
      {printingLabelBook && (
        <BookLabelsPrinter
          book={printingLabelBook}
          onClose={() => setPrintingLabelBook(null)}
        />
      )}

    </div>
  );
}

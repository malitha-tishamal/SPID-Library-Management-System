'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookFormSchema } from '../../lib/validators';
import { BooksService } from '../../services/books.service';
import { StorageService } from '../../services/storage.service';
import { Book, Author, Category, Publisher } from '../../types';
import { z } from 'zod';
import { Save, Upload, BookOpen, Tablet, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';

type BookFormValues = z.infer<typeof bookFormSchema>;

interface BookFormProps {
  initialBook?: Book;
  onSuccess: () => void;
}

export default function BookForm({ initialBook, onSuccess }: BookFormProps) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Asset upload indicators
  const [coverUploading, setCoverUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema) as any,
    defaultValues: {
      title: initialBook?.title || '',
      isbn: initialBook?.isbn || '',
      description: initialBook?.description || '',
      author_id: initialBook?.author_id || '',
      category_id: initialBook?.category_id || '',
      publisher_id: initialBook?.publisher_id || '',
      total_copies: initialBook?.total_copies || 1,
      shelf_number: initialBook?.shelf_number || '',
      rack_number: initialBook?.rack_number || '',
      language: initialBook?.language || 'English',
      edition: initialBook?.edition || '',
      publication_year: initialBook?.publication_year || new Date().getFullYear(),
      pages: initialBook?.pages || 100,
      is_featured: initialBook?.is_featured || false,
      is_digital: initialBook?.is_digital || false,
      cover_image_url: initialBook?.cover_image_url || '',
      pdf_url: initialBook?.pdf_url || '',
    }
  });

  const isDigitalWatch = watch('is_digital');
  const coverUrlWatch = watch('cover_image_url');
  const pdfUrlWatch = watch('pdf_url');

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [cats, auths, pubs] = await Promise.all([
          BooksService.getCategories(),
          BooksService.getAuthors(),
          BooksService.getPublishers()
        ]);
        setCategories(cats as Category[]);
        setAuthors(auths as Author[]);
        setPublishers(pubs as Publisher[]);
      } catch (err) {
        console.error('Failed to load form metadata:', err);
        toast.error('Failed to populate dropdown selects');
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    loadMetadata();
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    try {
      const publicUrl = await StorageService.uploadBookCover(file);
      setValue('cover_image_url', publicUrl);
      toast.success('Cover image uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload cover image');
    } finally {
      setCoverUploading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfUploading(true);
    try {
      const resource = await StorageService.uploadDigitalResource(file);
      setValue('pdf_url', resource.url);
      toast.success('eBook PDF file uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload eBook PDF file');
    } finally {
      setPdfUploading(false);
    }
  };

  const onSubmit = async (values: BookFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        ...values,
        available_copies: initialBook ? undefined : values.total_copies // new books start with max availability
      };

      if (initialBook) {
        // Adjust availability to account for changed total copies
        const copyDifference = values.total_copies - initialBook.total_copies;
        const newAvailable = Math.max(0, initialBook.available_copies + copyDifference);
        
        await BooksService.updateBook(initialBook.id, {
          ...values,
          available_copies: newAvailable
        });
        toast.success('Book updated successfully!');
      } else {
        await BooksService.createBook(payload);
        toast.success('Book cataloged successfully!');
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save book catalog record');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingMetadata) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner className="h-8 w-8 text-accent animate-spin" />
        <span className="text-xs font-semibold text-slate-400 ml-2">Loading library databases...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Book Title *</label>
            <input
              type="text"
              {...register('title')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-accent"
              placeholder="e.g. Clean Code: Handbook of Agile Software Craftsmanship"
            />
            {errors.title && <span className="text-[10px] text-rose-500">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">ISBN Code</label>
              <input
                type="text"
                {...register('isbn')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-accent"
                placeholder="e.g. 9780132350884"
              />
              {errors.isbn && <span className="text-[10px] text-rose-500">{errors.isbn.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Format Format *</label>
              <select
                {...register('is_digital')}
                onChange={(e) => setValue('is_digital', e.target.value === 'true')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-accent"
              >
                <option value="false">Physical Book</option>
                <option value="true">Digital eBook PDF</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-slate-500">Author *</label>
              <select
                {...register('author_id')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none"
              >
                <option value="">Select Author</option>
                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {errors.author_id && <span className="text-[10px] text-rose-500">{errors.author_id.message}</span>}
            </div>

            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-slate-500">Category *</label>
              <select
                {...register('category_id')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <span className="text-[10px] text-rose-500">{errors.category_id.message}</span>}
            </div>

            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-slate-500">Publisher *</label>
              <select
                {...register('publisher_id')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none"
              >
                <option value="">Select Publisher</option>
                {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.publisher_id && <span className="text-[10px] text-rose-500">{errors.publisher_id.message}</span>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Description Summary</label>
            <textarea
              rows={4}
              {...register('description')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-855 text-xs focus:outline-none"
              placeholder="Provide a brief summary of the book topics, chapters, and audience..."
            />
          </div>
        </div>

        {/* Right Column fields */}
        <div className="space-y-4">
          
          {/* File uploads section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Cover image upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Cover Image</label>
              <div className="border border-slate-200 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100/50 transition-colors relative h-36">
                {coverUrlWatch ? (
                  <img
                    src={coverUrlWatch}
                    alt="Cover preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-[10px] text-slate-400 mt-1">Upload JPEG/PNG</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={coverUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {coverUploading && (
                  <div className="absolute inset-0 bg-slate-900/60 rounded-xl flex items-center justify-center text-white text-[10px]">
                    <LoadingSpinner className="text-white h-4 w-4" />
                  </div>
                )}
              </div>
            </div>

            {/* eBook PDF upload (enabled only if digital watch is true) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">
                Digital PDF Document {isDigitalWatch && '*'}
              </label>
              <div className={`border rounded-xl p-3 flex flex-col items-center justify-center text-center relative h-36 transition-colors ${
                isDigitalWatch 
                  ? "border-slate-200 border-dashed bg-slate-50 hover:bg-slate-100/50" 
                  : "border-slate-100 bg-slate-100/30 cursor-not-allowed text-slate-350"
              }`}>
                {pdfUrlWatch ? (
                  <div className="flex flex-col items-center gap-1">
                    <BookOpen size={24} className="text-indigo-600" />
                    <span className="text-[10px] text-indigo-700 font-bold truncate max-w-[120px]">eBook Linked</span>
                  </div>
                ) : (
                  <>
                    <Tablet size={20} />
                    <span className="text-[10px] mt-1">Upload PDF File</span>
                  </>
                )}
                {isDigitalWatch && (
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    disabled={pdfUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                )}
                {pdfUploading && (
                  <div className="absolute inset-0 bg-slate-900/60 rounded-xl flex items-center justify-center text-white text-[10px]">
                    <LoadingSpinner className="text-white h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Total Copies *</label>
              <input
                type="number"
                disabled={isDigitalWatch}
                {...register('total_copies')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none"
              />
              {errors.total_copies && <span className="text-[10px] text-rose-500">{errors.total_copies.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Language *</label>
              <input
                type="text"
                {...register('language')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Location details (only for physical books) */}
          {!isDigitalWatch && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Shelf Number</label>
                <input
                  type="text"
                  {...register('shelf_number')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-855 text-xs focus:outline-none"
                  placeholder="e.g. S-12"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Rack Number</label>
                <input
                  type="text"
                  {...register('rack_number')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-855 text-xs focus:outline-none"
                  placeholder="e.g. R-4"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Publication Year</label>
              <input
                type="number"
                {...register('publication_year')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Total Page Count</label>
              <input
                type="number"
                {...register('pages')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_featured"
              {...register('is_featured')}
              className="rounded text-accent focus:ring-accent"
            />
            <label htmlFor="is_featured" className="text-xs font-semibold text-slate-600 cursor-pointer">
              Feature on home banners & student dashboard recommendations
            </label>
          </div>
        </div>

      </div>

      {/* Action controls */}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
        <button
          type="submit"
          disabled={isSaving || coverUploading || pdfUploading}
          className="bg-accent hover:bg-accent-dark text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {isSaving ? (
            <LoadingSpinner size={14} className="text-white" />
          ) : (
            <Save size={14} />
          )}
          {initialBook ? 'Update Book Catalog' : 'Catalog New Book'}
        </button>
      </div>
    </form>
  );
}

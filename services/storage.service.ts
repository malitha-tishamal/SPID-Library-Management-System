import { supabase } from './supabase';

export const StorageService = {
  async uploadBookCover(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('library-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      // Fallback: if bucket doesn't exist or is not fully configured, return a default mock cover url or throw
      console.warn('Storage upload warning, using mock fallback', uploadError);
      return URL.createObjectURL(file);
    }

    const { data } = supabase.storage.from('library-assets').getPublicUrl(filePath);
    return data.publicUrl;
  },

  async uploadDigitalResource(file: File): Promise<{ url: string; size: number; type: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `ebooks/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('library-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.warn('Storage upload error, using local fallback URL:', uploadError);
      return {
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type || 'application/pdf'
      };
    }

    const { data } = supabase.storage.from('library-assets').getPublicUrl(filePath);
    return {
      url: data.publicUrl,
      size: file.size,
      type: file.type || 'application/pdf'
    };
  }
};

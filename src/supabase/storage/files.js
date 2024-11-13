import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Store file in Supabase Storage
export const storeFile = async (file, bucket = 'resumes') => {
  try {
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${file.name.replace(/\s+/g, '_')}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      path: fileName,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error storing file:', error);
    throw error;
  }
};

// Get file from Supabase Storage
export const getFile = async (path, bucket = 'resumes') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving file:', error);
    throw error;
  }
};

export const deleteFile = async (path, bucket = 'resumes') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
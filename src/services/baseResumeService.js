import { supabase } from '../config/supabaseClient';

export const baseResumeService = {
  // Upload a new base resume
  async uploadBaseResume(userId, resumeName, resumeContent, fileType) {
    try {
      const { data, error } = await supabase
        .from('user_base_resumes')
        .insert([
          {
            user_id: userId,
            resume_name: resumeName,
            resume_content: resumeContent,
            file_type: fileType,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading base resume:', error);
      throw error;
    }
  },

  // Get all base resumes for a user
  async getUserBaseResumes(userId) {
    try {
      const { data, error } = await supabase
        .from('user_base_resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user base resumes:', error);
      throw error;
    }
  },

  // Get a specific base resume
  async getBaseResume(resumeId, userId) {
    try {
      const { data, error } = await supabase
        .from('user_base_resumes')
        .select('*')
        .eq('id', resumeId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching base resume:', error);
      throw error;
    }
  },

  // Update a base resume
  async updateBaseResume(resumeId, userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_base_resumes')
        .update(updates)
        .eq('id', resumeId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating base resume:', error);
      throw error;
    }
  },

  // Delete a base resume
  async deleteBaseResume(resumeId, userId) {
    try {
      const { error } = await supabase
        .from('user_base_resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting base resume:', error);
      throw error;
    }
  },

  // Set a resume as default
  async setDefaultResume(resumeId, userId) {
    try {
      // First, remove default status from all user's resumes
      await supabase
        .from('user_base_resumes')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the selected resume as default
      const { data, error } = await supabase
        .from('user_base_resumes')
        .update({ is_default: true })
        .eq('id', resumeId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting default resume:', error);
      throw error;
    }
  },

  // Get user's default resume
  async getDefaultResume(userId) {
    try {
      const { data, error } = await supabase
        .from('user_base_resumes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data;
    } catch (error) {
      console.error('Error fetching default resume:', error);
      throw error;
    }
  }
};

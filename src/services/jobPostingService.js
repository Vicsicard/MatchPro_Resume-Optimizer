import axios from 'axios';
import { supabase } from '../config/supabaseClient';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const API_BASE_URL = API_URL + '/api';

export const jobPostingService = {
  // Extract job posting from URL
  extractFromUrl: async (url) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/extract-from-url`, { url });
      return response.data.jobPosting;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to extract job posting');
    }
  },

  // Upload file
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/upload-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.jobPosting;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload file');
    }
  },

  // Process text input
  processText: async (text) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/process-text`, { text });
      return response.data.jobPosting;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to process text');
    }
  },

  // Function to extract key information from job posting
  extractJobInfo: async (jobDescription) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/extract-job-info`, { jobDescription }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to extract job information');
      }

      return await response.data;
    } catch (error) {
      console.error('Error extracting job info:', error);
      throw error;
    }
  },

  // Function to save job posting to database
  saveJobPosting: async (jobData, userId) => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .insert([
          {
            user_id: userId,
            title: jobData.title,
            company: jobData.company,
            description: jobData.description,
            requirements: jobData.requirements,
            skills: jobData.skills,
            location: jobData.location,
            salary_range: jobData.salaryRange,
            status: 'active',
          },
        ])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error saving job posting:', error);
      throw error;
    }
  },

  // Function to get job postings for a user
  getUserJobPostings: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching job postings:', error);
      throw error;
    }
  },

  // Function to update job posting status
  updateJobStatus: async (jobId, status) => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .update({ status })
        .eq('id', jobId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  },

  // Function to delete job posting
  deleteJobPosting: async (jobId) => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting job posting:', error);
      throw error;
    }
  },

  // Function to analyze resume against job posting
  analyzeResumeMatch: async (resumeText, jobId) => {
    try {
      const { data: jobPosting, error: jobError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      const response = await axios.post(`${API_BASE_URL}/analyze-match`, {
        resumeText,
        jobDescription: jobPosting.description,
        requirements: jobPosting.requirements,
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume match');
      }

      return await response.data;
    } catch (error) {
      console.error('Error analyzing resume match:', error);
      throw error;
    }
  },

  // Function to get job posting recommendations
  getJobRecommendations: async (userId) => {
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('skills, experience_level, preferred_locations')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      const { data: jobs, error: jobsError } = await supabase
        .from('job_postings')
        .select('*')
        .contains('skills', userProfile.skills)
        .eq('status', 'active')
        .limit(10);

      if (jobsError) throw jobsError;
      return jobs;
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      throw error;
    }
  },
};

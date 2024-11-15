import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
};

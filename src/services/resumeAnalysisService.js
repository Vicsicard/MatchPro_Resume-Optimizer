import axios from 'axios';

export const resumeAnalysisService = {
  async analyzeResume(resumeText, jobPostingText) {
    try {
      const response = await axios.post('/api/analyze-resume', {
        resumeText,
        jobPostingText
      });
      return response.data;
    } catch (error) {
      console.error('Resume analysis failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to analyze resume');
    }
  },

  async getMatchScore(resumeText, jobPostingText) {
    try {
      const response = await axios.post('/api/match-score', {
        resumeText,
        jobPostingText
      });
      return response.data;
    } catch (error) {
      console.error('Match score calculation failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to calculate match score');
    }
  }
};

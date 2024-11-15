import axios from 'axios';

export const dashboardService = {
  async getOptimizationHistory() {
    try {
      const response = await axios.get('/api/dashboard/history');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch optimization history:', error);
      throw new Error('Failed to fetch optimization history');
    }
  },

  async markAsApplied(optimizationId) {
    try {
      const response = await axios.post(`/api/dashboard/mark-applied/${optimizationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark optimization as applied:', error);
      throw new Error('Failed to update application status');
    }
  },

  async deleteOptimization(optimizationId) {
    try {
      await axios.delete(`/api/dashboard/optimization/${optimizationId}`);
    } catch (error) {
      console.error('Failed to delete optimization:', error);
      throw new Error('Failed to delete optimization');
    }
  },

  async getOptimizationDetails(optimizationId) {
    try {
      const response = await axios.get(`/api/dashboard/optimization/${optimizationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch optimization details:', error);
      throw new Error('Failed to fetch optimization details');
    }
  }
};

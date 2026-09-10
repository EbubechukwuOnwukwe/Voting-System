/**
 * AI Analysis Service
 * Handles AI-powered insights using Groq API
 */
import api from './api';

const aiService = {
  /**
   * Get AI-generated voting summary
   * @returns {Promise} AI summary with voting insights
   */
  async getSummary() {
    const response = await api.get('/ai/summary/');
    return response.data;
  },

  /**
   * Get AI-generated winner predictions
   * @returns {Promise} AI prediction analysis
   */
  async getPrediction() {
    const response = await api.get('/ai/prediction/');
    return response.data;
  },

  /**
   * Get AI analysis of voter turnout
   * @returns {Promise} Turnout analysis
   */
  async getTurnoutAnalysis() {
    const response = await api.get('/ai/turnout/');
    return response.data;
  },
};

export default aiService;

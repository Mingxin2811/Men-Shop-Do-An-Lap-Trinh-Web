import api from './api';

export const reviewService = {
  getReviews: (productId) => api.get(`/products/${productId}/reviews`),
  getEligibility: (productId) => api.get(`/products/${productId}/reviews/eligibility`),
  submitReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  deleteReview: (productId) => api.delete(`/products/${productId}/reviews`),
};

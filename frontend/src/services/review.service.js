import api from './api';

export const reviewService = {
  getReviews: (productId) => api.get(`/products/${productId}/reviews`),
  submitReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  deleteReview: (productId) => api.delete(`/products/${productId}/reviews`),
};

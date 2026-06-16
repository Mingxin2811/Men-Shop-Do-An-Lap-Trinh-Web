import api from './api';

export const couponService = {
  // Customer: kiểm tra mã với giỏ hàng hiện tại
  validate: (code) => api.post('/coupons/validate', { code }),

  // Admin
  getCoupons: () => api.get('/coupons'),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
};

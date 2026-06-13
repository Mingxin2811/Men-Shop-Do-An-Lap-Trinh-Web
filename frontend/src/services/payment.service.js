import api from './api';

export const paymentService = {
  createCheckoutSession: (orderId) =>
    api.post('/payments/create-checkout-session', { orderId }),
  confirmPayment: (orderId) => api.post('/payments/confirm', { orderId }),
  cancelPayment: (orderId) => api.post('/payments/cancel-payment', { orderId }),
};

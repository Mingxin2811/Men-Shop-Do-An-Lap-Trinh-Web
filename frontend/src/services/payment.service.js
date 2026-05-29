import api from './api';

export const paymentService = {
  createCheckoutSession: (orderId) =>
    api.post('/payments/create-checkout-session', { orderId }),
};

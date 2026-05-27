import express from 'express';
import { createCheckoutSession, handleMockPaymentGateway, stripeWebhook } from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/mock-gateway', handleMockPaymentGateway); // Điều hướng trung gian cho test gateway
router.post('/webhook', stripeWebhook);

export default router;
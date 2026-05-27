import express from 'express';
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { admin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Quản trị viên quản lý hóa đơn
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
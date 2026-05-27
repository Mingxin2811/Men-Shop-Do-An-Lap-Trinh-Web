import express from 'express';
import { getCart, addToCart, updateCartItem, deleteCartItem, clearCart } from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Tất cả các route giỏ hàng bắt buộc phải đăng nhập với quyền CUSTOMER/USER
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', deleteCartItem);
router.delete('/', clearCart);

export default router;
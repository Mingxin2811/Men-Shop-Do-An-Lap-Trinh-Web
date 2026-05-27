import express from 'express';
import { getDashboardStats, getUsers, updateUserStatus } from '../controllers/admin.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { admin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Tất cả các route quản lý tổng quan này bắt buộc cần đăng nhập bằng tài khoản ADMIN
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

export default router;
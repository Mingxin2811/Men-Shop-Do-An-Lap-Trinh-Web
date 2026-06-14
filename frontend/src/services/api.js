import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ tự đăng xuất + chuyển về /login khi token hết hạn ở các request đã đăng nhập.
    // Lỗi 401 ngay tại trang đăng nhập (sai email/mật khẩu) phải để component hiển thị,
    // tránh reload trang làm mất thông báo lỗi.
    const isLoginRequest = (error.config?.url || '').includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

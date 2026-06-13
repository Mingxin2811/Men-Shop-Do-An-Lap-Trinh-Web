import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { RecentlyViewedProvider } from './contexts/RecentlyViewedContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { PrivateRoute, AdminRoute } from './routes/ProtectedRoutes';

import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import { OrderHistoryPage, OrderDetailPage } from './pages/OrderPages';
import { PaymentCheckoutPage, PaymentSuccessPage, PaymentCancelPage } from './pages/PaymentPages';
import { BlogListPage, BlogDetailPage } from './pages/BlogPages';
import NotFoundPage from './pages/NotFoundPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import { AdminCategoriesPage, AdminOrdersPage, AdminUsersPage } from './pages/admin/AdminPages';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              <CartProvider>
                <Routes>
                  {/* Public routes */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductListPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/blog" element={<BlogListPage />} />
                    <Route path="/blog/:slug" element={<BlogDetailPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/payment-success" element={<PaymentSuccessPage />} />
                    <Route path="/payment-cancel" element={<PaymentCancelPage />} />

                    {/* Protected customer routes */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/payment-checkout" element={<PaymentCheckoutPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/orders" element={<OrderHistoryPage />} />
                      <Route path="/orders/:id" element={<OrderDetailPage />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Admin routes */}
                  <Route element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route path="/admin" element={<AdminDashboardPage />} />
                      <Route path="/admin/products" element={<AdminProductsPage />} />
                      <Route path="/admin/blog" element={<AdminBlogPage />} />
                      <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                      <Route path="/admin/orders" element={<AdminOrdersPage />} />
                      <Route path="/admin/users" element={<AdminUsersPage />} />
                    </Route>
                  </Route>
                </Routes>
              </CartProvider>
            </RecentlyViewedProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

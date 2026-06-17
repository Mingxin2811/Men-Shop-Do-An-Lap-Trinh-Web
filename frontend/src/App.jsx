import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { RecentlyViewedProvider } from './contexts/RecentlyViewedContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { PrivateRoute, AdminRoute } from './routes/ProtectedRoutes';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const LoginPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.ResetPasswordPage })));
const OrderHistoryPage = lazy(() => import('./pages/OrderPages').then((module) => ({ default: module.OrderHistoryPage })));
const OrderDetailPage = lazy(() => import('./pages/OrderPages').then((module) => ({ default: module.OrderDetailPage })));
const PaymentCheckoutPage = lazy(() => import('./pages/PaymentPages').then((module) => ({ default: module.PaymentCheckoutPage })));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentPages').then((module) => ({ default: module.PaymentSuccessPage })));
const PaymentCancelPage = lazy(() => import('./pages/PaymentPages').then((module) => ({ default: module.PaymentCancelPage })));
const BlogListPage = lazy(() => import('./pages/BlogPages').then((module) => ({ default: module.BlogListPage })));
const BlogDetailPage = lazy(() => import('./pages/BlogPages').then((module) => ({ default: module.BlogDetailPage })));

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminBlogPage = lazy(() => import('./pages/admin/AdminBlogPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminPages').then((module) => ({ default: module.AdminCategoriesPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminPages').then((module) => ({ default: module.AdminOrdersPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminPages').then((module) => ({ default: module.AdminUsersPage })));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminPages').then((module) => ({ default: module.AdminCouponsPage })));

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              <CartProvider>
                <Suspense fallback={<div className="loading-center"><div className="spinner spinner-lg" /></div>}>
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
                        <Route path="/admin/coupons" element={<AdminCouponsPage />} />
                        <Route path="/admin/users" element={<AdminUsersPage />} />
                      </Route>
                    </Route>
                  </Routes>
                </Suspense>
              </CartProvider>
            </RecentlyViewedProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

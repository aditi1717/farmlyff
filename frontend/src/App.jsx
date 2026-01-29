import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import UserLayout from './modules/user/layouts/UserLayout';
import HomePage from './modules/user/pages/HomePage';
import CatalogPage from './modules/user/pages/CatalogPage';
import ProductDetailPage from './modules/user/pages/ProductDetailPage';
import WishlistPage from './modules/user/pages/WishlistPage';
import CartPage from './modules/user/pages/CartPage';
import AuthPage from './modules/user/pages/AuthPage';
import CheckoutPage from './modules/user/pages/CheckoutPage';
import OrderSuccessPage from './modules/user/pages/OrderSuccessPage';
import OrdersPage from './modules/user/pages/OrdersPage';
import OrderDetailPage from './modules/user/pages/OrderDetailPage';
import ReturnsPage from './modules/user/pages/ReturnsPage';
import ReturnDetailPage from './modules/user/pages/ReturnDetailPage';
import ReturnRequestPage from './modules/user/pages/ReturnRequestPage';
import ProfilePage from './modules/user/pages/ProfilePage';
import InfoPage from './modules/user/pages/InfoPage';
import VaultPage from './modules/user/pages/VaultPage';
import AdminLayout from './modules/admin/layout/AdminLayout';
import DashboardPage from './modules/admin/pages/DashboardPage';
import UsersPage from './modules/admin/pages/UsersPage';
import UserDetailPage from './modules/admin/pages/UserDetailPage';
import CategoriesPage from './modules/admin/pages/CategoriesPage';
import SubCategoriesPage from './modules/admin/pages/SubCategoriesPage';
import ProductListPage from './modules/admin/pages/ProductListPage';
import ProductFormPage from './modules/admin/pages/ProductFormPage';
import ComboListPage from './modules/admin/pages/ComboListPage';
import ComboFormPage from './modules/admin/pages/ComboFormPage';
import ComboProductsPage from './modules/admin/pages/ComboProductsPage';
import OrderListPage from './modules/admin/pages/OrderListPage';
import AdminOrderDetailPage from './modules/admin/pages/OrderDetailPage';
import ReturnRequestsPage from './modules/admin/pages/ReturnRequestsPage';
import CouponListPage from './modules/admin/pages/CouponListPage';
import CouponFormPage from './modules/admin/pages/CouponFormPage';
import SettingsPage from './modules/admin/pages/SettingsPage';
import InfluencerReferralPage from './modules/admin/pages/InfluencerReferralPage';
import LoginPage from './modules/admin/pages/LoginPage';
import BannerListPage from './modules/admin/pages/BannerListPage';
import ReelsPage from './modules/admin/pages/ReelsPage';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Provider } from 'react-redux'; // Removed
// import store from './redux/store'; // Removed

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <Router>
            <ScrollToTop />
            <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#fff', color: '#333' } }} />
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<HomePage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="product/:slug" element={<ProductDetailPage />} />
                <Route path="shop" element={<div className="p-20 text-center">Shop Page Coming Soon</div>} />
                <Route path="category/:category" element={<CatalogPage />} />
                <Route path="category/:category/:subCategory" element={<CatalogPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="order/:orderId" element={<OrderDetailPage />} />
                <Route path="returns" element={<ReturnsPage />} />
                <Route path="return/:returnId" element={<ReturnDetailPage />} />
                <Route path="replacement/:returnId" element={<ReturnDetailPage />} />
                <Route path="request-return/:orderId" element={<ReturnRequestPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="vault" element={<VaultPage />} />
                <Route path="profile/:tab?" element={<ProfilePage />} />
                <Route path="about-us" element={<InfoPage type="about" />} />
                <Route path="privacy-policy" element={<InfoPage type="privacy" />} />
                <Route path="contact-us" element={<InfoPage type="contact" />} />
                <Route path="login" element={<AuthPage />} />
              </Route>
  
              <Route path="/admin/login" element={<LoginPage />} />
  
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="users/:id" element={<UserDetailPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="sub-categories" element={<SubCategoriesPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/add" element={<ProductFormPage />} />
                <Route path="products/edit/:id" element={<ProductFormPage />} />
                <Route path="banners" element={<BannerListPage />} />
                <Route path="combo-categories" element={<ComboListPage />} />
                <Route path="combo-products" element={<ComboProductsPage />} />
                <Route path="combo-products/add" element={<ComboFormPage />} />
                <Route path="combos/add" element={<ComboFormPage />} />
                <Route path="combos/edit/:id" element={<ComboFormPage />} />
                <Route path="orders" element={<OrderListPage />} />
                <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                <Route path="returns" element={<ReturnRequestsPage />} />
                <Route path="coupons" element={<CouponListPage />} />
                <Route path="coupons/add" element={<CouponFormPage />} />
                <Route path="coupons/edit/:id" element={<CouponFormPage />} />
                <Route path="referrals" element={<InfluencerReferralPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="reels" element={<ReelsPage />} />
              </Route>
  
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

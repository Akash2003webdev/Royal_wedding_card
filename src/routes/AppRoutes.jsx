import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
const Home = lazy(() => import('../pages/Home.jsx'));
const Collections = lazy(() => import('../pages/Collections.jsx'));
const ProductDetail = lazy(() => import('../pages/ProductDetail.jsx'));
const Gallery = lazy(() => import('../pages/Gallery.jsx'));
const About = lazy(() => import('../pages/About.jsx'));
const Contact = lazy(() => import('../pages/Contact.jsx'));
const Cart = lazy(() => import('../pages/Cart.jsx'));
const Wishlist = lazy(() => import('../pages/Wishlist.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const Account = lazy(() => import('../pages/Account.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));
const AdminLayout = lazy(() => import('../admin/AdminLayout.jsx'));
const AdminDashboard = lazy(() => import('../admin/AdminDashboard.jsx'));
const AdminProducts = lazy(() => import('../admin/AdminProducts.jsx'));
const AdminCategories = lazy(() => import('../admin/AdminCategories.jsx'));
const AdminBanners = lazy(() => import('../admin/AdminBanners.jsx'));
const AdminGallery = lazy(() => import('../admin/AdminGallery.jsx'));
const AdminOrders = lazy(() => import('../admin/AdminOrders.jsx'));
const AdminReviews = lazy(() => import('../admin/AdminReviews.jsx'));
const AdminUsers = lazy(() => import('../admin/AdminUsers.jsx'));
const AdminSettings = lazy(() => import('../admin/AdminSettings.jsx'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-neutral-500">Loading...</div>}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/collections/:slug" element={<Collections />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/login" element={<Login />} />
      <Route path="/account" element={<Account />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

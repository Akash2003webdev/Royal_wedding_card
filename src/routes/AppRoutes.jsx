import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import Collections from '../pages/Collections.jsx';
import ProductDetail from '../pages/ProductDetail.jsx';
import Gallery from '../pages/Gallery.jsx';
import About from '../pages/About.jsx';
import Contact from '../pages/Contact.jsx';
import Cart from '../pages/Cart.jsx';
import Wishlist from '../pages/Wishlist.jsx';
import Login from '../pages/Login.jsx';
import Account from '../pages/Account.jsx';
import NotFound from '../pages/NotFound.jsx';
import AdminLayout from '../admin/AdminLayout.jsx';
import AdminDashboard from '../admin/AdminDashboard.jsx';
import AdminProducts from '../admin/AdminProducts.jsx';
import AdminCategories from '../admin/AdminCategories.jsx';
import AdminBanners from '../admin/AdminBanners.jsx';
import AdminGallery from '../admin/AdminGallery.jsx';
import AdminOrders from '../admin/AdminOrders.jsx';
import AdminReviews from '../admin/AdminReviews.jsx';
import AdminUsers from '../admin/AdminUsers.jsx';
import AdminSettings from '../admin/AdminSettings.jsx';

export default function AppRoutes() {
  return (
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
  );
}

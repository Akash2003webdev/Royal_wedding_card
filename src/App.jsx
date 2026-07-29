import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import FloatingButtons from './components/FloatingButtons.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Loader from './components/Loader.jsx';
import PageTransition from './layouts/PageTransition.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  // Admin is its own standalone panel — no storefront header, footer,
  // bottom nav, or floating WhatsApp/call buttons in there.
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <PageTransition>
          <AppRoutes />
        </PageTransition>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingButtons />}
      {!isAdminRoute && <CartDrawer />}
    </div>
  );
}

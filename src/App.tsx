import React, { useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

// Contexts
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { AppProvider } from '@/src/context/AppContext';
import { CartProvider } from '@/src/context/CartContext';

// API
import { SESSION_EXPIRED_EVENT } from '@/src/api/axios';

// Layout Principal
import Layout from '@/src/components/layout/Layout';

// Pages (LAZY LOADING)
const Home = lazy(() => import('@/src/pages/Home'));
const Products = lazy(() => import('@/src/pages/Products'));
const ProductDetail = lazy(() => import('@/src/pages/ProductDetail'));
const OrderSuccess = lazy(() => import('@/src/pages/OrderSuccess'));

const AppContent: React.FC = () => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Sesión expirada (401 en axios): limpia credenciales y vuelve al inicio sin recargar la SPA
  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      navigate('/', { replace: true });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [logout, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // No se bloquea el render esperando a la API: cada vista muestra sus propios skeletons.
  // El Suspense de las páginas lazy vive en Layout, para que Header y Footer se pinten de inmediato.
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/category/:category" element={<Products />} />
        <Route path="/category/:category/:subcategory" element={<Products />} />
        <Route path="/offers" element={<Products />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/orden/:id" element={<OrderSuccess />} />

        <Route 
          path="*" 
          element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center">
              <h1 className="text-8xl font-lilita text-gray-200 mb-4">404</h1>
              <p className="text-gray-500 font-fredoka font-medium text-xl">Uy! Parece que este plato está vacío.</p>
              <a href="/" className="mt-6 bg-brand-primary text-white font-fredoka font-semibold py-3 px-8 rounded-full hover:bg-orange-600 transition-colors shadow-md">Volver al inicio</a>
            </div>
          } 
        />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <CartProvider>
          <Router basename={import.meta.env.BASE_URL}>
            <AppContent />
          </Router>
        </CartProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
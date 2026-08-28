import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Contexts
import { AuthProvider } from '@/src/context/AuthContext';
import { AppProvider, useApp } from '@/src/context/AppContext';
import { CartProvider } from '@/src/context/CartContext';

// Layout Principal
import Layout from '@/src/components/layout/Layout';

// Pages (LAZY LOADING)
const Home = lazy(() => import('@/src/pages/Home'));
const Products = lazy(() => import('@/src/pages/Products'));
const ProductDetail = lazy(() => import('@/src/pages/ProductDetail'));
const OrderSuccess = lazy(() => import('@/src/pages/OrderSuccess'));

// PANTALLA DE CARGA GLOBAL (Reactivo puro a la API)
const GlobalLoader = () => (
  <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
    <div className="relative flex items-center justify-center mb-8">
      {/* Círculo animado de fondo */}
      <div className="absolute inset-0 bg-brand-primary rounded-full animate-ping opacity-20 [animation-duration:2.5s]"></div>
      {/* Ícono central */}
      <div className="relative bg-brand-primary w-24 h-24 rounded-full flex items-center justify-center shadow-xl">
        <i className="fa-solid fa-paw text-4xl text-white animate-pulse [animation-duration:2s]"></i>
      </div>
    </div>
    <h1 className="text-4xl md:text-5xl font-lilita text-brand-primary tracking-wide drop-shadow-sm">
      ALIMENTO AHORA
    </h1>
    <div className="mt-6 flex gap-2">
      <div className="w-3 h-3 bg-orange-300 rounded-full animate-bounce [animation-duration:1.2s]" style={{ animationDelay: '0s' }}></div>
      <div className="w-3 h-3 bg-brand-primary rounded-full animate-bounce [animation-duration:1.2s]" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce [animation-duration:1.2s]" style={{ animationDelay: '0.4s' }}></div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { pathname } = useLocation();
  const { loading } = useApp(); 

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // Si la API está cargando los datos iniciales, mostramos el loader reactivo
  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <Suspense fallback={<GlobalLoader />}>
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
    </Suspense>
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
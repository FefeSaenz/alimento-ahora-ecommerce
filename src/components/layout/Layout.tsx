import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Contexts
import { useApp } from '@/src/context/AppContext';
import { useCart } from '@/src/context/CartContext';

// Components
import Header from './Header';
import Footer from './Footer';
import AnnouncementBar from './AnnouncementBar';
import CartDrawer from '@/src/components/cart/CartDrawer';
import QuickViewModal from '@/src/components/ui/QuickViewModal';
import CheckoutModal from '@/src/components/ui/CheckoutModal';
import UserProfile from '@/src/components/ui/UserProfile';
import WhatsAppButton from '@/src/components/ui/WhatsAppButton';
import TermsModal from '@/src/components/ui/TermsModal';
import SearchOverlay from './SearchOverlay';

import { Product } from '@/src/types/product.types';
import { useUnifiedProducts } from '@/src/hooks/useUnifiedProducts';

const Layout: React.FC = () => {
    const navigate = useNavigate();
    const { loading } = useApp();
    const { 
        cart, orders, isCartOpen, setIsCartOpen, 
        isProfileOpen, setIsProfileOpen, 
        isCheckoutOpen, setIsCheckoutOpen, 
        addToCart, updateQuantity, removeFromCart, 
        handleCheckoutComplete 
    } = useCart();

    // Importo productos
    const { unifiedProducts } = useUnifiedProducts();

    // --- ESTADOS GLOBALES DE UI ---
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);

    // Manejador de búsqueda: Redirige a la tienda con el parámetro
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        if (value.trim()) {
            setIsSearchOpen(false);
            navigate(`/productos?search=${encodeURIComponent(value)}`); // Dirige a la página de productos
        }
    };

    return (
        <div className="min-h-screen flex flex-col pt-20">
          
            <Header 
                onOpenCart={() => setIsCartOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenSearch={() => setIsSearchOpen(true)}
                cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            />
          
            <AnnouncementBar 
                messages={["ENVÍO GRATIS + $20.000 EN PARANÁ"]} 
            />

            <SearchOverlay 
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSearchSubmit={handleSearch}
                products={unifiedProducts}
            />
            
            <main className="grow bg-white">
                {/* Pasamos setSelectedQuickView para que las páginas hijas (Home, Category) puedan abrirlo */}
                <Outlet context={{ setSelectedQuickView, searchTerm, setSearchTerm }} />
            </main>

            <Footer onOpenTerms={() => setIsTermsOpen(true)} />

            {/* --- COMPONENTES DE INTERACCIÓN GLOBAL --- */}
            <CartDrawer 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                onOpenCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onAddFromRec={(p) => setSelectedQuickView(p)}
            />

            <QuickViewModal 
                product={selectedQuickView}
                onClose={() => setSelectedQuickView(null)}
                onAddToCart={(item) => {
                    addToCart(item); // Recibe el CartItem perfecto y lo manda directo al carrito
                    setSelectedQuickView(null); 
                }}
            />

            <CheckoutModal 
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cart={cart}
                onComplete={handleCheckoutComplete}
            />

            <UserProfile 
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                orders={orders}
            />

            {/* NUEVO MODAL DE TÉRMINOS */}
            <TermsModal 
                isOpen={isTermsOpen} 
                onClose={() => setIsTermsOpen(false)} 
            />

            <WhatsAppButton />

            {/* Toaster global estilizado para ALIMENTO AHORA (Más amigable y curvo) */}
            <Toaster 
                position="top-center" 
                toastOptions={{
                    className: '!bg-white !text-black !border-gray-200 !border !rounded-2xl !shadow-xl !font-fredoka !py-4 !px-6',
                    classNames: {
                        title: '!text-[14px] !font-bold !text-gray-800',
                        description: '!text-gray-500 !text-sm',
                        error: '!border-l-4 !border-l-red-500',
                        success: '!border-l-4 !border-l-brand-primary', // Usamos el naranja de la marca para el éxito
                        info: '!border-l-4 !border-l-blue-500',
                    }
                }} 
            />
            
        </div>
    );
};

export default Layout;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavLink from '@/src/components/ui/NavLink';
import { useApp } from '@/src/context/AppContext';
import logoAlimentoAhora from '@/src/assets/logoNegro-alimentoAhora.png';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  cartCount: number;
}

const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenProfile, onOpenSearch, cartCount }) => {
  const { menuItems, logoText } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isAnchor = href.includes('#');
    const isExternalPage = window.location.pathname !== '/';

    if (isAnchor && !isExternalPage) {
      e.preventDefault();
      const targetId = href.split('#')[1];
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    } 
    setIsMobileMenuOpen(false);
  };
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 lg:px-5 h-20 flex items-center justify-between text-black">
        
        {/* --- 1. BLOQUE IZQUIERDO --- */}
        {/* Ajuste: Reducimos space-x-5 a space-x-3 en móviles para alejar la lupa del centro */}
        <div className="flex items-center space-x-3 md:space-x-5">
          
          {/* Mobile/Tablet: Hamburguesa */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-gray-800 hover:text-brand-primary transition-colors cursor-pointer p-1"
            aria-label="Abrir menú"
          >
            <div className="flex flex-col space-y-1.5 items-start">
              <span className="block w-6 h-0.5 bg-current rounded-full transition-colors"></span>
              <span className="block w-5 h-0.5 bg-current rounded-full transition-colors"></span>
              <span className="block w-6 h-0.5 bg-current rounded-full transition-colors"></span>
            </div>
          </button>

          {/* Mobile/Tablet: Lupa */}
          <button 
            onClick={onOpenSearch} 
            className="lg:hidden text-gray-800 hover:text-brand-primary transition-colors cursor-pointer p-1"
            aria-label="Buscar"
          >
            <i className="fa-solid fa-magnifying-glass text-xl"></i>
          </button>

          {/* Desktop: Logo */}
          <Link to="/" className="hidden lg:flex items-center hover:opacity-80 transition-opacity py-1 mr-8">
            {logoAlimentoAhora ? (
              <img 
                src={logoAlimentoAhora}
                alt="ALIMENTO AHORA" 
                width={150}
                height={64}
                fetchPriority="high"
                className="h-10 lg:h-8 w-auto object-contain object-left transition-all" 
              />
            ) : (
              <span className="text-3xl font-lilita tracking-wide text-brand-primary">{logoText}</span>
            )}
          </Link>
          
          {/* Desktop: Navegación */}
          <nav className="hidden lg:flex items-center space-x-8 h-full">
            {menuItems && menuItems.length > 0 ? (
              menuItems.map((item) => (
                <NavLink 
                  key={item.id} 
                  item={item} 
                  onClick={handleNavClick} 
                  className="h-full text-[14px] font-sans font-medium tracking-wide text-gray-800 hover:text-brand-primary transition-colors" 
                />
              ))
            ) : (
              <span className="text-sm font-fredoka text-gray-400 animate-pulse">Cargando menú...</span>
            )}
          </nav>
        </div>

        {/* --- 2. BLOQUE CENTRAL (Solo Mobile/Tablet) --- */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            {logoAlimentoAhora ? (
              <img 
                src={logoAlimentoAhora} 
                alt="ALIMENTO AHORA" 
                width={150}
                height={48}
                fetchPriority="high"
                /* Ajuste: h-[34px] (punto medio) y tope estricto de 150px de ancho */
                className="h-10 md:h-11 w-auto max-w-43.75 md:max-w-62.5 object-contain" />
            ) : (
              <span className="text-2xl font-lilita tracking-wide text-brand-primary">{logoText}</span>
            )}
          </Link>
        </div>

        {/* --- 3. BLOQUE DERECHO (Acciones) --- */}
        <div className="flex items-center space-x-6">
          
          {/* Desktop: Lupa */}
          <button 
            onClick={onOpenSearch} 
            className="hidden lg:block text-gray-800 hover:text-brand-primary transition-transform active:scale-95 cursor-pointer"
            aria-label="Buscar"
          >
            <i className="fa-solid fa-magnifying-glass text-xl"></i>
          </button>

          {/* Desktop: Perfil */}
          <button 
            onClick={onOpenProfile} 
            className="hidden lg:block text-gray-800 hover:text-brand-primary transition-transform active:scale-95 cursor-pointer"
            aria-label="Perfil de usuario"
          >
            <i className="fa-solid fa-user text-xl"></i>
          </button>

          {/* Mobile, Tablet & Desktop: Carrito */}
          <button 
            onClick={onOpenCart} 
            className="relative group transition-transform active:scale-95 cursor-pointer p-1"
            aria-label="Abrir carrito"
          >
            <i className="fa-solid fa-cart-shopping text-xl text-gray-800 group-hover:text-brand-primary transition-colors"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-in fade-in zoom-in border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* COMPONENTE DE MENÚ MOBILE (Drawer) */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        onOpenProfile={onOpenProfile}
      />
    </>
  );
};

export default Header;
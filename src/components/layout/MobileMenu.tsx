import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { useApp } from '@/src/context/AppContext';
import NavLink from '@/src/components/ui/NavLink';
import logoAlimentoAhora from '@/src/assets/logoNegro-alimentoAhora.png';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onOpenProfile }) => {
  const { menuItems, logoText } = useApp();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    onClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-white flex flex-col ui-slide-panel ui-slide-left ${isOpen ? 'is-open' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex flex-col w-full">
        
        {/* HEADER DRAWER */}
        <div className="flex items-center justify-between h-20 border-b border-gray-100 shrink-0">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            {logoAlimentoAhora ? (
              <img 
                src={logoAlimentoAhora} 
                alt="ALIMENTO AHORA" 
                width={130}
                height={40}
                className="h-8 w-auto max-w-30 object-contain" 
              />
            ) : (
              <span className="text-xl font-lilita text-brand-primary">{logoText}</span>
            )}
          </Link>
          
          <button onClick={onClose} className="text-gray-800 hover:text-brand-primary p-2 cursor-pointer bg-gray-50 rounded-full w-10 h-10 flex items-center justify-center transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        {/* LINKS GRANDES Y AMIGABLES (Acá cambiamos Lilita por Fredoka Bold) */}
        <div className="flex-1 overflow-y-auto pt-8 pb-4"> 
          <nav className="flex flex-col space-y-4"> 
            {menuItems && menuItems.map((item) => (
              <div key={item.id} className="block border-b border-gray-50 pb-2">
                <NavLink 
                  item={item} 
                  onClick={handleLinkClick} 
                  showSubmenu={false} 
                  className="text-2xl font-fredoka font-bold text-gray-800 hover:text-brand-primary leading-tight transition-transform active:translate-x-2" 
                />
              </div>
            ))}
          </nav>
        </div>

        {/* FOOTER DRAWER */}
        <div className="border-t border-gray-100 py-8 shrink-0 flex flex-col space-y-6">
          <button 
            onClick={() => { onOpenProfile(); onClose(); }} 
            className="flex items-center space-x-3 text-left w-fit cursor-pointer bg-orange-50 px-4 py-2 rounded-full hover:bg-orange-100 transition-colors"
          >
            <i className="fa-regular fa-user text-lg text-brand-primary"></i>
            <span className="text-sm font-fredoka font-semibold text-brand-primary">Mi Cuenta</span>
          </button>
          
          <div className="flex items-center space-x-6 px-2">
            <a href="https://www.instagram.com/alimentoahora/" target="_blank" rel="noopener noreferrer" className="text-sm font-fredoka text-gray-500 hover:text-brand-primary transition-colors flex items-center gap-2">
              <i className="fa-brands fa-instagram text-lg"></i>
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
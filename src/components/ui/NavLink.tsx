import React from 'react';
import { Link } from 'react-router-dom';
import { MenuItem } from '@/src/types/api';

interface NavLinkProps {
  item: MenuItem;
  //Pasamos el href para que el manejador de scroll funcione
  onClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  className?: string;
  showSubmenu?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ item, onClick, className = "", showSubmenu = true }) => {
  if (!item) return null;

  const hasSubmenu = showSubmenu && item.submenu && item.submenu.length > 0;
  
  return (
    <div className="relative group flex items-center w-full">
      <Link
        to={item.url}
        onClick={(e) => onClick(e, item.url)}
        // Eliminé el uppercase para dejarlo más versátil
        className={`transition-colors flex items-center gap-2 ${
          item.active ? 'opacity-100' : 'opacity-80 hover:opacity-100'
        } ${className}`}
      >
        {item.label}
        
        {/* Lógica del icono de fuego */}
        {item.icon === 'fire' && (
          <i className="fa-solid fa-fire text-orange-500 animate-pulse text-[0.8em] pr-0"></i>
        )}
      </Link>

      {/* Renderizado condicional del Submenú */}
      {hasSubmenu && (
        <div className="bg-white/30 absolute top-full left-0 hidden md:group-hover:block animate-in fade-in slide-in-from-top-1 duration-200 z-50">
          {/* Bordes redondeados para seguir el estilo amigable */}
          <div className="bg-white/95 backdrop-blur-md shadow-xl border border-gray-100 p-4 min-w-48 rounded-2xl mt-1">
            {item.submenu?.map((sub, idx) => (
              <Link
                key={`${sub.url}-${idx}`}
                to={sub.url}
                onClick={(e) => onClick(e, sub.url)}
                className="block py-2 px-2 text-[14px] font-fredoka font-medium text-gray-600 hover:text-brand-primary hover:bg-orange-50 rounded-lg transition-all"
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavLink;
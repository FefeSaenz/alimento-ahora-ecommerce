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
        // Eliminé los text-gray-400 y hover:text-black de acá. 
        // Ahora el color se controla 100% desde la prop 'className' que viene del Header.
        className={`uppercase font-black transition-colors flex items-center gap-2 ${
          item.active ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        } ${className}`}
      >
        {item.label}
        
        {/* Lógica del icono de fuego inyectada en el átomo */}
        {item.icon === 'fire' && (
          <i className="fa-solid fa-fire text-orange-500 animate-pulse text-[0.8em] pr-0"></i>
        )}
      </Link>

      {/* Renderizado condicional del Submenú */}
      {hasSubmenu && (
        <div className="bg-white/30 absolute top-full left-0 hidden md:group-hover:block animate-in fade-in slide-in-from-top-1 duration-200 z-50">
          {/* mt-[-10px] para que no haya "hueco" y no se cierre al mover el mouse */}
          <div className="bg-white/90 backdrop-blur-md shadow-xl border-gray-100 border-0 p-6 min-w-55">
            {item.submenu?.map((sub, idx) => (
              <Link
                key={`${sub.url}-${idx}`}
                to={sub.url}
                onClick={(e) => onClick(e, sub.url)}
                // Los colores del submenu quedan fijos porque el fondo del submenu siempre es blanco
                className="block py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
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
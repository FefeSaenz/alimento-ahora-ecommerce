import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbStep {
  label: string;
  href?: string; // Si no hay href, es el paso actual (texto plano)
}

interface BreadcrumbsProps {
  items: BreadcrumbStep[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = "" }) => {
  return (
    <nav className={`flex flex-wrap items-center text-[10px] font-black uppercase tracking-[2px] text-gray-400 gap-y-2 ${className}`}>
      {/* Paso inicial estático: Inicio */}
      <Link to="/" className="hover:text-black transition-colors shrink-0">
        Inicio
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="mx-2 md:mx-3 shrink-0">/</span>
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-black transition-colors shrink-0"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-black truncate">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
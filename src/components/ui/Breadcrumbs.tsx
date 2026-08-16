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
    <nav className={`flex flex-wrap items-center text-xs font-fredoka font-bold uppercase tracking-wider text-gray-400 gap-y-2 ${className}`}>
      {/* Paso inicial estático: Inicio */}
      <Link to="/" className="hover:text-brand-primary transition-colors shrink-0 flex items-center gap-1.5">
        <i className="fa-solid fa-house text-[10px]"></i> Inicio
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <i className="fa-solid fa-chevron-right text-[8px] mx-2 text-gray-300 shrink-0"></i>
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-brand-primary transition-colors shrink-0"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 truncate">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
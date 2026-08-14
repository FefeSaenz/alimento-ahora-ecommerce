import React from 'react';
import { Link } from 'react-router-dom';

interface SectionTitleProps {
  title: string;
  viewAllLink?: string;
  viewAllText?: string;
  variant?: 'default' | 'slim';
}

const SectionTitle: React.FC<SectionTitleProps> = ({ 
  title, 
  viewAllLink, 
  viewAllText,
  variant = 'default'
}) => {

  const titleSize = variant === 'slim' ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl';
  const borderSize = variant === 'slim' ? 'border-b-3' : 'border-b-4';

  return (
    // El contenedor principal (w-full) maneja la línea de lado a lado
    <div className={`w-full ${borderSize} border-brand-primary mb-4`}>
      {/* El contenedor interno (max-w-360) mantiene el texto alineado con los productos */}
      <div className="max-w-360 mx-auto px-6 flex justify-between items-end pb-2">
        <h2 className={`${titleSize} font-lilita text-gray-800 tracking-wide leading-none`}>
          {title}
        </h2>
        
        {/* Link visible solo en Desktop */}
        {viewAllLink && viewAllText && (
          <Link
            to={viewAllLink}
            className="text-xs pb-1 font-fredoka font-semibold uppercase tracking-wider text-gray-400 hover:text-brand-primary transition-colors hidden md:block cursor-pointer"
          >
            {viewAllText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default SectionTitle;
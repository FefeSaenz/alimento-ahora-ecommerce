import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/src/types/product.types';
import Price from './Price';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Solución para los Tags (Array o String)
  const displayTag = Array.isArray(product.tags) ? product.tags[0] : product.tags;

  // Ruta dinámica hacia la PDP
  const productUrl = `/product/${product.slug}`;

  return (
      // 1. Contenedor principal es un DIV, con grupo relativo para hover
      <div 
        className="flex flex-col group relative w-full" 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* SECCIÓN DE IMAGEN (Aspect Ratio 3/4) */}
        <div className="relative aspect-3/4 overflow-hidden bg-gray-50 rounded-2xl w-full border border-gray-100 shadow-sm transition-shadow group-hover:shadow-md">
          
          {/* OPTIMIZACIÓN SEO Y PERFORMANCE: Renderizamos ambas imágenes y usamos opacidad cruzada */}
          {/* CAPA 1: Imagen Principal */}
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy" 
            decoding="async"
            className={`w-full h-full object-contain p-4 transition-all duration-700 ease-in-out ${
              product.images?.length > 1 ? 'group-hover:opacity-0' : 'group-hover:scale-105'
            }`}
          />
          
          {/* CAPA 1.5: Imagen Secundaria (Hover). Se precarga pero está oculta hasta el hover */}
          {product.images?.length > 1 && (
            <img
              src={product.images[1]}
              alt={`${product.name} vista alternativa`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-contain p-4 opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105"
            />
          )}
  
          {/* CAPA 2: Etiqueta Visual y Filtro Oscuro (Visuales) */}
          {displayTag && (
            <div className="absolute top-3 left-3 bg-brand-primary text-white px-3 py-1 text-[10px] font-fredoka font-bold uppercase tracking-wider z-10 rounded-full pointer-events-none shadow-sm">
              {displayTag}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none z-10"></div>
  
          {/* CAPA 3: EL LINK DE CRISTAL */}
          <Link 
            to={productUrl} 
            className="absolute inset-0 z-10 cursor-pointer"
            title={`Ver ${product.name}`}
          />
  
          {/* CAPA 4: EL BOTÓN DE VISTA RÁPIDA */}
          <div className="absolute inset-0 bottom-0 max-md:hidden items-end pb-4 justify-center opacity-0 group-hover:opacity-100 z-20 pointer-events-none transition-opacity duration-300 flex">
             <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAdd(product);
              }}
              className="bg-white text-brand-primary border border-gray-200 px-6 py-2.5 text-xs font-fredoka font-bold uppercase tracking-wider rounded-full shadow-lg hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300 active:scale-[0.98] cursor-pointer pointer-events-auto"
             >
              Vista Rápida
             </button>
          </div>
        </div>
        
        {/* SECCIÓN DE TEXTOS (Título y Precio) */}
        {/* También es un Link nativo hacia la PDP - PC & Mobile */}
        <Link to={productUrl} className="mt-4 text-center block cursor-pointer z-10" title={`Ver ${product.name}`}>
          <h3 className="text-sm font-fredoka font-semibold text-gray-800 leading-tight mb-1">{product.name}</h3>
          <Price amount={product.price} className="text-base font-fredoka font-bold text-brand-primary block leading-none" />
        </Link>
      </div>
    );
};

export default ProductCard;
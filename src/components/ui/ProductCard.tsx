import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, ProductContentOption, CartItem } from '@/src/types/product.types';
import Price from './Price';

interface ProductCardProps {
  product: Product;
  onAdd: (item: CartItem) => void; // Recibe la función inyectada desde ProductGrid
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  // 1. Estado local para manejar qué peso (pastilla) está seleccionado.
  // Ahora VS Code va a pintar "ProductContentOption" de color normal porque lo usamos acá en el useState
  const defaultPresentation = product.variants[0]?.presentation.name || 'ÚNICO';
  const defaultOption = product.variants[0]?.options[0];
  
  const [selectedOption, setSelectedOption] = useState<ProductContentOption | undefined>(defaultOption);
  
  // 2. Extracción de todas las opciones de peso disponibles para renderizar los botoncitos
  const allAvailableOptions = product.variants.flatMap(v => v.options);

  const displayTag = Array.isArray(product.tags) ? product.tags[0] : product.tags;
  const currentPrice = selectedOption?.price || product.price;
  const productUrl = `/product/${product.slug}`;

  // 3. Función para armar el item y mandarlo al padre
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!selectedOption) return;

    const cartItem: CartItem = {
      ...product,
      quantity: 1,
      selectedContent: selectedOption.content.toString(),
      selectedPresentation: defaultPresentation,
      selectedImage: product.images[0],
      variant_id: selectedOption.variant_id
    };

    onAdd(cartItem); // Pasa la pelota hacia arriba (ProductGrid -> Home -> CartContext)
  };

  return (
    // Agregamos hover:shadow-xl y hover:-translate-y-1 para que "salte" un poco al pasar el mouse
    <div className="flex flex-col bg-white rounded-b-2xl rounded-t-xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full overflow-hidden relative group">
      
      <div className="h-1.5 w-full bg-brand-primary"></div>

      {displayTag && (
        <div className="absolute top-3 left-3 bg-brand-primary text-white px-2 py-0.5 text-[9px] font-fredoka font-bold uppercase tracking-wider z-10 rounded-sm pointer-events-none shadow-sm">
          {displayTag}
        </div>
      )}

      {/* Paddings más ajustados: p-4 -> p-3 */}
      <Link to={productUrl} className="flex flex-col cursor-pointer p-3 pb-0 z-10" title={`Ver ${product.name}`}>
        
        {/* CAMBIO CLAVE: aspect-3/4 -> aspect-square. Esto achica drásticamente la altura. */}
        <div className="relative aspect-square w-full mb-2 bg-white flex items-center justify-center p-2 rounded-xl overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        <div className="flex flex-col mb-2">
          {product.brand && (
            <span className="text-gray-400 font-sans text-[10px] uppercase tracking-wider font-semibold mb-0.5">
              {product.brand}
            </span>
          )}
          {/* Texto ligeramente más compacto */}
          <h3 className="text-[13px] font-fredoka font-semibold text-gray-800 leading-snug line-clamp-2 min-h-9">
            {product.name}
          </h3>
        </div>
      </Link>

      <div className="px-3 pb-3 flex flex-col flex-1 justify-end z-20">
        
        {/* Renderizado de las pastillas de los kilos */}
        {allAvailableOptions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {allAvailableOptions.map((opt, idx) => {
              const isSelected = selectedOption?.content === opt.content;
              const isAvailable = opt.available && opt.stock > 0;

              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isAvailable) setSelectedOption(opt);
                  }}
                  disabled={!isAvailable}
                  // Pastillas más chiquitas
                  className={`px-1.5 py-0.5 text-[10px] font-sans font-bold border rounded transition-colors ${
                    !isAvailable 
                      ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed line-through'
                      : isSelected 
                        ? 'bg-brand-primary border-brand-primary text-white' 
                        : 'bg-white border-gray-300 text-gray-700 hover:border-brand-primary hover:text-brand-primary cursor-pointer'
                  }`}
                >
                  {opt.content}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col items-center mt-auto w-full pt-2 border-t border-gray-100">
          <Price amount={currentPrice} className="text-base lg:text-lg font-fredoka font-black text-brand-primary mb-2 text-center block" />
          
          <button 
            onClick={handleAddToCart}
            disabled={!selectedOption || (!selectedOption.available && selectedOption.stock <= 0)}
            // Botón más comprimido
            className="w-full bg-brand-primary text-white py-2 rounded-full text-[11px] lg:text-xs font-fredoka font-bold uppercase tracking-wider shadow-md hover:bg-orange-600 transition-colors cursor-pointer active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Comprar Ahora
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
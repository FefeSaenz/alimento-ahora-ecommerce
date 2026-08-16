import React, { useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '@/src/types/product.types';
import Modal from './Modal';
import Price from './Price';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onAddToCart }) => {
  // Si no hay producto seleccionado, el Modal base ya maneja el !isOpen, 
  // pero lo mantenemos para evitar errores de hooks abajo.
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // ESTADOS PARA LA NUEVA ESTRUCTURA DE VARIANTES
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  // Efecto para inicializar los estados cuando se abre un producto nuevo
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const initialVariant = product.variants[0];
      setSelectedVariant(initialVariant);
      // Seleccionamos el primer talle por defecto asegurándonos de que sea string
      setSelectedSize(initialVariant.sizes[0]?.size.toString() || '');
      setActiveImageIndex(0);
      setImageError(false);
    }
  }, [product]);

  const currentVariant = selectedVariant || product.variants?.[0];
  if (!currentVariant) return null;

  const mainImageSrc = (currentVariant.color?.image && !imageError) 
    ? currentVariant.color.image 
    : product.images[activeImageIndex];

  return (
    <Modal isOpen={!!product} onClose={onClose} maxWidth="max-w-5xl">
      {/* Botón de cerrar específico del diseño QuickView */}
      <button 
        onClick={onClose}
        // Hover naranja y redondeado perfecto
        className="absolute top-3 right-3 lg:top-5 lg:right-5 z-20 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md text-gray-400 hover:text-brand-primary hover:bg-orange-50 transition-colors cursor-pointer"
      >
        <i className="fa-solid fa-xmark text-lg"></i>
      </button>

      {/* Ajuste de altura máxima equilibrada para notebook (aprox 85vh) */}
      <div className="flex flex-col md:flex-row overflow-hidden h-full max-h-[92vh] md:max-h-[85vh] 2xl:max-h-[92vh]">
        {/* SECCIÓN DE GALERÍA */}
        <div className="w-full md:w-[55%] bg-gray-50 flex flex-col md:flex-row p-2 lg:p-4 gap-4">
          {/* Miniaturas (Desktop) */}
          <div className="hidden md:flex flex-col space-y-3 w-16 lg:w-20 overflow-y-auto no-scrollbar py-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => {
                  setActiveImageIndex(idx);
                  setImageError(true);
                }}
                // Bordes curvos y acento naranja para la seleccionada
                className={`aspect-3/4 rounded-xl overflow-hidden border-2 transition-all bg-white ${
                  activeImageIndex === idx ? 'border-brand-primary shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} className="w-full h-full object-contain p-1" alt={`Thumb ${idx}`} />
              </button>
            ))}
          </div>
          
          {/* Imagen Principal */}
          <div className="flex-1 relative overflow-hidden group bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* object-contain es mejor para bolsas de alimento */}
            <img 
              src={mainImageSrc} 
              alt={product.name}
              onError={() => setImageError(true)} 
              className="w-full h-full object-contain p-4 lg:p-8 transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Indicadores Mobile */}
            <div className="absolute bottom-4 left-0 right-0 md:hidden flex justify-center space-x-2">
               {product.images.map((_, idx) => (
                 <button 
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setImageError(true);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${activeImageIndex === idx ? 'bg-brand-primary' : 'bg-gray-300'}`} 
                 />
               ))}
            </div>
          </div>
        </div>

        {/* SECCIÓN DE INFORMACIÓN: Paddings y gaps ultra comprimidos para 1366x768 */}
        <div className="w-full md:w-[45%] p-6 lg:p-8 2xl:p-10 flex flex-col justify-between overflow-y-auto custom-scrollbar bg-white">
          <div className="space-y-4 lg:space-y-5 2xl:space-y-6">
            <div>
              <p className="text-xs font-fredoka font-bold uppercase tracking-wider text-brand-primary mb-2">{product.category}</p>
              {/* Lilita One para el título del producto */}
              <h2 className="text-2xl lg:text-3xl 2xl:text-4xl font-lilita text-gray-800 tracking-wide leading-tight">{product.name}</h2>
            </div>
            
            {/* Precio y Descuento */}
            <div className="flex items-center gap-3">
              <Price amount={product.price} className="text-2xl lg:text-3xl 2xl:text-4xl font-fredoka font-black text-black" />
              {product.original_price && (
                <span className="text-sm lg:text-base 2xl:text-lg font-fredoka text-gray-400 line-through">${product.original_price.toLocaleString('es-AR')}</span>
              )}
            </div>
            
            {/* Selección de Color / Sabor */}
            {currentVariant.color.name !== 'ÚNICO' && (
              <div className="border-t border-gray-100 pt-4 2xl:pt-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-fredoka font-bold text-gray-500 uppercase tracking-wider">Variante</span>
                  <span className="text-xs font-fredoka font-bold text-brand-primary bg-orange-50 px-3 py-1 rounded-full">
                    {currentVariant.color.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedVariant(variant);
                        // Al cambiar de color, autoseleccionamos el primer talle disponible de ese color
                        setSelectedSize(variant.sizes[0]?.size.toString() || '');
                        setImageError(false);
                      }}
                      // Píldoras redondeadas para las variantes
                      className={`px-4 py-2 2xl:px-5 2xl:py-2.5 border rounded-full text-xs font-fredoka font-semibold uppercase transition-all whitespace-nowrap cursor-pointer ${
                        currentVariant.color.name === variant.color.name 
                          ? 'border-brand-primary bg-brand-primary text-white shadow-md' 
                          : 'border-gray-200 bg-white hover:border-brand-primary hover:text-brand-primary text-gray-600'
                      }`}
                    >
                      {variant.color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selección de Talle / Peso (Basado en la variante activa) */}
            <div className="border-t border-gray-100 pt-4 2xl:pt-5">
              <p className="text-xs font-fredoka font-bold text-gray-500 uppercase tracking-wider mb-3">Seleccionar Opción</p>
              <div className="flex flex-wrap gap-2 2xl:gap-3">
                {currentVariant.sizes.map((sizeObj) => {
                  const sizeStr = sizeObj.size.toString();
                  const isAvailable = sizeObj.available && sizeObj.stock > 0;
                  
                  return (
                    <button
                      key={sizeStr}
                      onClick={() => isAvailable && setSelectedSize(sizeStr)}
                      disabled={!isAvailable}
                      // Botones redondeados suaves para los tamaños
                      className={`px-4 py-2 min-w-[3rem] lg:min-w-[3.5rem] h-10 lg:h-11 2xl:h-12 border rounded-xl flex items-center justify-center text-xs lg:text-sm font-fredoka font-bold transition-all ${
                        !isAvailable 
                          ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60 line-through' 
                          : selectedSize === sizeStr 
                            ? 'bg-black text-white border-black shadow-md' 
                            : 'bg-white border-gray-200 hover:border-black text-gray-800 cursor-pointer'
                      }`}
                    >
                      {sizeStr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Descripción y Detalles */}
            <div className="border-t border-gray-100 pt-4 2xl:pt-5">
              {/* Marca */}
              {product.brand && (
                <div className="flex items-center gap-2 mb-3 2xl:mb-4">
                  <span className="text-xs font-fredoka font-bold text-gray-400 uppercase tracking-wider">Marca:</span>
                  <span className="text-xs font-fredoka font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-md">{product.brand}</span>
                </div>
              )}
              
              {/* Descripción con Fallback y saltos de línea */}
              <div>
                <h4 className="text-xs font-fredoka font-bold text-gray-800 uppercase tracking-wider mb-2">Descripción</h4>
                <p className="text-sm font-fredoka text-gray-500 leading-relaxed whitespace-pre-line line-clamp-3 2xl:line-clamp-none">
                  {product.description || 'Alimento balanceado premium formulado para brindar la mejor nutrición y energía a tu mascota en cada etapa de su vida.'}
                </p>
              </div>
            </div>
          </div>

          {/* Botón de acción con pt ajustado */}
          <div className="pt-6 2xl:pt-8 mt-auto">
            <button
              onClick={() => {
                if (selectedSize) {
                  const newItem: CartItem = {
                    ...product,
                    quantity: 1,
                    selectedSize: selectedSize,
                    selectedColor: currentVariant.color.name,
                    selectedImage: mainImageSrc
                  };
                  onAddToCart(newItem);
                }
              }}
              disabled={!selectedSize}
              // Píldora gigante redondeada con los colores de la marca
              className={`w-full py-4 lg:py-5 text-sm lg:text-base font-fredoka font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-md ${
                selectedSize ? 'bg-brand-primary text-white hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <i className="fa-solid fa-cart-shopping"></i>
              <span>{selectedSize ? 'Añadir al carrito' : 'Seleccioná una opción'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuickViewModal;
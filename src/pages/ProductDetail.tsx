import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Contexts y Utils de ALIMENTO AHORA
import { useApp } from '@/src/context/AppContext';
import { useCart } from '@/src/context/CartContext';
import { Product } from '@/src/types/product.types';

// UI Components
import Price from '@/src/components/ui/Price';
import ProductCarousel from '@/src/components/ui/ProductCarousel';
import Breadcrumbs from '@/src/components/ui/Breadcrumbs';
import Modal from '@/src/components/ui/Modal';

interface ProductDetailContext {
  setSelectedQuickView: (product: Product) => void;
}

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { setSelectedQuickView } = useOutletContext<ProductDetailContext>();
  
  const { allProducts, loading } = useApp();
  const { addToCart, setIsCartOpen } = useCart();

  // 1. BÚSQUEDA DIRECTA
  const product = useMemo(() => {
    // Buscamos el producto directamente en la lista limpia y unificada
    return allProducts.find(p => p.slug === slug || p.id === slug);
  }, [allProducts, slug]);

  // 2. ESTADOS LOCALES (Adaptados a Pet Shop)
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // Funcionará como "Edad/Tamaño" o Variante Principal
  const [selectedSize, setSelectedSize] = useState<string | null>(null);   // Funcionará como "Peso" (Ej: 3kg)
  const [mainImage, setMainImage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  // Estado y Ref para controlar el Slider Mobile
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // 3. INICIALIZAR DATA
  useEffect(() => {
    if (product) {
      if (product.images && product.images.length > 0) {
        setMainImage(product.images[0]);
      } else {
        setMainImage('');
      }
      
      // Seleccionamos la primera variante disponible (Ej: Mini Adulto)
      if (product.variants && product.variants.length > 0) {
        setSelectedColor(product.variants[0].color.name);
      }
      
      setSelectedSize(null);
      setError('');
      setCurrentSlide(0); 
    }
  }, [product]);

  // Lógica de flechas para el Slider Mobile
  const handlePrevSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -sliderRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const handleNextSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: sliderRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  // 4. LÓGICA DE VARIANTES (Adaptadas a Pet Shop)
  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map(v => v.color.name)));
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product?.variants || !selectedColor) return [];
    const variant = product.variants.find(v => v.color.name === selectedColor);
    // Devolvemos los objetos enteros para saber si hay stock
    return variant ? variant.sizes : []; 
  }, [product, selectedColor]);

  // 5. MANEJADOR DEL CARRITO
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setError('Por favor, selecciona el peso y la variante antes de agregar al carrito.');
      return;
    }
    
    if (product) {
      const chosenVariantGroup = product.variants.find(v => v.color.name === selectedColor);
      const chosenSizeObj = chosenVariantGroup?.sizes.find(s => s.size.toString() === selectedSize);
      
      const variantIdentifier = chosenSizeObj?.variant_id;

      const cartItem = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.original_price,
        discount_percentage: product.discount_percentage,
        images: product.images,
        category: product.category,
        subcategory: product.subcategory,
        gender: product.gender,
        tags: product.tags,
        active: product.active,
        rating: product.rating,
        reviews_count: product.reviews_count,
        quantity: 1,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        selectedImage: mainImage || (product.images.length > 0 ? product.images[0] : ''),
        variant_id: variantIdentifier
      };

      addToCart(cartItem); 
      setIsCartOpen(true);
      setError('');
    }
  };

  // 6. ESTADOS DE CARGA Y ERROR
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-lilita text-brand-primary tracking-wide mb-4">Producto no encontrado</h1>
        <p className="text-gray-500 mb-8 font-fredoka font-medium text-sm">El artículo que buscás ya no está disponible o no existe.</p>
        <Link to="/productos" className="bg-brand-primary text-white px-8 py-4 rounded-full text-sm font-fredoka font-bold uppercase tracking-wider hover:bg-orange-600 shadow-md hover:shadow-lg transition-all">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  // 7. RENDERIZADO PRINCIPAL
  return (
    <div className='flex flex-col gap-12 lg:gap-16 pb-16 animate-in fade-in duration-500'>

      {/* --- INYECCIÓN SEO DINÁMICO --- */}
      <Helmet>
        <title>{`ALIMENTO AHORA | ${product.name}`}</title>
        <meta name="description" content={product.description || `Comprá ${product.name} online en ALIMENTO AHORA. Nutrición premium con envío a domicilio.`} />
        
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`ALIMENTO AHORA | ${product.name}`} />
        <meta property="og:description" content={product.description || `Descubrí el mejor alimento balanceado. ${product.name} disponible ahora.`} />
        <meta property="og:image" content={mainImage || (product.images && product.images[0]) || ''} />
        <meta property="og:url" content={window.location.href} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`ALIMENTO AHORA | ${product.name}`} />
        <meta name="twitter:image" content={mainImage || (product.images && product.images[0]) || ''} />
      </Helmet>
      
      <div className="max-w-360 mx-auto px-6 pt-6 w-full">
        
        {/* BREADCRUMBS */}
        <Breadcrumbs 
          className='mb-6'
          items={[
            { label: 'Catálogo', href: '/productos' }, 
            { label: product.category, href: `/category/${product.category.toLowerCase().replace(/\s+/g, '-')}` },
            { label: product.name }
          ]} 
        />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* 1. VISTA MOBILE / TABLET (Slider con Dots y Flechas) */}
          <div className="lg:hidden w-full md:max-w-125 md:mx-auto flex flex-col relative">
            
            {/* Etiqueta de Oferta Superpuesta */}
            {(product.discount_percentage || (product.original_price && product.original_price > product.price)) ? (
              <div className="absolute top-4 left-4 bg-brand-primary text-white px-4 py-1.5 text-[10px] font-fredoka font-bold uppercase tracking-wider z-20 rounded-full pointer-events-none shadow-md">
                {product.discount_percentage ? `-${product.discount_percentage}% OFF` : 'Oferta'}
              </div>
            ) : null}

            {/* Contenedor del Carrusel Native Scroll Snap */}
            <div 
              ref={sliderRef}
              className="flex w-full overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-2xl bg-white border border-gray-100 shadow-sm"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                setCurrentSlide(Math.round(scrollLeft / width));
              }}
            >
              {product.images && product.images.length > 0 ? (
                product.images.map((img: string, idx: number) => (
                  <div 
                    key={idx} 
                    className="w-full shrink-0 snap-center relative aspect-square p-6"
                    onClick={() => {
                      setMainImage(img);
                      setIsGalleryOpen(true);
                    }}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} ${idx + 1}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))
              ) : (
                <div className="w-full shrink-0 snap-center aspect-square flex items-center justify-center text-gray-400 text-sm font-fredoka font-bold tracking-wider">
                  Sin Imagen
                </div>
              )}
            </div>

            {/* CONTROLES: Flechas y Puntos */}
            <div className="flex items-center justify-between w-full mt-4 px-2">
              <button 
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-brand-primary hover:bg-orange-50 transition-colors disabled:opacity-30 disabled:cursor-default"
              >
                <i className="fa-solid fa-chevron-left text-sm"></i>
              </button>

              <div className="flex justify-center items-center gap-2">
                {(product.images && product.images.length > 0 ? product.images : ['placeholder']).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`rounded-full transition-all duration-300 ${
                      currentSlide === idx 
                        ? 'w-6 h-2 bg-brand-primary' 
                        : 'w-2 h-2 bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={handleNextSlide}
                disabled={!product.images || currentSlide === product.images.length - 1 || product.images.length === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-brand-primary hover:bg-orange-50 transition-colors disabled:opacity-30 disabled:cursor-default"
              >
                <i className="fa-solid fa-chevron-right text-sm"></i>
              </button>
            </div>
          </div>

          {/* 2. VISTA DESKTOP (Miniaturas + Foto Gigante) */}
          {/* CORRECCIÓN: Agregamos items-start para que la foto no se centre verticalmente si la columna derecha crece */}
          <div className="hidden lg:flex w-full lg:w-1/2 lg:max-w-120 xl:max-w-none flex-row gap-6 items-start">
            
            {/* Miniaturas (Verticales) */}
            {product.images && product.images.length > 0 && (
              <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar w-24 shrink-0 pb-2 pr-1">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setMainImage(img)}
                    className={`w-full aspect-square shrink-0 transition-all cursor-pointer rounded-xl flex items-center justify-center bg-white group overflow-hidden border-2 ${
                      mainImage === img 
                        ? 'border-brand-primary shadow-sm' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} thumbnail ${idx + 1}`} 
                      className="block w-full h-full object-contain p-2 transition-transform duration-300 scale-[1.01] group-hover:scale-110" 
                    />
                  </button>
                ))}
              </div> 
            )}

            {/* Imagen Principal Desktop */}
            <div 
              onClick={() => mainImage && setIsGalleryOpen(true)}
              className="flex-1 min-h-125 xl:min-h-150 bg-white border border-gray-100 rounded-3xl overflow-hidden relative group flex shadow-sm items-center justify-center py-4 cursor-zoom-in"
            >
              {(product.discount_percentage || (product.original_price && product.original_price > product.price)) ? (
                <div className="absolute top-6 left-6 bg-brand-primary text-white px-4 py-2 text-xs font-fredoka font-bold uppercase tracking-wider z-20 rounded-full pointer-events-none shadow-md">
                  {product.discount_percentage ? `-${product.discount_percentage}% OFF` : 'Oferta'}
                </div>
              ) : null}
              
              {/* Icono de Lupa flotante (Aparece en hover) */}
              <div className="absolute top-6 right-6 w-10 h-10 bg-white/80 backdrop-blur-sm text-brand-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-sm pointer-events-none">
                <i className="fa-solid fa-magnifying-glass-plus"></i>
              </div>

              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  className="w-full h-full max-h-[90%] object-contain p-2 transition-transform duration-700 group-hover:scale-105 block"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-fredoka font-bold uppercase tracking-widest">
                  Sin Imagen
                </div>
              )}
            </div>
            
          </div>

          {/* 3. INFO Y COMPRA (Columna Derecha / Abajo) */}
          <div className="w-full lg:w-[45%] flex flex-col pt-2 lg:pt-4">
            
            {/* Categoría / Tag */}
            <span className="text-xs font-fredoka font-bold text-brand-primary uppercase tracking-wider mb-2">
              {product.category}
            </span>

            {/* Título */}
            <h1 className="text-3xl md:text-5xl font-lilita text-gray-800 tracking-wide mb-3 leading-tight">
              {product.name}
            </h1>

            {/* SKU y Rating */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-[11px] font-fredoka font-bold uppercase text-gray-400 bg-gray-50 w-max px-3 py-1 rounded-md">
              {product.base_sku && <span>SKU: {product.base_sku}</span>}
            </div>

            {/* Precio */}
            <div className="mb-8 flex items-center gap-4">
                <Price amount={product.price} className="text-3xl lg:text-4xl font-fredoka font-black text-black" />
                {product.original_price && (
                  <span className="text-lg font-fredoka text-gray-400 line-through">${product.original_price.toLocaleString('es-AR')}</span>
                )}
            </div>

            {/* Selector de Opción Principal (Ej: Edad, Tamaño de Mordida) */}
            {availableColors.length > 0 && availableColors[0] !== 'ÚNICO' && (
              <div className="mb-6 border-b border-gray-100 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-fredoka font-bold uppercase tracking-wider text-gray-500">Variante</span>
                  <span className="text-[10px] font-fredoka font-bold uppercase tracking-wider text-brand-primary bg-orange-50 px-3 py-1 rounded-full">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedSize(null);
                        setError('');
                        
                        const variant = product.variants?.find(v => v.color.name === color);
                        if (variant?.color.image) {
                          setMainImage(variant.color.image);
                        }
                      }}
                      className={`px-4 py-2 border rounded-full text-xs font-fredoka font-bold transition-all whitespace-nowrap cursor-pointer shadow-sm ${
                        selectedColor === color 
                          ? 'border-brand-primary bg-brand-primary text-white shadow-md' 
                          : 'border-gray-200 bg-white hover:border-brand-primary hover:text-brand-primary text-gray-600'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de Pesos (Bolsas) */}
            {availableSizes.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-fredoka font-bold uppercase tracking-wider text-gray-500">Seleccionar Peso</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map(sizeObj => (
                    <button
                      key={sizeObj.size}
                      disabled={!sizeObj.available}
                      onClick={() => {
                        setSelectedSize(sizeObj.size.toString());
                        setError('');
                      }}
                      className={`px-4 min-w-14 h-12 border rounded-xl flex items-center justify-center text-sm font-fredoka font-bold transition-all shadow-sm ${
                        !sizeObj.available 
                          ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60 line-through shadow-none' 
                          : selectedSize === sizeObj.size.toString() 
                            ? 'bg-black text-white border-black shadow-md' 
                            : 'bg-white border-gray-200 hover:border-brand-primary hover:text-brand-primary text-gray-700 cursor-pointer'
                      }`}
                    >
                      {sizeObj.size}
                    </button>
                  ))}
                </div>
                
                {/* CORRECCIÓN DE LAYOUT SHIFT: 
                    En vez de inyectar el div de la nada (y empujar todo), dejamos un espacio 
                    invisible (min-h-[52px]) que siempre está ahí, y el mensaje solo se dibuja 
                    adentro cuando hace falta. */}
                <div className="min-h-13 mt-4">
                  {error && (
                    <div className="bg-red-50 text-red-500 text-xs font-fredoka font-bold tracking-wider p-3 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                      <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart}
              // CORRECCIÓN DE LAYOUT SHIFT: Le sacamos el mb-8 al botón (lo empujaba el gap de arriba en realidad)
              className="w-full bg-brand-primary text-white py-4 md:py-5 rounded-full text-sm md:text-base font-fredoka font-bold uppercase tracking-wider hover:bg-orange-600 hover:shadow-lg transition-all active:scale-[0.98] mb-8 cursor-pointer shadow-md flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-cart-plus"></i> Agregar al Carrito
            </button>

            {/* Detalles Tipo Acordeón Fijo */}
            <div className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm">
              <div className="p-6 md:p-8 space-y-6">
                
                <div>
                  <h3 className="text-sm font-fredoka font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-align-left text-brand-primary"></i> Descripción
                  </h3>
                  <p className="text-sm font-fredoka text-gray-500 leading-relaxed whitespace-pre-line">
                    {product.description || 'Alimento balanceado premium formulado para brindar la mejor nutrición y energía a tu mascota en cada etapa de su vida.'}
                  </p>
                </div>
                
                {(product.brand || product.material || product.category || product.subcategory || product.gender) && (
                  <div className="pt-6 border-t border-gray-50">
                    <h3 className="text-sm font-fredoka font-bold uppercase tracking-wider text-gray-800 mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-list text-brand-primary"></i> Especificaciones
                    </h3>
                    
                    <ul className="space-y-3">
                      {product.brand && (
                        <li className="flex items-center gap-4">
                          <span className="text-xs font-fredoka font-bold uppercase tracking-wider text-gray-400 w-20">Marca:</span> 
                          <span className="text-sm font-fredoka font-medium text-gray-800">{product.brand}</span>
                        </li>
                      )}
                      {product.category && (
                        <li className="flex items-center gap-4">
                          <span className="text-xs font-fredoka font-bold uppercase tracking-wider text-gray-400 w-20">Categoría:</span> 
                          <span className="text-sm font-fredoka font-medium text-gray-800">{product.category}</span>
                        </li>
                      )}
                      {product.gender && (
                        <li className="flex items-center gap-4">
                          <span className="text-xs font-fredoka font-bold uppercase tracking-wider text-gray-400 w-20">Especie:</span> 
                          <span className="text-sm font-fredoka font-medium text-gray-800">{product.gender}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Carrusel de Productos Relacionados */}
      <div className="mt-8 border-t border-gray-100 pt-8">
        <ProductCarousel 
          title="Te puede interesar"
          variant='slim'
          products={allProducts.filter(p => p.id !== product.id).slice(0, 8)} 
          onAdd={setSelectedQuickView}
        />
      </div>

      {/* --- MODAL DE GALERÍA (ZOOM) --- */}
      <Modal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} maxWidth="max-w-5xl">
        <div className="relative w-full h-[85vh] bg-white rounded-3xl flex items-center justify-center p-4">
          <button 
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500 hover:text-brand-primary hover:bg-orange-50 transition-colors cursor-pointer shadow-sm"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          
          <img 
            src={mainImage} 
            alt={product.name} 
            className="w-full h-full object-contain"
          />
        </div>
      </Modal>

    </div>
  );
};

export default ProductDetail;
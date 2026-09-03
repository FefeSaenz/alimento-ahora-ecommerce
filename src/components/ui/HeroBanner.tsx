import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Banner } from '@/src/types/api';

interface HeroBannerProps {
  banners: Banner[];
  onCtaClick: (url: string) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ banners, onCtaClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);

  // --- 1. LÓGICA DE NAVEGACIÓN ---
  const goToSlide = useCallback((index: number) => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ 
        left: index * sliderRef.current.clientWidth, 
        behavior: 'smooth' 
      });
      setCurrentIndex(index);
    }
  }, []);

  const nextSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % banners.length;
    goToSlide(nextIndex);
  }, [currentIndex, banners.length, goToSlide]);

  const prevSlide = useCallback(() => {
    const prevIndex = (currentIndex - 1 + banners.length) % banners.length;
    goToSlide(prevIndex);
  }, [currentIndex, banners.length, goToSlide]);

  // --- 2. SINCRONIZACIÓN DE SCROLL NATIVO ---
  const handleScroll = () => {
    if (sliderRef.current) {
      const index = Math.round(sliderRef.current.scrollLeft / sliderRef.current.clientWidth);
      if (index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  };

  // --- 3. EVENTOS DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (!banners || banners.length === 0) return null;

  return (
    <section 
      className="relative h-[70vh] lg:h-[80vh] w-full overflow-hidden bg-black group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        ref={sliderRef}
        onScroll={handleScroll}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex w-full h-full overflow-y-hidden overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          
          return (
            <div key={banner.id} className="w-full h-full shrink-0 snap-center relative flex items-center justify-center bg-black">
              
              {/* OVERLAY DEGRADADO */}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none"></div>

              <img 
                src={banner.image} 
                alt={banner.title}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className={`w-full h-full object-cover object-center transition-transform duration-10000 ease-out ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              />

              {/* CONTENEDOR DE TEXTO (Ajuste de márgenes para bajarlo) */}
              <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 z-20 pointer-events-none pb-10 md:pb-16">
                <h1 className={`text-3xl md:text-5xl lg:text-6xl font-lilita text-white drop-shadow-2xl leading-tight mb-3 max-w-3xl transition-all duration-700 ease-out ${
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}>
                  {banner.title}
                </h1>
                
                <div className={`transition-all duration-700 delay-150 ease-out ${
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}>
                  <button 
                    onClick={() => onCtaClick(banner.cta?.url || '/productos')}
                    className="pointer-events-auto bg-brand-primary text-white px-8 py-3 md:px-10 md:py-3.5 text-[12px] md:text-sm font-fredoka font-bold uppercase tracking-widest rounded-full shadow-lg hover:bg-orange-600 hover:shadow-orange-500/30 transition-all transform active:scale-95 cursor-pointer"
                  >
                    {banner.cta.text || 'Explorar Colección'}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
      
      {/* INDICADORES (DOTS) - Pegados más al límite inferior */}
      <div className="absolute bottom-0 md:bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
        {banners.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group py-4 px-1 cursor-pointer" 
              aria-label={`Ir al banner ${index + 1}`}
            >
              <div className={`h-1.5 rounded-full relative overflow-hidden transition-all duration-500 ${
                isActive ? 'w-10 md:w-12 bg-white/40' : 'w-3 md:w-4 bg-white/30 group-hover:bg-white/60'
              }`}>
                {isActive && (
                  <div 
                    key={`progress-${currentIndex}`} 
                    className="absolute top-0 left-0 w-full h-full bg-white origin-left rounded-full"
                    style={{ 
                      animation: 'fill-progress-transform 5s linear forwards',
                      animationPlayState: isPaused ? 'paused' : 'running'
                    }} 
                    onAnimationEnd={() => {
                      if (!isPaused) nextSlide();
                    }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* FLECHAS LATERALES */}
      <button 
        onClick={prevSlide}
        className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
      >
        <i className="fa-solid fa-chevron-left text-lg"></i>
      </button>
      <button 
        onClick={nextSlide}
        className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
      >
        <i className="fa-solid fa-chevron-right text-lg"></i>
      </button>
    </section>
  );
};

export default HeroBanner;
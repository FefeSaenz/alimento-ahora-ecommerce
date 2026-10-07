import React from 'react';

/**
 * Placeholder de carga de HeroBanner.
 * Reserva la misma altura que el banner real (70vh / 80vh en desktop) y la posición del
 * título, el CTA y los indicadores, para evitar Layout Shift cuando llega la API.
 */
const HeroBannerSkeleton: React.FC = () => (
  <section
    className="relative h-[70vh] lg:h-[80vh] w-full overflow-hidden bg-gray-200 animate-pulse"
    role="status"
    aria-busy="true"
    aria-label="Cargando banner"
  >
    <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-10 md:pb-16">
      <div className="h-9 md:h-15 lg:h-19 w-3/4 max-w-3xl mb-3 rounded-xl bg-gray-300"></div>
      <div className="h-11 md:h-12 w-44 md:w-52 rounded-full bg-gray-300"></div>
    </div>

    <div className="absolute bottom-0 md:bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="py-4 px-1">
          <div className="h-1.5 w-3 md:w-4 rounded-full bg-gray-300"></div>
        </div>
      ))}
    </div>
  </section>
);

export default HeroBannerSkeleton;

import React from 'react';

/**
 * Placeholder de carga de la vista ProductDetail.
 * Replica la estructura de la página real (breadcrumbs, galería mobile / miniaturas + foto desktop,
 * y columna de info: categoría, título, SKU, precio, selectores, CTA y detalles) con las mismas
 * clases flex/grid, para evitar Layout Shift cuando llegan los datos de la API.
 */
const ProductDetailSkeleton: React.FC = () => (
  <div
    className="flex flex-col gap-12 lg:gap-16 pb-16 animate-pulse"
    role="status"
    aria-busy="true"
    aria-label="Cargando producto"
  >
    <div className="max-w-360 mx-auto px-6 pt-6 w-full">

      {/* Breadcrumbs */}
      <div className="h-4 w-56 mb-6 rounded bg-gray-200"></div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

        {/* Galería mobile / tablet */}
        <div className="lg:hidden w-full md:max-w-125 md:mx-auto">
          <div className="w-full aspect-square rounded-2xl bg-gray-200"></div>
        </div>

        {/* Galería desktop: miniaturas + foto principal */}
        <div className="hidden lg:flex w-full lg:w-1/2 lg:max-w-120 xl:max-w-none flex-row gap-6 items-start">
          <div className="flex flex-col gap-3 w-24 shrink-0">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-full aspect-square rounded-xl bg-gray-200"></div>
            ))}
          </div>
          <div className="flex-1 min-h-125 xl:min-h-150 rounded-3xl bg-gray-200"></div>
        </div>

        {/* Info y compra */}
        <div className="w-full lg:w-[45%] flex flex-col pt-2 lg:pt-4">
          <div className="h-4 w-24 mb-2 rounded bg-gray-200"></div>
          <div className="h-9 md:h-14 w-3/4 mb-3 rounded-lg bg-gray-200"></div>
          <div className="h-6 w-32 mb-6 rounded-md bg-gray-200"></div>
          <div className="h-9 lg:h-10 w-40 mb-8 rounded-lg bg-gray-200"></div>

          {/* Variante */}
          <div className="mb-6 border-b border-gray-100 pb-6">
            <div className="h-4 w-20 mb-4 rounded bg-gray-200"></div>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 w-28 rounded-xl bg-gray-200"></div>
              ))}
            </div>
          </div>

          {/* Pesos */}
          <div className="mb-8">
            <div className="h-4 w-32 mb-4 rounded bg-gray-200"></div>
            <div className="flex flex-wrap gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 w-20 rounded-xl bg-gray-200"></div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="w-full h-14 md:h-16 mb-8 rounded-full bg-gray-200"></div>

          {/* Detalles */}
          <div className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm">
            <div className="p-6 md:p-8 space-y-3">
              <div className="h-4 w-28 mb-4 rounded bg-gray-200"></div>
              <div className="h-3 w-full rounded bg-gray-200"></div>
              <div className="h-3 w-full rounded bg-gray-200"></div>
              <div className="h-3 w-2/3 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
);

export default ProductDetailSkeleton;

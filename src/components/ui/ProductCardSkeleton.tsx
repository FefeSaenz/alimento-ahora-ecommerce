import React from 'react';

/**
 * Placeholder de carga de ProductCard.
 * Replica su estructura y dimensiones (barra superior, imagen cuadrada, marca/título,
 * pastillas de peso y bloque precio/botón) para que, al llegar los datos de la API,
 * la tarjeta real ocupe el mismo espacio y no haya Layout Shift (CLS).
 */
const ProductCardSkeleton: React.FC = () => (
  <div
    className="flex flex-col bg-white rounded-b-2xl rounded-t-xl border border-gray-200 shadow-sm w-full overflow-hidden relative animate-pulse"
    aria-hidden="true"
  >
    <div className="h-1.5 w-full bg-gray-200"></div>

    <div className="flex flex-col p-3 pb-0">
      <div className="aspect-square w-full mb-2 rounded-xl bg-gray-200"></div>

      <div className="flex flex-col mb-2">
        <div className="h-3.5 w-1/3 mb-0.5 rounded bg-gray-200"></div>
        <div className="min-h-9 flex flex-col justify-center gap-1.5">
          <div className="h-3 w-full rounded bg-gray-200"></div>
          <div className="h-3 w-2/3 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>

    <div className="px-3 pb-3 flex flex-col flex-1 justify-end">
      <div className="flex flex-wrap gap-1 mb-3">
        <div className="h-5.5 w-10 rounded bg-gray-200"></div>
        <div className="h-5.5 w-10 rounded bg-gray-200"></div>
      </div>

      <div className="flex flex-col items-center mt-auto w-full pt-2 border-t border-gray-100">
        <div className="h-6 lg:h-7 w-24 mb-2 rounded bg-gray-200"></div>
        <div className="h-8 w-full rounded-full bg-gray-200"></div>
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;

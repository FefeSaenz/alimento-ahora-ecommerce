import React from 'react';

interface FilterBarProps {
  title: React.ReactNode;
  sortBy: string;
  onSortChange: (value: string) => void;
  onOpenMobileFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  title,
  sortBy, 
  onSortChange,
  onOpenMobileFilters
}) => {
  return (
    // Contenedor principal: Sticky abajo del Header (top-20)
    <div id="shop-section" className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 w-full shadow-sm">
      
      <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between lg:max-w-360 lg:mx-auto lg:px-6">
      
        {/* 1. TÍTULO (Alineado a la izquierda siempre) */}
        {/* Agregamos px-6 en mobile para que respete el margen de la grilla de productos */}
        <div className="flex items-center justify-start w-full lg:w-auto py-4 lg:py-5 px-6 lg:px-0 border-b border-gray-100 lg:border-none">
          <h1 className="text-2xl lg:text-4xl font-lilita text-brand-primary tracking-wide leading-none">
              {title}
          </h1>
        </div>

        {/* CONTENEDOR DE BOTONES (Fila en mobile: 50% Filtrar / 50% Ordenar) */}
        <div className="flex flex-row w-full lg:w-auto bg-gray-50 lg:bg-transparent">
            {/* 2. BOTÓN FILTRAR (Solo Mobile/Tablet) */}
            <button 
              onClick={onOpenMobileFilters}
              className="flex lg:hidden flex-1 py-4 border-r border-gray-200 items-center justify-center space-x-2 text-xs font-fredoka font-bold text-gray-600 uppercase tracking-wider active:bg-orange-50 active:text-brand-primary transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-sliders text-brand-primary"></i>
              <span>Filtrar</span>
            </button>
            
            {/* 3. ORDENAR */}
            <div className="flex-1 lg:flex-none flex items-center justify-center lg:justify-end py-4 lg:py-0 space-x-2 lg:space-x-3">
              {/* Texto visible en desktop */}
              <span className="hidden lg:inline text-xs font-fredoka font-bold uppercase text-gray-500 tracking-wider">
                Ordenar por:
              </span>
              
              <div className="flex items-center space-x-2 lg:bg-white lg:border-2 lg:border-gray-100 lg:rounded-full lg:px-4 lg:py-1.5 transition-all focus-within:border-brand-primary">
                <i className="fa-solid fa-arrow-down-short-wide lg:hidden text-brand-primary"></i>
                <select 
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="text-xs font-fredoka font-bold text-gray-700 uppercase tracking-wider outline-none bg-transparent cursor-pointer text-center lg:text-left focus:text-brand-primary"
                >
                  <option value="default">Recomendados</option>
                  <option value="price-low">Menor Precio</option>
                  <option value="price-high">Mayor Precio</option>
                </select>
              </div>
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default FilterBar;
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '@/src/context/AppContext';

interface FilterSidebarProps {
  activeFilters: { 
    weightFilter: string | null; 
    ageSizeFilter: string | null; 
    priceFilter: string | null;
    searchTerm?: string | null;
    brandFilter?: string | null;
  };
  categories?: string[];               
  activeCategory?: string;             
  brands?: string[];             
  activeBrand?: string | null;   
  onCategoryChange?: (c: string) => void; 
  onFilterChange: (key: string, value: string | null) => void;
  onClearFilters: () => void;
  onCloseMobile?: () => void;
}

// Función para formatear el input con puntitos de miles
const formatPriceInput = (value: string) => {
  const raw = value.replace(/\D/g, ''); 
  if (!raw) return '';
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
};

// HELPER NUEVO: Agrega o quita valores acumulables separados por coma
const toggleFilter = (currentValue: string | null | undefined, newValue: string) => {
  const list = currentValue ? currentValue.split(',') : [];
  if (list.includes(newValue)) {
    const filtered = list.filter(v => v !== newValue);
    return filtered.length > 0 ? filtered.join(',') : null;
  }
  return [...list, newValue].join(',');
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  activeFilters, 
  categories,
  activeCategory,
  brands,
  activeBrand,
  onCategoryChange,
  onFilterChange, 
  onClearFilters, 
  onCloseMobile 
}) => {
  const { allProducts } = useApp();
  
  // --- ESTADOS LOCALES PARA LOS INPUTS DE PRECIO ---
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    if (activeFilters.priceFilter) {
      const [min, max] = activeFilters.priceFilter.split('-');
      setMinPrice(min ? formatPriceInput(min) : '');
      setMaxPrice(max ? formatPriceInput(max) : '');
    } else {
      setMinPrice('');
      setMaxPrice('');
    }
  }, [activeFilters.priceFilter]);

  const handleApplyPrice = () => {
    const cleanMin = minPrice.replace(/\./g, '');
    const cleanMax = maxPrice.replace(/\./g, '');

    if (!cleanMin && !cleanMax) {
      onFilterChange('precio', null);
    } else {
      onFilterChange('precio', `${cleanMin}-${cleanMax}`);
    }
  };

  // Pesos 
  const weights = useMemo(() => {
    const allSizes = allProducts.flatMap(p => 
      p.variants?.flatMap(v => v.sizes.map(s => s.size.toString())) || []
    );
    
    // Eliminamos el talle 'U' (Único) de la lista de filtros de peso
    const filteredSizes = allSizes.filter(s => s.toUpperCase() !== 'U');

    const unique = Array.from(new Set(filteredSizes));
    return unique.sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.-]/g, ''));
      const numB = parseFloat(b.replace(/[^\d.-]/g, ''));
      
      if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
      }
      return a.localeCompare(b);
    });
  }, [allProducts]);

  // Edades/Tamaños
  const ageSizes = useMemo(() => {
    const rawColors = allProducts.flatMap(p => p.variants?.map(v => v.color.name) || []);
    
    // Normalizamos: Primera letra de cada palabra en mayúscula para evitar duplicados ("Mini adult" vs "Mini Adult")
    // y manejamos "ÚNICO" para que quede prolijo como "Único".
    const normalized = rawColors.map(name => {
      // Caso especial manual para Único
      if (name.toLowerCase() === 'único' || name.toLowerCase() === 'unico') {
        return 'Único';
      }
      
      // Separamos por espacios, ponemos la 1ra letra en mayúscula y el resto en minúscula
      return name.trim().split(/\s+/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    });

    // Devolvemos los únicos, sin ocultar ninguno.
    return Array.from(new Set(normalized.filter(c => c !== ''))); 
  }, [allProducts]);

  const getPriceLabel = (filterStr: string) => {
    const [min, max] = filterStr.split('-');
    if (min && max) return `$${min} - $${max}`;
    if (min) return `Más de $${min}`;
    if (max) return `Hasta $${max}`;
    return '';
  };

  const hasActiveFilters = 
    !!(activeFilters.weightFilter || 
    activeFilters.ageSizeFilter || 
    activeFilters.priceFilter || 
    activeFilters.searchTerm ||
    activeFilters.brandFilter ||
    (activeCategory && activeCategory !== 'Todos'));

  const handleClearAll = () => {
    onClearFilters();
    if (activeCategory && activeCategory !== 'Todos' && onCategoryChange) {
      onCategoryChange('Todos');
    }
  };

  const activeBrandsArray = activeFilters.brandFilter ? activeFilters.brandFilter.split(',') : [];
  const activeWeightsArray = activeFilters.weightFilter ? activeFilters.weightFilter.split(',') : [];
  const activeAgeSizesArray = activeFilters.ageSizeFilter ? activeFilters.ageSizeFilter.split(',') : [];

  return (
    <div className={`space-y-6 md:space-y-8 relative ${!hasActiveFilters ? 'pt-6 lg:pt-0' : ''}`}>
      
      {/* SECCIÓN FILTROS ACTIVOS (CHIPS) */}
      {hasActiveFilters && (
        <div className="sticky top-0 z-30 bg-white pt-6 lg:pt-0 pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 lg:-mr-4 lg:pr-4 border-b border-gray-100 lg:border-none shadow-sm lg:shadow-none mb-6">
          <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-fredoka font-bold uppercase tracking-wider text-brand-primary">Filtros Activos</h3>
              <button 
                onClick={handleClearAll}
                className="text-[10px] font-fredoka font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>✕</span> Limpiar
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-30 overflow-y-auto custom-scrollbar">
              
              {activeCategory && activeCategory !== 'Todos' && (
                <button 
                  onClick={() => onCategoryChange && onCategoryChange('Todos')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-xs font-fredoka font-medium transition-colors rounded-full group cursor-pointer shadow-sm"
                >
                  Categoría: {activeCategory}
                  <span className="text-gray-400 group-hover:text-red-500">✕</span>
                </button>
              )}

              {activeFilters.searchTerm && (
                <button 
                  onClick={() => onFilterChange('search', null)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-xs font-fredoka font-medium transition-colors rounded-full group cursor-pointer shadow-sm"
                >
                  Búsqueda: {activeFilters.searchTerm}
                  <span className="text-gray-400 group-hover:text-red-500">✕</span>
                </button>
              )}

              {activeBrandsArray.map(brand => (
                <button 
                  key={`chip-brand-${brand}`}
                  onClick={() => onFilterChange('marca', toggleFilter(activeFilters.brandFilter, brand))}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-xs font-fredoka font-medium transition-colors rounded-full group cursor-pointer shadow-sm"
                >
                  Marca: {brand}
                  <span className="text-gray-400 group-hover:text-red-500">✕</span>
                </button>
              ))}
              
              {activeWeightsArray.map(weight => (
                <button 
                  key={`chip-weight-${weight}`}
                  onClick={() => onFilterChange('peso', toggleFilter(activeFilters.weightFilter, weight))}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-xs font-fredoka font-medium transition-colors rounded-full group cursor-pointer shadow-sm"
                >
                  Peso: {weight}
                  <span className="text-gray-400 group-hover:text-red-500">✕</span>
                </button>
              ))}
              
              {activeAgeSizesArray.map(ageSize => (
                <button 
                  key={`chip-ageSize-${ageSize}`}
                  onClick={() => onFilterChange('edad_tamano', toggleFilter(activeFilters.ageSizeFilter, ageSize))} 
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-xs font-fredoka font-medium transition-colors rounded-full group cursor-pointer shadow-sm"
                >
                  {ageSize}
                  <span className="text-gray-400 group-hover:text-red-500">✕</span>
                </button>
              ))}
              
              {activeFilters.priceFilter && (
                <button 
                  onClick={() => onFilterChange('precio', null)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-xs font-fredoka font-medium transition-colors rounded-full group cursor-pointer shadow-sm"
                >
                  Precio: {getPriceLabel(activeFilters.priceFilter)}
                  <span className="text-gray-400 group-hover:text-red-500">✕</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. SECCIÓN CATEGORÍAS */}
      {categories && categories.length > 0 && (
        <div>
          <h3 className="text-sm font-fredoka font-bold uppercase tracking-wider mb-4 text-gray-500">Categorías</h3>
          <div className="flex flex-col items-start gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange && onCategoryChange(cat)}
                className={`text-sm font-fredoka transition-colors cursor-pointer text-left flex items-center group ${
                  activeCategory === cat ? 'text-brand-primary font-bold' : 'text-gray-600 font-medium hover:text-brand-primary'
                }`}
              >
                {/* Indicador de categoría seleccionada */}
                <span className={`w-1.5 h-1.5 rounded-full mr-2 transition-all duration-300 ${activeCategory === cat ? 'bg-brand-primary' : 'bg-transparent group-hover:bg-orange-200'}`}></span>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. SECCIÓN MARCAS */}
      {brands && brands.length > 0 && (
        <div>
          <h3 className="text-sm font-fredoka font-bold uppercase tracking-wider mb-4 text-gray-500 border-t border-gray-100 pt-6">Marcas</h3>
          <div className="flex flex-col items-start gap-3">
            {brands.map((brand) => {
              const isActive = activeBrandsArray.includes(brand);
              return (
                <button
                  key={brand}
                  onClick={() => onFilterChange('marca', toggleFilter(activeFilters.brandFilter, brand))}
                  className={`text-sm font-fredoka transition-colors cursor-pointer text-left flex items-center gap-2 group ${
                    isActive ? 'text-brand-primary font-bold' : 'text-gray-600 font-medium hover:text-brand-primary'
                  }`}
                >
                  {/* Checkbox visual redondeado */}
                  <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors ${isActive ? 'bg-brand-primary border-brand-primary' : 'border-gray-300 group-hover:border-brand-primary'}`}>
                      {isActive && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                  </div>
                  {brand}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SECCIÓN PESO */}
      {weights && weights.length > 0 && (
          <div>
            <h3 className="text-sm font-fredoka font-bold uppercase tracking-wider mb-4 text-gray-500 border-t border-gray-100 pt-6">Peso</h3>
            <div className="flex flex-wrap gap-2.5">
              {weights.map((weight) => {
                const isActive = activeWeightsArray.includes(weight);
                return (
                  <button 
                    key={weight} 
                    onClick={() => onFilterChange('peso', toggleFilter(activeFilters.weightFilter, weight))} 
                    className={`min-w-12 px-3 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-fredoka font-bold transition-all cursor-pointer ${isActive ? 'bg-brand-primary text-white border-brand-primary shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary'}`}
                  >
                    {weight}
                  </button>
                );
              })}
            </div>
          </div>
      )}

      {/* 4. SECCIÓN EDAD/TAMAÑO */}
      {ageSizes && ageSizes.length > 0 && (
          <div>
            <h3 className="text-sm font-fredoka font-bold uppercase tracking-wider mb-4 text-gray-500 border-t border-gray-100 pt-6">Edad y Tamaño</h3>
            <div className="flex flex-col items-start gap-3">
              {ageSizes.map((ageSize) => {
                const isActive = activeAgeSizesArray.includes(ageSize);
                return (
                  <button 
                    key={ageSize} 
                    onClick={() => onFilterChange('edad_tamano', toggleFilter(activeFilters.ageSizeFilter, ageSize))}
                    className={`text-sm font-fredoka transition-colors cursor-pointer text-left flex items-center gap-2 group ${
                        isActive ? 'text-brand-primary font-bold' : 'text-gray-600 font-medium hover:text-brand-primary'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors ${isActive ? 'bg-brand-primary border-brand-primary' : 'border-gray-300 group-hover:border-brand-primary'}`}>
                        {isActive && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                    </div>
                    <span>{ageSize}</span>
                  </button>
                );
              })}
            </div>
          </div>
      )}

      {/* 5. SECCIÓN PRECIO (ÚLTIMA) */}
      <div>
        <h3 className="text-sm font-fredoka font-bold uppercase tracking-wider mb-4 text-gray-500 border-t border-gray-100 pt-6">Precio</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-fredoka pointer-events-none">$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Mínimo"
              value={minPrice}
              onChange={(e) => setMinPrice(formatPriceInput(e.target.value))}
              className="w-full border-2 border-gray-100 bg-gray-50 pl-7 pr-3 py-2.5 text-[16px] md:text-sm font-fredoka text-right focus:outline-none focus:border-brand-primary focus:bg-white transition-colors rounded-xl placeholder:text-gray-400"
            />
          </div>
          <span className="text-gray-400 text-xs font-fredoka font-bold">a</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-fredoka pointer-events-none">$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Máximo"
              value={maxPrice}
              onChange={(e) => setMaxPrice(formatPriceInput(e.target.value))}
              className="w-full border-2 border-gray-100 bg-gray-50 pl-7 pr-3 py-2.5 text-[16px] md:text-sm font-fredoka text-right focus:outline-none focus:border-brand-primary focus:bg-white transition-colors rounded-xl placeholder:text-gray-400"
            />
          </div>
        </div>
        <button
          onClick={handleApplyPrice}
          className="w-full bg-brand-primary rounded-full text-white py-3 px-4 text-xs font-fredoka font-bold uppercase tracking-wider hover:bg-orange-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
        >
          Aplicar Rango
        </button>
      </div>

    </div>
  );
};

export default FilterSidebar;
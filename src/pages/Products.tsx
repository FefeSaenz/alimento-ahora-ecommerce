import React, { useMemo, useEffect, useState } from 'react';
import { useSearchParams, useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Context & Hooks
import { useApp } from '@/src/context/AppContext';
import { useProductFilters } from '@/src/hooks/useProductFilters';
import { Product } from '@/src/types/product.types';
import { useQuickView } from '@/src/hooks/useQuickView';
import { useUnifiedProducts } from '@/src/hooks/useUnifiedProducts'; 

// UI Components
import ProductGrid from '@/src/components/layout/ProductGrid';
import FilterSidebar from '@/src/components/layout/FilterSidebar';
import FilterBar from '@/src/components/ui/FilterBar';
import Breadcrumbs from '@/src/components/ui/Breadcrumbs';

interface ProductsContext {
    setSelectedQuickView: (product: Product | null) => void;
}

const Products: React.FC = () => {
    const { loading } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const { setSelectedQuickView } = useOutletContext<ProductsContext>();

    const { handleQuickView } = useQuickView(setSelectedQuickView);
    
    const { unifiedProducts } = useUnifiedProducts(); 

    const { category: paramCategory } = useParams<{ category: string }>();

    const location = useLocation();
    const isOffersRoute = location.pathname === '/offers';
    const navigate = useNavigate();

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // 1. COMBINACIÓN Y NORMALIZACIÓN DE DATA
    const combinedProducts = useMemo(() => {
        if (isOffersRoute) {
            return unifiedProducts.filter(p => p.discount_percentage && p.discount_percentage > 0);
        }
        return unifiedProducts;
    }, [unifiedProducts, isOffersRoute]);
    
    // 2. PARÁMETROS DE LA URL Y CORRECCIÓN DE GUIONES
    const formatCategoryUrl = (cat: string) => {
        return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const initialCategory = paramCategory 
        ? formatCategoryUrl(paramCategory)
        : searchParams.get('categoria') || 'Todos';

    const brandFilter = searchParams.get('marca');
    const weightFilter = searchParams.get('peso'); // Ahora lee "peso" 
    const ageSizeFilter = searchParams.get('edad_tamano'); // Ahora lee "edad_tamano"
    const priceFilter = searchParams.get('precio');
    const searchTerm = searchParams.get('search') || '';

    // 3. USO DEL HOOK DE FILTRADO
    const { 
        filteredProducts, 
        sortBy, 
        setSortBy,
        categories,
        brands, 
        setActiveCategory,
        activeCategory,
        setActiveBrand,
        activeBrand, 
        setActiveWeight,
        setActiveAgeSize,
        setActivePrice
    } = useProductFilters({ 
        products: combinedProducts, 
        searchTerm 
    });

    // 4. SINCRONIZACIÓN: URL -> HOOK
    useEffect(() => {
        setActiveCategory(isOffersRoute ? 'Todos' : initialCategory);
        setActiveBrand(brandFilter); 
        setActiveWeight(weightFilter);
        setActiveAgeSize(ageSizeFilter);
        setActivePrice(priceFilter);
    }, [initialCategory, brandFilter, weightFilter, ageSizeFilter, priceFilter, setActiveCategory, setActiveBrand, setActiveWeight, setActiveAgeSize, setActivePrice, isOffersRoute]);
    
    // 5. MANEJADORES DE FILTROS Y NAVEGACIÓN
    const handleFilterChange = (key: string, value: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSearchParams(newParams);
    };

    const handleClearFilters = () => {
        setSearchParams(new URLSearchParams());
    };

    // Manejador Inteligente de Categorías
    const handleCategoryChange = (newCategory: string) => {
        const currentParams = new URLSearchParams(searchParams).toString();
        const queryString = currentParams ? `?${currentParams}` : '';

        if (newCategory === 'Todos') {
            navigate(`/productos${queryString}`);
        } else {
            navigate(`/category/${newCategory.toLowerCase().replace(/\s+/g, '-')}${queryString}`);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Título Visual (adaptado a Pet Shop)
    const pageTitle = searchTerm
        ? 'BÚSQUEDA'
        : isOffersRoute 
            ? (
                <span className="flex items-center gap-3">
                    OFERTAS <i className="fa-solid fa-tags text-brand-primary text-[0.8em]"></i>
                </span>
              )
            : (activeCategory === 'Todos' ? 'CATÁLOGO' : activeCategory);

    // Título Plano estricto para Google (SEO)
    const metaTitle = searchTerm 
        ? `Búsqueda: ${searchTerm}` 
        : isOffersRoute 
            ? 'Ofertas Exclusivas' 
            : activeCategory === 'Todos' ? 'Catálogo Completo' : activeCategory;

    // BREADCRUMBS UNIFICADOS
    const breadcrumbItems = useMemo(() => {
        if (searchTerm) return [{ label: 'Catálogo', href: '/productos' }, { label: 'Búsqueda' }];
        if (isOffersRoute) return [{ label: 'Catálogo', href: '/productos' }, { label: 'Ofertas' }];
        if (activeCategory === 'Todos') return [{ label: 'Catálogo' }];
        
        return [
            { label: 'Catálogo', href: '/productos' }, 
            { label: activeCategory }                  
        ];
    }, [isOffersRoute, activeCategory, searchTerm]);

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            {/* Animación de carga naranja */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-primary"></div>
        </div>
        );
    }
    
    return (
        <div className="flex flex-col animate-in fade-in duration-500 pb-16">
            
            {/* --- INYECCIÓN SEO DINÁMICO --- */}
            <Helmet>
                <title>{`ALIMENTO AHORA | ${metaTitle}`}</title>
                <meta name="description" content={`Explorá nuestra colección de ${metaTitle.toLowerCase()} en ALIMENTO AHORA. El mejor alimento balanceado con envíos a todo el país.`} />
                <meta property="og:title" content={`ALIMENTO AHORA | ${metaTitle}`} />
                <meta property="og:description" content={`Descubrí lo mejor en ${metaTitle.toLowerCase()}. Nutrición premium para tu mascota.`} />
                <meta property="og:url" content={window.location.href} />
            </Helmet>

            <div className="max-w-360 mx-auto px-4 md:px-6 w-full pt-6 pb-4">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <FilterBar 
                title={pageTitle}
                sortBy={sortBy}
                onSortChange={(val) => setSortBy(val as any)}
                onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
            />

            <div className="max-w-360 mx-auto px-4 md:px-6 w-full flex flex-col lg:flex-row gap-12 mt-8">
                
                {/* SIDEBAR DESKTOP */}
                <aside className="hidden lg:block w-64 shrink-0 sticky top-44 self-start max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar pb-8 pr-4">
                    <FilterSidebar 
                        activeFilters={{ weightFilter, ageSizeFilter, priceFilter, searchTerm, brandFilter }}
                        categories={categories}
                        activeCategory={activeCategory}
                        brands={brands}
                        activeBrand={activeBrand}
                        onCategoryChange={handleCategoryChange}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />
                </aside>
                
                <main className="flex-1">
                    <ProductGrid 
                        products={filteredProducts} 
                        onQuickView={handleQuickView}
                        layoutMode="catalog"
                    />
                </main>
            </div>

            {/* DRAWER MOBILE */}
            <div className={`fixed inset-0 z-50 flex lg:hidden ${isMobileFiltersOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                <div 
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer ui-backdrop ${isMobileFiltersOpen ? 'is-open' : ''}`} 
                    onClick={() => setIsMobileFiltersOpen(false)}
                />
                <div className={`absolute top-0 left-0 h-full w-4/5 max-w-75 bg-white rounded-r-3xl shadow-2xl flex flex-col ui-slide-panel ui-slide-left ${isMobileFiltersOpen ? 'is-open' : ''}`}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-2xl font-lilita text-brand-primary tracking-wide">Filtros</h2>
                        <button 
                            onClick={() => setIsMobileFiltersOpen(false)}
                            className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-orange-50 hover:text-brand-primary transition-colors cursor-pointer text-gray-500"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    {/* Padding ajustado para Mobile */}
                    <div className="px-6 pb-6 pt-6 overflow-y-auto flex-1 custom-scrollbar">
                        <FilterSidebar 
                            activeFilters={{ weightFilter, ageSizeFilter, priceFilter, searchTerm, brandFilter }}
                            categories={categories}
                            activeCategory={activeCategory}
                            brands={brands}
                            activeBrand={activeBrand}
                            onCategoryChange={handleCategoryChange}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                    </div>
                    <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-br-3xl">
                        <button 
                            onClick={() => setIsMobileFiltersOpen(false)}
                            className="w-full bg-brand-primary rounded-full text-white py-4 text-sm font-fredoka font-bold uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer shadow-md"
                        >
                            Ver Resultados
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
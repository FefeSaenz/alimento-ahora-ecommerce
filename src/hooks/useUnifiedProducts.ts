// src/hooks/useUnifiedProducts.ts
import { useMemo } from 'react';
import { useApp } from '@/src/context/AppContext';

export const useUnifiedProducts = () => {
    // Consumimos el catálogo global ya normalizado por mapApiProductToProduct
    const { allProducts } = useApp();

    // Catálogo completo
    const unifiedProducts = allProducts;

    // Filtramos solo los que el mapper les puso el tag "Destacado"
    const featuredProducts = useMemo(() => {
        const featured = allProducts.filter(p => p.tags === 'Destacado');
        
        // FALLBACK DE SEGURIDAD (Plan B): 
        // Si el backend no tiene ningún producto marcado como destacado (product_highlight = 0), 
        // mostramos los primeros 4 productos del catálogo para que la Home no quede vacía.
        if (featured.length === 0 && allProducts.length > 0) {
            return allProducts.slice(0, 4);
        }
        
        return featured;
    }, [allProducts]);

    return { unifiedProducts, featuredProducts };
};
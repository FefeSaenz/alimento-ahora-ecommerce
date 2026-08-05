// hooks/useUnifiedProducts.ts (o donde lo tengas)
import { useMemo } from 'react';
import { useApp } from '@/src/context/AppContext';

export const useUnifiedProducts = () => {
    // Asumo que en tu AppContext.tsx ya estás usando mapApiDressToProduct 
    // cuando guardás la respuesta de Axios en allProducts.
    const { allProducts } = useApp();

    // Catálogo completo
    const unifiedProducts = allProducts;

    // Filtramos solo los que el mapper les puso el tag "Destacado"
    const featuredProducts = useMemo(() => {
        return allProducts.filter(p => p.tags === 'Destacado');
    }, [allProducts]);

    return { unifiedProducts, featuredProducts };
};
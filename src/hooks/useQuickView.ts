import { useCallback } from 'react';
import { useApp } from '@/src/context/AppContext';
import { Product } from '@/src/types/product.types';

export const useQuickView = (setSelectedQuickView: (product: Product | null) => void) => {
    const { allProducts } = useApp();

    // Función de Hidratación: Recibe un producto (ligero o pesado) y lo "infla"
    const handleQuickView = useCallback((clickedProduct: Product) => {
        // Buscamos la versión "pesada" (con variantes) en el catálogo total
        const fullProduct = allProducts.find(p => p.id === clickedProduct.id);
        
        // Inyectamos al modal la versión pesada si existe, sino el fallback
        setSelectedQuickView(fullProduct || clickedProduct);
    }, [allProducts, setSelectedQuickView]);

    return { handleQuickView };
};
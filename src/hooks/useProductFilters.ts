import { useState, useMemo } from 'react';
import { Product } from '@/src/types/product.types';

interface UseProductFiltersProps {
  products: Product[];
  searchTerm: string;
}

// --- HELPER FUNCTIONS PARA BÚSQUEDA INTELIGENTE ---
// 1. Normalización: Saca tildes y pasa a minúsculas ("Pantalón" -> "pantalon")
const normalizeText = (text?: string) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .trim();
};

// 2. Lematización Básica: Saca plurales ("remeras" -> "remera", "pantalones" -> "pantalon")
const lemmatize = (word: string) => {
  let w = word;
  if (w.length > 3 && w.endsWith('es')) w = w.slice(0, -2);
  else if (w.length > 2 && w.endsWith('s')) w = w.slice(0, -1);
  return w;
};

// HELPER EXTRA: Normaliza espacios para comparar pesos ("15 Kg" === "15Kg")
const normalizeSize = (size: string) => size.replace(/\s+/g, '').toLowerCase();

// HELPER EXTRA 2: Normaliza mayúsculas/minúsculas para Edad y Tamaño ("Mini adult" === "Mini Adult")
const normalizeAgeSize = (text: string) => text.trim().toLowerCase();

/*
 * HOOK UNIVERSAL DE FILTRADO
 * Centraliza la lógica de búsqueda, categorías, marcas, pesos, edades y ordenamiento.
*/
export const useProductFilters = ({ 
  products = [], // Default value para evitar errores de .map() o .filter()
  searchTerm 
}: UseProductFiltersProps) => {

  // ESTADOS DE FILTRADO (Variables renombradas al contexto Pet Shop)
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeBrand, setActiveBrand] = useState<string | null>(null); 
  const [activeWeight, setActiveWeight] = useState<string | null>(null); // Ex activeSize
  const [activeAgeSize, setActiveAgeSize] = useState<string | null>(null); // Ex activeColor
  const [activePrice, setActivePrice] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');

  // EXTRAER CATEGORÍAS ÚNICAS
  const categories = useMemo(() => 
    ['Todos', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]
  , [products]);

  // EXTRAER MARCAS ÚNICAS
  const brands = useMemo(() => {
    const allBrands = products.map(p => p.brand).filter(Boolean) as string[];
    return Array.from(new Set(allBrands)).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];  

    // 1. Filtro por Categoría
    if (activeCategory !== 'Todos') {
      result = result.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
    }

    // 2. Filtro por Marca (SOPORTA MULTI-SELECT)
    if (activeBrand) {
      const brandArray = activeBrand.split(','); 
      result = result.filter(p => brandArray.some(b => p.brand?.toLowerCase() === b.toLowerCase()));
    }

    // 3. Filtro por Búsqueda Inteligente (Search)
    if (searchTerm) {
      // Limpiamos la búsqueda ingresada por el usuario
      const cleanSearchTerm = normalizeText(searchTerm);
      // La dividimos en palabras sueltas y le sacamos los plurales
      const searchTokens = cleanSearchTerm.split(/\s+/).filter(Boolean).map(lemmatize);

      result = result.filter(p => {
        // Armamos un "súper string" con toda la info útil del producto (El 'color' interno es la variante Edad/Tamaño en la UI)
        const productVariants = p.variants?.map(v => v.color.name).join(' ') || '';
        const searchableText = normalizeText(`${p.name} ${p.category} ${p.brand || ''} ${p.description || ''} ${productVariants}`);

        // El producto pasa el filtro solo si TODAS las palabras buscadas están en su info
        return searchTokens.every(token => searchableText.includes(token));
      });
    }

    // 4. Filtro por Peso (SOPORTA MULTI-SELECT)
    if (activeWeight) {
      const weightArray = activeWeight.split(',').map(normalizeSize);
      result = result.filter(p =>
        p.variants?.some(v => v.sizes.some(s => weightArray.includes(normalizeSize(s.size.toString()))))
      );
    }

    // 5. Filtro por Edad/Tamaño (SOPORTA MULTI-SELECT)
    if (activeAgeSize) {
      const ageSizeArray = activeAgeSize.split(',').map(normalizeAgeSize);
      result = result.filter(p =>
        p.variants?.some(v => ageSizeArray.some(activeC => normalizeAgeSize(v.color.name).includes(activeC)))
      );
    }

    // 6. Filtro por Precio
    if (activePrice) {
      const [minStr, maxStr] = activePrice.split('-');
      const min = minStr ? parseInt(minStr, 10) : 0;
      const max = maxStr ? parseInt(maxStr, 10) : Infinity;

      result = result.filter(p => {
        // Si el producto está en oferta, filtramos por el precio real que paga el usuario
        const finalPrice = p.price; 
        return finalPrice >= min && finalPrice <= max;
      });
    }

    // 7. Ordenamiento (Sort)
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);

    return result;
  }, [products, activeCategory, activeBrand, activeWeight, activeAgeSize, activePrice, sortBy, searchTerm]);

  return {
    filteredProducts,
    activeCategory, setActiveCategory,
    activeBrand, setActiveBrand, 
    activeWeight, setActiveWeight, // Ex activeSize
    activeAgeSize, setActiveAgeSize, // Ex activeColor
    activePrice, setActivePrice,
    sortBy, setSortBy,
    categories,
    brands 
  };
};
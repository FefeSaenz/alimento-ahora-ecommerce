import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getFrontData } from '@/src/api/axios';
import { Product } from '@/src/types/product.types';
import { mapApiProductToProduct, extractUniqueCategories } from '@/src/utils/mappers';
import { MenuItem, ApiResponse } from '@/src/types/api';

interface AppContextType {
  allProducts: Product[];
  categories: string[]; // Guardamos las categorías reales por si las necesitas en filtros
  menuItems: MenuItem[];
  logoText: string;
  loading: boolean;
  error: boolean;
  frontConfig: ApiResponse['data'] | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const buildSmartMenu = (brands: string[]): MenuItem[] => {
  return [
    { id: 1, label: 'PERROS', url: '/productos?especie=Perro', active: false, icon: null },
    { id: 2, label: 'GATOS', url: '/productos?especie=Gato', active: false, icon: null },
    {
      id: 3,
      label: 'MARCAS',
      url: '/productos',
      active: false,
      icon: null,
      submenu: brands.map((brand) => ({
        label: brand.toUpperCase(),
        url: `/productos?marca=${encodeURIComponent(brand)}`
      }))
    },
    { id: 4, label: 'OFERTAS', url: '/offers', active: false, icon: 'fire' }
  ];
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [frontConfig, setFrontConfig] = useState<ApiResponse['data'] | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const response = await getFrontData();

        if (response && response.products) {
          
          // Guardamos la respuesta cruda entera para que la Home lea los banners
          setFrontConfig(response); 

          // 1. Pasamos los datos crudos por la máquina traductora
          const mappedProducts = response.products.map(mapApiProductToProduct);
          setAllProducts(mappedProducts);

          // 2. Extraemos las categorías reales
          const uniqueCats = extractUniqueCategories(mappedProducts);
          setCategories(uniqueCats);

          // EXTRAEMOS MARCAS DINÁMICAS leyendo directamente la respuesta de la API cruda
          const uniqueBrands = Array.from(new Set(response.products.map(p => p.brand_name).filter(Boolean))) as string[];

          // 3. Armamos el menú pasándole las marcas
          setMenuItems(buildSmartMenu(uniqueBrands));
          
          setError(false);
        }
      } catch (err) {
        console.error("Error cargando el catálogo de la API:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  return (
    <AppContext.Provider value={{ 
      allProducts,
      categories,
      menuItems,
      logoText: "ALIMENTO AHORA",
      loading, 
      error,
      frontConfig
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp debe usarse dentro de AppProvider");
  return context;
};
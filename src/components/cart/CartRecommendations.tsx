import React, { useMemo } from 'react';
import { useApp } from '@/src/context/AppContext';
import { Product } from '@/src/types/product.types';
import Price from '@/src/components/ui/Price';

// --- COMPONENTE DE PRESENTACIÓN (PURO) ---
interface RecommendationListProps {
  products: Product[];
  onAddFromRec: (product: Product) => void;
}

const RecommendationList: React.FC<RecommendationListProps> = ({ products, onAddFromRec }) => {
  if (products.length === 0) return null;
  return(
    <div className="hidden md:flex flex-col w-75 border-r border-gray-100 bg-orange-50/50 overflow-y-auto custom-scrollbar">
      <div className="p-8 border-b border-gray-100">
        <h2 className="text-lg font-lilita text-brand-primary tracking-wide">Te puede gustar</h2>
      </div>
      <div className="p-6 space-y-6">
        {products.map((product) => (
          <div key={product.id} className="text-center group cursor-pointer bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100" onClick={() => onAddFromRec(product)}>
            <div className="aspect-3/4 mb-3 overflow-hidden bg-gray-50 rounded-xl border border-gray-50">
              <img src={product.images[0]} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" alt={product.name} />
            </div>
            <h4 className="text-xs font-fredoka font-semibold text-gray-800 line-clamp-2 px-2 leading-tight">
              {product.name}
            </h4>
            <Price amount={product.price} className="text-sm font-fredoka font-black mt-2 text-brand-primary block" />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENTE CONTENEDOR (ORQUESTADOR) ---
// Este componente maneja la data y se la pasa al de arriba.
const CartRecommendations: React.FC<{ onAddFromRec: (product: Product) => void }> = ({ onAddFromRec }) => {
  const { allProducts } = useApp();
  
  const recommendations = useMemo(() => {
    // 1. Buscamos en TODOS los productos, filtramos los que el mapper marcó como "Destacado" y agarramos los primeros 4
    return allProducts
      .filter(product => product.tags === 'Destacado')
      .slice(0, 4);
  }, [allProducts]);

  return <RecommendationList products={recommendations} onAddFromRec={onAddFromRec} />;
};

export default CartRecommendations;
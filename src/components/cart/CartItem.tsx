import React from 'react';
import { CartItem as CartItemType } from '@/src/types/product.types';
import Price from '@/src/components/ui/Price';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, size: string, color: string, delta: number) => void;
  onRemove: (id: string, size: string, color: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex space-x-4">
      {/* Imagen redondeada y amigable */}
      <div className="w-24 aspect-3/4 shrink-0 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
        {/* Usamos selectedImage por si cambió la foto al elegir el color, sino el fallback */}
        <img src={item.selectedImage || item.images[0]} className="w-full h-full object-contain p-2" alt={item.name} />
      </div>
      <div className="flex-1 py-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-fredoka font-bold text-gray-800 leading-tight">{item.name}</h4>
            <p className="text-xs font-fredoka text-gray-500 mt-1">
              Talle: <span className="text-black font-semibold mr-3">{item.selectedSize}</span>
              {/* MOSTRAMOS EL COLOR ACÁ */}
              Color: <span className="text-black font-semibold">{item.selectedColor}</span>
            </p>
          </div>
          <Price amount={item.price} className="text-sm font-fredoka font-black text-brand-primary" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          {/* Controles de cantidad en formato pastilla */}
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
            <button 
              onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor, -1)} 
              className="w-8 h-8 flex items-center justify-center hover:bg-orange-50 hover:text-brand-primary transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-minus text-[10px]"></i>
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-xs font-fredoka font-bold">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor, 1)} 
              className="w-8 h-8 flex items-center justify-center hover:bg-orange-50 hover:text-brand-primary transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
            </button>
          </div>
          <button 
            onClick={() => onRemove(item.id, item.selectedSize, item.selectedColor)} 
            className="text-xs font-fredoka font-medium text-red-400 hover:text-red-600 underline transition-colors cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
import React from 'react';
import Price from '@/src/components/ui/Price';

interface Props {
  subtotal: number;
  onCheckout: () => void;
  disabled: boolean;
}

const CartSummary: React.FC<Props> = ({ subtotal, onCheckout, disabled }) => {
  return (
    <div className="p-6 border-t border-gray-100 bg-white">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-fredoka font-bold text-gray-600 uppercase tracking-widest">Subtotal Estimado</span>
        <Price amount={subtotal} className="text-xl font-fredoka font-black text-brand-primary" />
      </div>
      <button 
        disabled={disabled}
        onClick={onCheckout}
        // Botón curvo y naranja
        className="w-full bg-brand-primary text-white py-4 px-6 rounded-full flex items-center justify-center space-x-3 hover:bg-orange-600 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        <span className="text-sm font-fredoka font-bold uppercase tracking-wider cursor-pointer">Iniciar compra</span>
        <i className="fa-solid fa-paw text-sm group-hover:rotate-12 transition-transform"></i>
      </button>
    </div>
  );
};

export default CartSummary;
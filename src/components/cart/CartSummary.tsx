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
        <span className="text-[11px] font-bold uppercase tracking-widest text-black">Subtotal Estimado</span>
        <Price amount={subtotal} className="text-sm font-black text-black" />
      </div>
      <button 
        disabled={disabled}
        onClick={onCheckout}
        className="w-full bg-black text-white py-4 px-6 flex items-center justify-center space-x-4 hover:bg-gray-900 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-[12px] font-black uppercase tracking-[3px] cursor-pointer">Iniciar compra</span>
        <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
      </button>
    </div>
  );
};

export default CartSummary;
import React from 'react';
import { FREE_SHIPPING_THRESHOLD } from '@/src/constants/products';
import Price from '@/src/components/ui/Price';

interface Props {
  subtotal: number;
}

const CartShippingTracker: React.FC<Props> = ({ subtotal }) => {
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  return (
    <div className="mb-8 bg-orange-50 p-4 rounded-2xl border border-orange-100">
      <p className="text-xs font-fredoka font-medium text-gray-700 text-center mb-3">
        {remaining > 0 
          ? <>Te faltan <Price amount={remaining} className="font-bold text-brand-primary"/> para tener <b>envío gratis</b></>
          : <span className="text-brand-primary font-bold">¡Envío gratuito bonificado! 🐾</span>}
      </p>
      {/* Barra de progreso redondeada */}
      <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
        <div className="h-full bg-brand-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default CartShippingTracker;
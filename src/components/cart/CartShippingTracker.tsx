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
    <div className="mb-8">
      <p className="text-[11px] font-medium text-gray-600 text-center mb-3 uppercase tracking-widest">
        {remaining > 0 
          ? <>Faltan <Price amount={remaining} /> para el envío gratis</>
          : '¡Envío gratuito bonificado!'}
      </p>
      <div className="h-0.5 w-full bg-gray-100">
        <div className="h-full bg-black transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default CartShippingTracker;
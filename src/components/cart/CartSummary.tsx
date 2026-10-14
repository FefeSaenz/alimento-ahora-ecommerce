import React, { useMemo } from 'react';
import Price from '@/src/components/ui/Price';
import { CartItem } from '@/src/types/product.types';
import { countUnpriced } from '@/src/utils/pricing';
import { generateWhatsAppLink } from '@/src/utils/whatsapp';

interface Props {
  cart: CartItem[];
  subtotal: number;
}

const buttonClasses =
  'w-full bg-[#25D366] text-white py-4 px-6 rounded-full flex items-center justify-center space-x-3 transition-colors group shadow-md';

const CartSummary: React.FC<Props> = ({ cart, subtotal }) => {
  const isEmpty = cart.length === 0;
  const unpriced = countUnpriced(cart);
  const whatsappLink = useMemo(() => generateWhatsAppLink(cart), [cart]);

  return (
    <div className="p-6 border-t border-gray-100 bg-white">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-fredoka font-bold text-gray-600 uppercase tracking-widest">Subtotal Estimado</span>
        {/* Si ningún ítem tiene precio, no se muestra un $0 engañoso */}
        {subtotal > 0
          ? <Price amount={subtotal} className="text-xl font-fredoka font-black text-brand-primary" />
          : <span className="text-base font-fredoka font-black text-brand-primary">{isEmpty ? '$0' : 'A consultar'}</span>}
      </div>

      {unpriced > 0 && subtotal > 0 && (
        <p className="text-[11px] font-fredoka font-medium text-gray-500 mb-2">
          No incluye {unpriced === 1 ? '1 producto con precio a consultar' : `${unpriced} productos con precio a consultar`}.
        </p>
      )}

      <p className="text-[11px] font-fredoka text-gray-400 leading-snug mb-5">
        Los precios son de referencia y están sujetos a confirmación de stock.
      </p>

      {isEmpty ? (
        <button disabled className={`${buttonClasses} opacity-50 cursor-not-allowed shadow-none`}>
          <i className="fa-brands fa-whatsapp text-xl"></i>
          <span className="text-sm font-fredoka font-bold uppercase tracking-wider">Consultar Stock por WhatsApp</span>
        </button>
      ) : (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClasses} hover:bg-[#20bd5a] hover:shadow-lg`}
        >
          <i className="fa-brands fa-whatsapp text-xl group-hover:scale-110 transition-transform"></i>
          <span className="text-sm font-fredoka font-bold uppercase tracking-wider">Consultar Stock por WhatsApp</span>
        </a>
      )}
    </div>
  );
};

export default CartSummary;

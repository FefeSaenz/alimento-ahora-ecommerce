import React from 'react';
import { formatPrice } from '@/src/utils/pricing';

interface PriceProps {
  amount: number;
  className?: string;
  emptyLabel?: string; // Si se informa y el monto no es > 0, se muestra este texto (ej: "Consultar precio")
}

const Price: React.FC<PriceProps> = ({ amount, className, emptyLabel }) => {
  if (emptyLabel && !(amount > 0)) return <span className={className}>{emptyLabel}</span>;

  return <span className={className}>{formatPrice(amount)} ARS</span>;
};

export default Price;

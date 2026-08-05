import React from 'react';

interface PriceProps {
  amount: number;
  className?: string;
}

const Price: React.FC<PriceProps> = ({ amount, className }) => {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0, // En Argentina solemos redondear los centavos en ropa
  }).format(amount);

  return <span className={className}>{formattedPrice} ARS</span>;
};

export default Price;
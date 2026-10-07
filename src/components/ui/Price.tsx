import React from 'react';

interface PriceProps {
  amount: number;
  className?: string;
  emptyLabel?: string; // Si se informa y el monto no es > 0, se muestra este texto (ej: "Consultar precio")
}

const Price: React.FC<PriceProps> = ({ amount, className, emptyLabel }) => {
  if (emptyLabel && !(amount > 0)) return <span className={className}>{emptyLabel}</span>;

  // Sin decimales para montos enteros; con 2 decimales si el precio tiene centavos (ej: $47.047,50)
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);

  return <span className={className}>{formattedPrice} ARS</span>;
};

export default Price;
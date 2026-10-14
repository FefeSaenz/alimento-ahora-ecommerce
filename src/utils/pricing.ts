import { CartItem } from '@/src/types/product.types';

/** Redondea a centavos para evitar errores de coma flotante al sumar precios con decimales. */
export const roundMoney = (amount: number): number => Math.round(amount * 100) / 100;

/**
 * Formatea un monto en pesos argentinos. Sin decimales para montos enteros; con 2 si hay centavos
 * (ej: $47.047,50). Fuente única del formato, usada por <Price /> y por el mensaje de WhatsApp.
 */
export const formatPrice = (amount: number): string => {
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
};

/** Cantidad de ítems del carrito sin precio cargado (se listan como "Consultar precio"). */
export const countUnpriced = (cart: Pick<CartItem, 'price'>[]): number =>
  cart.filter((item) => !(item.price > 0)).length;

/** Subtotal de referencia del carrito: suma solo los ítems con precio (los de precio 0 se consultan aparte). */
export const calcSubtotal = (cart: Pick<CartItem, 'price' | 'quantity'>[]): number =>
  roundMoney(cart.reduce((acc, item) => acc + item.price * item.quantity, 0));

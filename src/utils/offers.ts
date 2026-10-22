import { Product } from '@/src/types/product.types';

/**
 * Única definición de "producto en oferta": con porcentaje de descuento
 * o con precio original mayor al vigente (misma regla que la etiqueta de ProductDetail).
 */
export const isOnOffer = (
  p: Pick<Product, 'discount_percentage' | 'original_price' | 'price'>,
): boolean =>
  (p.discount_percentage ?? 0) > 0 ||
  (p.original_price != null && p.original_price > p.price);

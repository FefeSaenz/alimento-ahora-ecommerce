import { CartItem } from '@/src/types/product.types';

/** Redondea a centavos para evitar errores de coma flotante al sumar precios con decimales. */
export const roundMoney = (amount: number): number => Math.round(amount * 100) / 100;

/** Subtotal del carrito usando el precio unitario de la variante elegida en cada ítem. */
export const calcSubtotal = (cart: Pick<CartItem, 'price' | 'quantity'>[]): number =>
  roundMoney(cart.reduce((acc, item) => acc + item.price * item.quantity, 0));

import { ProductContentOption } from '@/src/types/product.types';

export const OUT_OF_STOCK_LABEL = 'Sin stock actual - Consultar ingreso';

/** Informativo: una opción sin stock o deshabilitada igual se puede agregar a la consulta; solo se avisa al usuario. */
export const isOutOfStock = (option: ProductContentOption | undefined | null): boolean =>
  !!option && (!option.available || option.stock <= 0);

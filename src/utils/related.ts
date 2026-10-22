import { Product } from '@/src/types/product.types';
import { speciesKey } from '@/src/utils/mappers';

/**
 * Productos relacionados, en este orden de prioridad:
 *  1. Misma marca y misma especie (match ideal).
 *  2. Misma marca, distinta especie.
 *  3. Misma especie, distinta marca.
 *  4. Resto del catálogo (fallback).
 * Nunca incluye el producto actual. Las comparaciones ignoran tildes y mayúsculas;
 * un valor vacío nunca coincide.
 */
export const getRelatedProducts = (
  current: Product,
  catalog: Product[],
  limit = 8,
): Product[] => {
  const brand = speciesKey(current.brand);
  const species = speciesKey(current.species);

  const tiers: Product[][] = [[], [], [], []];

  for (const p of catalog) {
    if (p.id === current.id) continue;

    const sameBrand = !!brand && speciesKey(p.brand) === brand;
    const sameSpecies = !!species && speciesKey(p.species) === species;

    if (sameBrand && sameSpecies) tiers[0].push(p);
    else if (sameBrand) tiers[1].push(p);
    else if (sameSpecies) tiers[2].push(p);
    else tiers[3].push(p);
  }

  return tiers.flat().slice(0, limit);
};

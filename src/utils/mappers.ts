import { Product, ProductVariant, Order } from '@/src/types/product.types';
import { ApiProduct } from '@/src/types/api';

const DEFAULT_PRESENTATION = 'ÚNICO';
const DEFAULT_HEX = '#cccccc';
const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Normaliza cualquier valor crudo de la API a string recortado.
 * El backend mezcla number / string / null en los mismos campos.
 */
const toSafeString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
};

/**
 * Solo acepta colores hex reales ("#ff8800"). Cualquier otra cosa
 * (ej: el entero 111 que manda hoy el backend) cae al color por defecto.
 */
const toSafeHex = (value: unknown): string => {
  const hex = toSafeString(value).toLowerCase();
  return HEX_COLOR_REGEX.test(hex) ? hex : DEFAULT_HEX;
};

/**
 * Convierte el precio crudo de la API a número. El backend puede mandar number, string o null.
 * Devuelve 0 si no hay un precio válido (> 0): una opción sin precio no debe poder venderse.
 */
const toSafePrice = (value: unknown): number => {
  const parsed = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) / 100 : 0;
};

const WEIGHT_NUMBER_REGEX = /\d+(?:\.\d+)?/;
const GRAMS_UNIT_REGEX = /\d\s*(?:g|gr|grs|gramos?)\b/i;

/**
 * Normaliza el peso crudo del backend ("1,5kg", "1KG", "1.5", "15 Kg", "20")
 * al formato "[Número] kg" ("1.5 kg", "20 kg").
 * - Si viene explícitamente en gramos ("500g"), se convierte a kg ("0.5 kg")
 *   para no mostrar "500 kg".
 * - Si no hay un número válido (ej: "Unidad"), devuelve el texto original
 *   recortado en vez de inventar un peso.
 */
export const normalizeContentWeight = (raw: unknown): string => {
  const text = toSafeString(raw);
  const match = text.replace(',', '.').match(WEIGHT_NUMBER_REGEX);
  if (!match) return text;

  let weight = parseFloat(match[0]);
  if (!Number.isFinite(weight) || weight <= 0) return text;
  if (GRAMS_UNIT_REGEX.test(text)) weight /= 1000;

  return `${Number(weight.toFixed(3))} kg`;
};

/**
 * Clave de comparación de pesos: sin espacios y en minúsculas ("15 kg" === "15KG" === "15kg").
 * Se usa solo para comparar (URL vs. contenido de variantes); lo que se muestra sigue siendo "15 kg".
 */
export const weightKey = (value: unknown): string => toSafeString(value).replace(/\s+/g, '').toLowerCase();

/** Peso numérico de un contenido ya normalizado ("1.5 kg"); sin número ("Unidad") va al final. */
const contentWeightValue = (content: string): number => {
  const match = content.match(WEIGHT_NUMBER_REGEX);
  return match ? parseFloat(match[0]) : Number.POSITIVE_INFINITY;
};

/**
 * Adapter Pattern: Transforma un producto de la API (Alimento) al formato estandarizado de la UI.
 */
export const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
  const groupedVariants: Record<string, ProductVariant> = {};
  const fallbackSku = toSafeString(apiProduct.product_sku);
  const fallbackPrice = toSafePrice(apiProduct.product_price);

  (apiProduct.product_variants ?? []).forEach((v) => {
    const content = normalizeContentWeight(v.variant_content);

    // Variantes "fantasma" (sin contenido o con condición -1) no son vendibles: se descartan
    const condition = v.variant_condition ?? 1;
    if (!content || condition < 0) return;

    // 1. PRESENTACIÓN: Ej -> "Bolsa", "Mini Adulto". Se agrupa sin distinguir mayúsculas
    const presentationName = toSafeString(v.variant_presentation) || DEFAULT_PRESENTATION;
    const variantKey = presentationName.toLowerCase();

    if (!groupedVariants[variantKey]) {
      groupedVariants[variantKey] = {
        presentation: {
          name: presentationName,
          hex: toSafeHex(v.variant_hex),
        },
        options: [],
      };
    }

    const group = groupedVariants[variantKey];

    // El backend a veces duplica variantes idénticas
    if (group.options.some((o) => o.content.toLowerCase() === content.toLowerCase())) return;

    // 2. CONTENIDO, PRECIO Y STOCK: Ej -> "3 kg", $47.047
    // Solo es vendible si está activa (condición 1), tiene precio > 0 y no declara stock agotado
    const price = toSafePrice(v.variant_price);
    const hasStock = typeof v.variant_stock !== 'number' || v.variant_stock > 0;
    group.options.push({
      content,
      sku: toSafeString(v.variant_sku) || fallbackSku,
      variant_id: v.variant_id,
      price,
      stock: typeof v.variant_stock === 'number' ? v.variant_stock : 99,
      available: condition === 1 && price > 0 && hasStock,
    });
  });

  // El backend no garantiza orden: opciones de menor a mayor peso
  Object.values(groupedVariants).forEach((g) =>
    g.options.sort((a, b) => contentWeightValue(a.content) - contentWeightValue(b.content)));

  // Escudo extremo: producto sin variantes válidas
  if (Object.keys(groupedVariants).length === 0) {
    groupedVariants[DEFAULT_PRESENTATION] = {
      presentation: { name: DEFAULT_PRESENTATION, hex: DEFAULT_HEX },
      options: [{ content: 'U', sku: fallbackSku, price: fallbackPrice, stock: 10, available: fallbackPrice > 0 }]
    };
  }

  // Precio "desde" del producto: el menor entre las opciones vendibles (si no hay, entre las que tienen precio)
  const allOptions = Object.values(groupedVariants).flatMap((g) => g.options);
  const sellablePrices = allOptions.filter((o) => o.available).map((o) => o.price);
  const pricedPrices = allOptions.filter((o) => o.price > 0).map((o) => o.price);
  const startingPrice = sellablePrices.length > 0
    ? Math.min(...sellablePrices)
    : pricedPrices.length > 0 ? Math.min(...pricedPrices) : fallbackPrice;

  // Defensa primaria del id
  const productIdStr = apiProduct.product_bound !== undefined && apiProduct.product_bound !== null
    ? apiProduct.product_bound.toString()
    : 'ID_NOT_FOUND';

  return {
    id: productIdStr,
    slug: apiProduct.product_slug,
    name: toSafeString(apiProduct.product_name),
    description: toSafeString(apiProduct.product_description),
    price: startingPrice,
    original_price: null,
    discount_percentage: null,
    images: apiProduct.product_pictures?.length > 0 
      ? apiProduct.product_pictures 
      : (apiProduct.product_picture ? [apiProduct.product_picture] : []),
    category: apiProduct.category_name,
    base_sku: fallbackSku,
    brand: apiProduct.brand_name || undefined,
    material: apiProduct.product_composition || undefined, 
    species: apiProduct.product_species || undefined,
    active: true,
    tags: apiProduct.product_highlight === 1 ? 'Destacado' : undefined, 
    variants: Object.values(groupedVariants),
  };
};

export const extractUniqueCategories = (products: Product[]): string[] => {
  const categories = products.map(p => p.category);
  return Array.from(new Set(categories)); 
};

export const mapOrderFromApi = (apiData: any): Order => {
  const backOrder = apiData?.order?.order_id ? apiData.order : (apiData?.customer?.orders?.[0] || apiData);
  const backProfile = apiData?.profile || apiData?.customer?.profile;

  if (!backOrder || (!backOrder.order_id && !backOrder.order_number)) {
    console.warn("⚠️ Aviso de parseo: El backend envió una estructura inesperada para la orden.", apiData);
    throw new Error("Estructura de datos de la orden inválida");
  }

  return {
    id: backOrder.order_number || backOrder.order_id?.toString() || 'ID-NO-ENCONTRADO',
    date: backOrder.order_date || new Date().toISOString(),
    status: backOrder.order_condition_name || 'Procesando',
    customer: {
      name: backProfile?.person_name || backOrder.person_name || 'Cliente',
      email: backProfile?.person_email || '',
      phone: backProfile?.person_cellphone || backOrder.person_cellphone || '',
      dni_cuit: '' 
    },
    summary: {
      subtotal: backOrder.order_subtotal || 0,
      discount: backOrder.order_discount_amount || 0,
      shipping: 0,
      total: backOrder.order_total || 0
    },
    payment: {
      method: backOrder.box_paymethod_name || 'Efectivo', 
      status: 'pending'
    },
    shipping: {
      method: backOrder.order_detail_address?.includes('Retiro') ? 'Pickup' : 'Standard',
      address: backOrder.order_detail_address || 'Dirección no especificada',
      city: '',
      zip: ''
    },
    items: (backOrder.order_items || []).map((item: any) => ({
      id: item.article_id?.toString() || '0',
      variant_id: item.variant_id,
      name: item.product_name || 'Producto',
      price: item.item_cost || 0,
      quantity: item.item_count || 1,
      selectedPresentation: item.variant_presentation || 'N/A',
      selectedContent: normalizeContentWeight(item.variant_content) || 'N/A',
      selectedImage: item.product_picture || undefined
    }))
  };
};
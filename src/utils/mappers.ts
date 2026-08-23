import { Product, ProductVariant, Order } from '@/src/types/product.types';
import { ApiProduct } from '@/src/types/api';

/**
 * Adapter Pattern: Transforma un producto de la API (Alimento) al formato estandarizado de la UI.
 */
export const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
  const groupedVariants: Record<string, ProductVariant> = {};

  if (apiProduct.product_variants && apiProduct.product_variants.length > 0) {
    apiProduct.product_variants.forEach((v) => {
      
      // 1. PRESENTACIÓN (Ex Color): Ej -> "Mini Adulto", "Cachorro", "Salmón"
      const presentationName = v.variant_presentation ? v.variant_presentation.trim() : 'ÚNICO';
      const safeHex = (v.variant_hex || '').toLowerCase().trim(); 

      const variantKey = presentationName;

      if (!groupedVariants[variantKey]) {
        groupedVariants[variantKey] = {
          color: { 
            name: presentationName, 
            hex: safeHex || '#cccccc',
          },
          sizes: [],
        };
      }

      // 2. CONTENIDO Y STOCK (Ex Talles): Ej -> "3kg", "15kg"
      // Defensa estricta contra undefined para evitar crashes con toString()
      const fallbackSku = apiProduct.product_sku !== undefined && apiProduct.product_sku !== null 
        ? apiProduct.product_sku.toString() 
        : '';

      groupedVariants[variantKey].sizes.push({
        size: v.variant_content || 'U', 
        sku: v.variant_sku || fallbackSku,
        variant_id: v.variant_id, 
        stock: v.variant_stock !== null ? v.variant_stock : 99,
        available: v.variant_stock === null || v.variant_stock > 0, 
      });
    });
  } else {
    // Escudo extremo
    const fallbackSku = apiProduct.product_sku !== undefined && apiProduct.product_sku !== null 
      ? apiProduct.product_sku.toString() 
      : '';

    groupedVariants['ÚNICO'] = {
      color: { name: 'ÚNICO', hex: '#cccccc' },
      sizes: [{ size: 'U', sku: fallbackSku, stock: 10, available: true }]
    };
  }

  // Defensa primaria del id
  const productIdStr = apiProduct.product_bound !== undefined && apiProduct.product_bound !== null
    ? apiProduct.product_bound.toString()
    : 'ID_NOT_FOUND';

  return {
    id: productIdStr,
    slug: apiProduct.product_slug,
    name: apiProduct.product_name,
    description: apiProduct.product_description,
    price: apiProduct.product_price,
    original_price: null,
    discount_percentage: null,
    images: apiProduct.product_pictures?.length > 0 
      ? apiProduct.product_pictures 
      : (apiProduct.product_picture ? [apiProduct.product_picture] : []),
    category: apiProduct.category_name,
    base_sku: apiProduct.product_sku !== undefined && apiProduct.product_sku !== null 
      ? apiProduct.product_sku.toString() 
      : '',
    brand: apiProduct.brand_name || undefined,
    material: apiProduct.product_composition || undefined, 
    gender: apiProduct.product_species || undefined,
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
      name: item.product_name || 'Producto', // Chau dress_name
      price: item.item_cost || 0,
      quantity: item.item_count || 1,
      selectedColor: item.variant_presentation || 'N/A', // Chau variant_color
      selectedSize: item.variant_content || 'N/A', // Chau variant_size
      selectedImage: item.product_picture || undefined // Chau dress_picture
    }))
  };
};
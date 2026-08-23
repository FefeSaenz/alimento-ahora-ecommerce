// types/api.ts

// ==========================================
// 1. TIPOS PARA LA UI (Para nuestro menú manual)
// ==========================================
export interface SubMenuItem {
  label: string;
  url: string;
}

export interface MenuItem {
  id: number;
  label: string;
  url: string;
  active: boolean;
  icon: string | null;
  submenu?: SubMenuItem[];
}

export interface Banner {
  id: string;
  type: 'hero' | 'promotional';
  title: string;
  subtitle: string;
  description: string;
  cta: { url: string; text: string };
  image: string;
  image_mobile?: string;
}

// ==========================================
// 2. TIPOS DE LA NUEVA API (El backend)
// ==========================================

export interface ApiProductVariant {
  variant_id: number;
  variant_bound: number;
  variant_presentation: string;
  variant_hex: string;
  variant_sku: string;
  variant_content: string;
  variant_stock: number | null;
}

export interface ApiProduct {
  product_id: number;
  product_bound: number;
  product_slug: string;
  product_name: string;
  product_description: string;
  product_composition: string;
  product_sku: string | number; // Atajamos si mandan número o string
  product_species: string;
  product_brand: number;
  product_price: number;
  product_highlight: number | null; // 1 = Destacado
  product_picture: string;
  brand_name: string | null;
  category_name: string;
  category_abbreviation: string;
  product_variants: ApiProductVariant[];
  product_pictures: string[];
}

export interface ApiBanner {
  link_item_id: number;
  link_item_bound: number;
  link_item_type: string;
  link_item_picture: string;
  link_item_name: string;
  link_item_title: string;
  link_item_href: string;
}

export interface ApiResponse {
  status: number;
  error: boolean;
  msg: string;
  data: {
    banners: ApiBanner[]; 
    products: ApiProduct[]; // Cambiado de ApiDress a ApiProduct
  };
}
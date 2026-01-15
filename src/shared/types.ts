export interface Color {
  id: number;
  name: string;
  hex_code: string;
  created_at: string;
  updated_at: string;
}

export interface ProductBase {
  id: number;
  name: string;
  price_cop: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  color_id: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithVariants extends ProductBase {
  variants: (ProductVariant & { color_name: string; color_hex: string })[];
  total_stock: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  balance_cop: number;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: number;
  name: string;
  status: 'Armado' | 'Enviado' | 'Entregado';
  created_at: string;
  updated_at: string;
}

export interface PackageItem {
  id: number;
  package_id: number;
  product_id: number;
  color_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface PackageWithItems extends Package {
  items: (PackageItem & { product_name: string; color_name: string; color_hex: string })[];
}

export interface Sale {
  id: number;
  customer_id: number;
  total_cop: number;
  paid_cop: number;
  paid_ves: number;
  exchange_rate: number;
  is_credit: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  color_id: number;
  quantity: number;
  price_cop: number;
  created_at: string;
  updated_at: string;
}

export interface SaleWithDetails extends Sale {
  customer_name: string;
  items: (SaleItem & { product_name: string; color_name: string; color_hex: string })[];
}

export interface Payment {
  id: number;
  customer_id: number;
  amount_cop: number;
  amount_ves: number;
  exchange_rate: number;
  note: string | null;
  customer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  id: number;
  cop_to_ves: number;
  created_at: string;
  updated_at: string;
}

export interface BimonetaryAmount {
  cop: number;
  ves: number;
}

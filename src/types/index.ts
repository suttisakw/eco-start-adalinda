// Core Types for EGAT + Shopee Integration

export interface EGATProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  energy_rating: 'A' | 'B' | 'C' | 'D' | 'E';
  energy_consumption: number;
  annual_savings_kwh: number;
  annual_savings_baht: number;
  recommended_price: number;
  certification_date: string;
  specifications: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ShopeeProduct {
  item_id: number;
  name: string;
  brand: string;
  model: string;
  category: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  rating: number;
  review_count: number;
  image_urls: string[];
  shopee_url: string;
  specifications: Record<string, any>;
}

export interface Product {
  id: string;
  
  // Basic Product Information
  name: string;
  slug: string;
  description?: string;
  
  // Shopee Integration
  shopee_product_id?: number;
  shopee_url?: string;
  affiliate_url?: string;
  
  // Pricing
  price: number;
  original_price?: number;
  discount_percentage: number;
  
  // Ratings and Reviews
  rating: number;
  review_count: number;
  
  // Energy Efficiency (EGAT Data)
  energy_rating?: 'A' | 'B' | 'C' | 'D' | 'E';
  energy_consumption_kwh?: number;
  annual_savings_baht?: number;
  
  // Images
  image_urls: string[];
  
  // Product Status
  status: 'active' | 'inactive' | 'draft';
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_end_time?: string;
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  
  // Raw Data Storage
  egat_product_data?: Record<string, any>;
  shopee_product_data?: Record<string, any>;
  specifications: Record<string, any>;
  
  // Matching Information
  egat_id?: string;
  confidence_score?: number;
  data_source: 'egat' | 'shopee' | 'egat_shopee_matched' | 'manual';
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchingResult {
  shopee_product: ShopeeProduct;
  confidence_score: number;
  match_reasons: string[];
  short_link: string;
}

export interface ProductSearchRequest {
  search_terms: string[];
  category?: string;
  brand?: string;
  price_range?: { min: number; max: number };
  limit?: number;
}

export interface ProductSearchResponse {
  products: ShopeeProduct[];
  total_found: number;
  search_metadata: {
    search_terms: string[];
    execution_time: number;
    data_source: string;
  };
}

export interface ShortLinkParams {
  affiliateId: string;
  subId: string;
  customValues?: {
    networkClickId?: string;
    referralSource?: string;
    customValue1?: string;
    customValue2?: string;
  };
}

export interface ParsedLinkData {
  originalUrl: string;
  affiliateId: string;
  subId: string;
  customValues: Record<string, string>;
}

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  product?: Product;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminActionLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  action_data: Record<string, any>;
  created_at: string;
}

export interface ShortLinkLog {
  id: string;
  product_id: string;
  original_url: string;
  short_link: string;
  link_type: 'product' | 'homepage' | 'search' | 'compare';
  sub_id: string;
  created_at: string;
  last_used?: string;
}

export interface ProductMatch {
  id: string;
  egat_product_id: string;
  shopee_product_id: string;
  confidence_score: number;
  match_reasons: string[];
  created_at: string;
}

export interface ProductStats {
  total_products: number;
  active_products: number;
  draft_products: number;
  featured_products: number;
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  top_performing_products: Product[];
  recent_products: Product[];
}

export interface EnergyRating {
  rating: 'A' | 'B' | 'C' | 'D' | 'E';
  color: string;
  label: string;
  description: string;
}

export interface FilterOptions {
  energy_rating?: ('A' | 'B' | 'C' | 'D' | 'E')[];
  price_range?: { min: number; max: number };
  brand?: string[];
  category?: string[];
  savings_range?: { min: number; max: number };
  confidence_score?: number;
}

export interface SortOptions {
  field: 'price' | 'rating' | 'savings' | 'created_at' | 'confidence_score';
  direction: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Auth/Profile Types
export interface Profile {
  id: string;
  user_id: string;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role?: 'admin' | 'user' | string | null;
  created_at?: string;
  updated_at?: string;
  // Allow merged fields from Supabase Auth user
  [key: string]: any;
}

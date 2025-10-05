import { supabase } from './supabase'
import { Product } from '@/types'

export interface CreateProductData {
  // Basic Product Information
  name: string
  slug: string
  description?: string
  
  // Shopee Integration
  shopee_product_id?: number
  shopee_url?: string
  affiliate_url?: string
  
  // Pricing
  price: number
  original_price?: number
  discount_percentage: number
  
  // Ratings and Reviews
  rating: number
  review_count: number
  
  // Energy Efficiency (EGAT Data)
  energy_rating?: 'A' | 'B' | 'C' | 'D' | 'E'
  energy_consumption_kwh?: number
  annual_savings_baht?: number
  
  // Images
  image_urls: string[]
  
  // Product Status
  status?: 'active' | 'inactive' | 'draft'
  is_featured?: boolean
  is_flash_sale?: boolean
  flash_sale_end_time?: string
  
  // SEO
  meta_title?: string
  meta_description?: string
  
  // Raw Data Storage
  egat_product_data?: Record<string, any>
  shopee_product_data?: Record<string, any>
  specifications?: Record<string, any>
  
  // Matching Information
  egat_id?: string
  confidence_score?: number
  data_source?: 'egat' | 'shopee' | 'egat_shopee_matched' | 'manual'
}

export class ProductService {
  /**
   * Create a new product
   */
  static async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .insert([{
          name: data.name,
          slug: data.slug,
          description: data.description,
          shopee_product_id: data.shopee_product_id,
          shopee_url: data.shopee_url,
          affiliate_url: data.affiliate_url,
          price: data.price,
          original_price: data.original_price,
          discount_percentage: data.discount_percentage,
          rating: data.rating,
          review_count: data.review_count,
          energy_rating: data.energy_rating,
          energy_consumption_kwh: data.energy_consumption_kwh,
          annual_savings_baht: data.annual_savings_baht,
          image_urls: data.image_urls,
          status: data.status || 'draft',
          is_featured: data.is_featured || false,
          is_flash_sale: data.is_flash_sale || false,
          flash_sale_end_time: data.flash_sale_end_time,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          egat_product_data: data.egat_product_data,
          shopee_product_data: data.shopee_product_data,
          specifications: data.specifications || {},
          egat_id: data.egat_id,
          confidence_score: data.confidence_score,
          data_source: data.data_source || 'egat_shopee_matched'
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create product: ${error.message}`)
      }

      return product
    } catch (error: any) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Product not found
        }
        throw new Error(`Failed to get product: ${error.message}`)
      }

      return product
    } catch (error: any) {
      console.error('Error getting product:', error)
      throw error
    }
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Product not found
        }
        throw new Error(`Failed to get product: ${error.message}`)
      }

      return product
    } catch (error: any) {
      console.error('Error getting product by slug:', error)
      throw error
    }
  }

  /**
   * Update product
   */
  static async updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update product: ${error.message}`)
      }

      return product
    } catch (error: any) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  /**
   * Delete product
   */
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`Failed to delete product: ${error.message}`)
      }

      return true
    } catch (error: any) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  /**
   * Get products with pagination and filters
   */
  static async getProducts(options: {
    page?: number
    limit?: number
    status?: 'active' | 'inactive' | 'draft'
    energy_rating?: string
    min_price?: number
    max_price?: number
    is_featured?: boolean
    search?: string
  } = {}): Promise<{
    products: Product[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        energy_rating,
        min_price,
        max_price,
        is_featured,
        search
      } = options

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })

      // Apply filters
      if (status) {
        query = query.eq('status', status)
      }
      if (energy_rating) {
        query = query.eq('energy_rating', energy_rating)
      }
      if (min_price !== undefined) {
        query = query.gte('price', min_price)
      }
      if (max_price !== undefined) {
        query = query.lte('price', max_price)
      }
      if (is_featured !== undefined) {
        query = query.eq('is_featured', is_featured)
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // Apply pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      // Order by created_at desc
      query = query.order('created_at', { ascending: false })

      const { data: products, error, count } = await query

      if (error) {
        throw new Error(`Failed to get products: ${error.message}`)
      }

      const total = count || 0
      const totalPages = Math.ceil(total / limit)

      return {
        products: products || [],
        total,
        page,
        limit,
        totalPages
      }
    } catch (error: any) {
      console.error('Error getting products:', error)
      throw error
    }
  }

  /**
   * Generate affiliate URL for Shopee product
   */
  static generateAffiliateUrl(shopeeUrl: string, egatId: string, shopeeProductId: number): string {
    const affiliateId = process.env.NEXT_PUBLIC_SHOPEE_AFFILIATE_ID || ''
    const timestamp = Date.now()
    const subId = `product_${timestamp}-nc_${timestamp}_n86u24x1v-admin_create-${egatId}-${shopeeProductId}`
    const encodedUrl = encodeURIComponent(shopeeUrl)
    
    return `https://s.shopee.co.th/an_redir?origin_link=${encodedUrl}&affiliate_id=${affiliateId}&sub_id=${subId}`
  }

  /**
   * Check if slug is available
   */
  static async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('products')
        .select('id')
        .eq('slug', slug)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to check slug availability: ${error.message}`)
      }

      return data.length === 0
    } catch (error: any) {
      console.error('Error checking slug availability:', error)
      throw error
    }
  }
}

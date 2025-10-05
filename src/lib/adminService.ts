import { supabase } from './supabase'
import { Product } from '@/types'

export interface DashboardStats {
  total_products: number
  active_products: number
  draft_products: number
  featured_products: number
  total_clicks: number
  total_conversions: number
  conversion_rate: number
  recent_products: Array<{
    id: string
    name: string
    price: number
    energy_rating: string
    created_at: string
    status: string
  }>
}

export class AdminService {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('📊 Fetching dashboard stats...')

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, energy_rating, status, is_featured, created_at')
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('❌ Error fetching products:', productsError)
        throw productsError
      }

      console.log('✅ Products fetched:', products?.length || 0)

      // Calculate stats
      const total_products = products?.length || 0
      const active_products = products?.filter(p => p.status === 'active').length || 0
      const draft_products = products?.filter(p => p.status === 'draft').length || 0
      const featured_products = products?.filter(p => p.is_featured).length || 0

      // Get recent products (last 5)
      const recent_products = (products || [])
        .slice(0, 5)
        .map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          energy_rating: product.energy_rating || 'A',
          created_at: product.created_at,
          status: product.status
        }))

      // TODO: Implement real analytics tracking
      // For now, use placeholder values for clicks and conversions
      const total_clicks = 0
      const total_conversions = 0
      const conversion_rate = 0

      const stats: DashboardStats = {
        total_products,
        active_products,
        draft_products,
        featured_products,
        total_clicks,
        total_conversions,
        conversion_rate,
        recent_products
      }

      console.log('📈 Dashboard stats calculated:', stats)
      return stats

    } catch (error) {
      console.error('❌ Error getting dashboard stats:', error)
      throw error
    }
  }

  static async getProductsOverview(): Promise<{
    total: number
    active: number
    draft: number
    featured: number
    by_category: { [key: string]: number }
    by_energy_rating: { [key: string]: number }
  }> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('status, is_featured, egat_product_data, energy_rating')

      if (error) throw error

      const total = products?.length || 0
      const active = products?.filter(p => p.status === 'active').length || 0
      const draft = products?.filter(p => p.status === 'draft').length || 0
      const featured = products?.filter(p => p.is_featured).length || 0

      // Group by category
      const by_category: { [key: string]: number } = {}
      products?.forEach(product => {
        const category = product.egat_product_data?.category || 'unknown'
        by_category[category] = (by_category[category] || 0) + 1
      })

      // Group by energy rating
      const by_energy_rating: { [key: string]: number } = {}
      products?.forEach(product => {
        const rating = product.energy_rating || 'unknown'
        by_energy_rating[rating] = (by_energy_rating[rating] || 0) + 1
      })

      return {
        total,
        active,
        draft,
        featured,
        by_category,
        by_energy_rating
      }
    } catch (error) {
      console.error('Error getting products overview:', error)
      throw error
    }
  }

  static async getRecentActivity(): Promise<{
    recent_products: Product[]
    recent_creations: number
    recent_updates: number
  }> {
    try {
      // Get recent products
      const { data: recentProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (productsError) throw productsError

      // Get recent creations (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { count: recentCreations, error: creationsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      if (creationsError) throw creationsError

      // Get recent updates (last 7 days)
      const { count: recentUpdates, error: updatesError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', sevenDaysAgo.toISOString())

      if (updatesError) throw updatesError

      return {
        recent_products: recentProducts || [],
        recent_creations: recentCreations || 0,
        recent_updates: recentUpdates || 0
      }
    } catch (error) {
      console.error('Error getting recent activity:', error)
      throw error
    }
  }
}

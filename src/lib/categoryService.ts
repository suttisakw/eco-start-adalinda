import { supabase } from './supabase'
import { Category } from '@/types'

export interface CategoryStats {
  category: string
  count: number
  slug: string
}

export class CategoryService {
  /**
   * Get all active categories
   */
  static async getCategories(): Promise<Category[]> {
    try {
      // Use egat_category_stats view instead of categories table
      const { data: categoryStats, error } = await supabase
        .from('egat_category_stats')
        .select('*')
        .order('total_products', { ascending: false })

      if (error) {
        throw new Error(`Failed to get categories: ${error.message}`)
      }

      // Transform category stats to Category format
      const categories: Category[] = (categoryStats || []).map(stat => ({
        id: stat.category,
        name: this.getCategoryDisplayName(stat.category),
        slug: this.getCategorySlug(stat.category),
        description: `${this.getCategoryDisplayName(stat.category)}เบอร์ 5 ประหยัดไฟ`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      return categories
    } catch (error: any) {
      console.error('Error getting categories:', error)
      throw error
    }
  }

  /**
   * Get category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      // Convert slug to category name
      const categoryName = this.getCategoryNameFromSlug(slug)
      if (!categoryName) {
        return null
      }

      // Get category stats
      const { data: categoryStats, error } = await supabase
        .from('egat_category_stats')
        .select('*')
        .eq('category', categoryName)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Category not found
        }
        throw new Error(`Failed to get category: ${error.message}`)
      }

      // Transform to Category format
      const category: Category = {
        id: categoryStats.category,
        name: this.getCategoryDisplayName(categoryStats.category),
        slug: slug,
        description: `${this.getCategoryDisplayName(categoryStats.category)}เบอร์ 5 ประหยัดไฟ`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return category
    } catch (error: any) {
      console.error('Error getting category by slug:', error)
      throw error
    }
  }

  /**
   * Get category statistics (product counts per category)
   */
  static async getCategoryStats(): Promise<CategoryStats[]> {
    try {
      // Use egat_category_stats view directly
      const { data: categoryStats, error } = await supabase
        .from('egat_category_stats')
        .select('category, total_products')
        .order('total_products', { ascending: false })

      if (error) {
        throw new Error(`Failed to get category stats: ${error.message}`)
      }

      // Transform to CategoryStats format
      const stats: CategoryStats[] = (categoryStats || []).map(stat => ({
        category: this.getCategoryDisplayName(stat.category),
        count: stat.total_products,
        slug: this.getCategorySlug(stat.category)
      }))

      return stats
    } catch (error: any) {
      console.error('Error getting category stats:', error)
      throw error
    }
  }

  /**
   * Get default categories with stats (fallback when no categories in database)
   */
  static getDefaultCategories(): CategoryStats[] {
    return [
      {
        category: 'ตู้เย็น',
        count: 0,
        slug: 'refrigerator'
      },
      {
        category: 'แอร์',
        count: 0,
        slug: 'air-conditioner'
      },
      {
        category: 'เครื่องซักผ้า',
        count: 0,
        slug: 'washing-machine'
      },
      {
        category: 'ไมโครเวฟ',
        count: 0,
        slug: 'microwave'
      },
      {
        category: 'เครื่องทำน้ำอุ่น',
        count: 0,
        slug: 'water-heater'
      },
      {
        category: 'พัดลม',
        count: 0,
        slug: 'fan'
      },
      {
        category: 'เครื่องเป่าผม',
        count: 0,
        slug: 'hair-dryer'
      },
      {
        category: 'ทีวี',
        count: 0,
        slug: 'tv'
      }
    ]
  }

  /**
   * Convert category name to slug
   */
  private static getCategorySlug(category: string): string {
    const slugMap: Record<string, string> = {
      'ตู้เย็น': 'refrigerator',
      'แอร์': 'air-conditioner',
      'เครื่องซักผ้า': 'washing-machine',
      'ไมโครเวฟ': 'microwave',
      'เครื่องทำน้ำอุ่น': 'water-heater',
      'พัดลม': 'fan',
      'เครื่องเป่าผม': 'hair-dryer',
      'ทีวี': 'tv',
      'ปั๊มน้ำ': 'water-pump',
      // EGAT category codes to slugs
      'ref': 'refrigerator',
      'air': 'air-conditioner',
      'washer': 'washing-machine',
      'micro': 'microwave',
      'heat': 'water-heater',
      'dryer': 'hair-dryer',
      'tvp': 'tv'
    }

    return slugMap[category] || category.toLowerCase().replace(/\s+/g, '-')
  }

  /**
   * Convert slug to category name (EGAT code)
   */
  private static getCategoryNameFromSlug(slug: string): string | null {
    const slugToCategoryMap: Record<string, string> = {
      'refrigerator': 'ref',
      'air-conditioner': 'air',
      'washing-machine': 'washer',
      'microwave': 'micro',
      'water-heater': 'heat',
      'fan': 'fan',
      'hair-dryer': 'dryer',
      'tv': 'tvp',
      'water-pump': 'water-pump'
    }

    return slugToCategoryMap[slug] || null
  }

  /**
   * Get display name for category
   */
  private static getCategoryDisplayName(category: string): string {
    const displayNameMap: Record<string, string> = {
      'ref': 'ตู้เย็น',
      'air': 'แอร์',
      'washer': 'เครื่องซักผ้า',
      'micro': 'ไมโครเวฟ',
      'heat': 'เครื่องทำน้ำอุ่น',
      'dryer': 'เครื่องเป่าผม',
      'tvp': 'ทีวี',
      'fan': 'พัดลม',
      'water-pump': 'ปั๊มน้ำ'
    }

    return displayNameMap[category] || category
  }

  /**
   * Get category icon based on slug
   */
  static getCategoryIcon(slug: string): string {
    const iconMap: Record<string, string> = {
      'refrigerator': 'Package',
      'air-conditioner': 'Zap',
      'washing-machine': 'Package',
      'microwave': 'Package',
      'water-heater': 'Package',
      'fan': 'Package',
      'hair-dryer': 'Package',
      'tv': 'Package',
      'water-pump': 'Package'
    }

    return iconMap[slug] || 'Package'
  }

  /**
   * Create a new category
   */
  static async createCategory(data: {
    name: string
    slug: string
    description?: string
    image_url?: string
    parent_id?: string
  }): Promise<Category> {
    try {
      const { data: category, error } = await supabase
        .from('categories')
        .insert([{
          name: data.name,
          slug: data.slug,
          description: data.description,
          image_url: data.image_url,
          parent_id: data.parent_id,
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create category: ${error.message}`)
      }

      return category
    } catch (error: any) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  /**
   * Update category
   */
  static async updateCategory(id: string, data: Partial<{
    name: string
    slug: string
    description: string
    image_url: string
    parent_id: string
    is_active: boolean
  }>): Promise<Category> {
    try {
      const { data: category, error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update category: ${error.message}`)
      }

      return category
    } catch (error: any) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`Failed to delete category: ${error.message}`)
      }

      return true
    } catch (error: any) {
      console.error('Error deleting category:', error)
      throw error
    }
  }
}

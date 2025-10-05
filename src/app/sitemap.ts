import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]
  
  // Category pages
  const categories = [
    'refrigerator',
    'air-conditioner', 
    'washing-machine',
    'microwave',
    'water-heater',
    'fan',
    'hair-dryer',
    'tv',
    'water-pump'
  ]
  
  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))
  
  // Product pages
  let productPages: MetadataRoute.Sitemap = []
  
  try {
    // Skip database query during build to avoid build errors
    if (process.env.NODE_ENV === 'production') {
      productPages = []
    } else {
      const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at')
        .eq('status', 'active')
      
      productPages = (products || []).map(product => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
    // Fallback to empty array if database is not available
    productPages = []
  }
  
  return [...staticPages, ...categoryPages, ...productPages]
}

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductCard from '@/components/ProductCard'
import SearchBar from '@/components/SearchBar'
import SEOOptimizer from '@/components/SEOOptimizer'
import { 
  Package, 
  Zap, 
  TrendingUp,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Loader2,
  Filter
} from 'lucide-react'
import { Product, Category, FilterOptions, SortOptions } from '@/types'
import { SEOGenerator } from '@/lib/seo-generator'
import { formatPrice } from '@/lib/utils'
import { ProductService } from '@/lib/productService'
import { CategoryService } from '@/lib/categoryService'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<SortOptions>({ field: 'created_at', direction: 'desc' })
  const [filters, setFilters] = useState<FilterOptions>({})
  const [initialLoad, setInitialLoad] = useState(false)

  // Load category data only once when slug changes
  useEffect(() => {
    if (slug && !initialLoad) {
      fetchCategoryData()
      setInitialLoad(true)
    }
  }, [slug])

  // Load products when filters or sort change (but not on initial load)
  useEffect(() => {
    if (initialLoad && category) {
      fetchProducts()
    }
  }, [filters, sortBy])

  const fetchCategoryData = async () => {
    try {
      setLoading(true)
      
      // Map slug to category name
      const categoryNames = {
        'refrigerator': 'ตู้เย็น',
        'air-conditioner': 'แอร์',
        'washing-machine': 'เครื่องซักผ้า',
        'microwave': 'ไมโครเวฟ',
        'water-heater': 'เครื่องทำน้ำอุ่น',
        'fan': 'พัดลม',
        'hair-dryer': 'เครื่องเป่าผม',
        'tv': 'ทีวี',
        'water-pump': 'ปั๊มน้ำ'
      }

      // Try to get category from database first
      let categoryData = await CategoryService.getCategoryBySlug(slug)
      
      // If category not found in database, create a fallback
      if (!categoryData) {
        categoryData = {
          id: slug,
          name: categoryNames[slug as keyof typeof categoryNames] || slug,
          slug: slug,
          description: `เครื่องใช้ไฟฟ้า${categoryNames[slug as keyof typeof categoryNames] || slug}เบอร์ 5 ประหยัดไฟ เปรียบเทียบราคาและข้อมูลประหยัดพลังงาน`,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      
      setCategory(categoryData)
      
      // Load products after category is set
      if (categoryData) {
        await fetchProducts()
      }
    } catch (error) {
      console.error('Error fetching category data:', error)
      setCategory(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    if (!category) return

    try {
      // Fetch products from database
      const result = await ProductService.getProducts({
        status: 'active',
        energy_rating: filters.energy_rating?.length ? filters.energy_rating[0] : undefined,
        min_price: filters.price_range?.min,
        max_price: filters.price_range?.max,
        limit: 20,
        page: 1
      })
      
      // Filter products by category (temporary solution)
      const categoryProducts = result.products.filter(product => {
        // This is a temporary solution - in the future, we should have a proper category field
        return product.egat_product_data?.category === slug || 
               product.shopee_product_data?.category === slug ||
               product.specifications?.category === slug
      })
      
      setProducts(categoryProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ไม่พบหมวดหมู่
            </h3>
            <p className="text-gray-600 mb-4">
              หมวดหมู่ที่คุณกำลังมองหาอาจไม่พร้อมใช้งาน
            </p>
            <Link href="/">
              <Button>
                <Package className="w-4 h-4 mr-2" />
                กลับหน้าแรก
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const seoData = SEOGenerator.generateCategorySEO(category)

  const sortOptions = [
    { value: 'created_at', label: 'ล่าสุด' },
    { value: 'price', label: 'ราคา' },
    { value: 'rating', label: 'คะแนน' },
    { value: 'savings', label: 'ประหยัดเงิน' },
    { value: 'confidence_score', label: 'ความน่าเชื่อถือ' }
  ]

  return (
    <SEOOptimizer {...seoData}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-green-600">หน้าแรก</Link>
            <span>/</span>
            <span className="text-gray-900">หมวดหมู่</span>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {category.name}เบอร์ 5
                </h1>
                <p className="text-gray-600">
                  {products.length} สินค้า • ประหยัดไฟสูงสุด
                </p>
              </div>
            </div>
            
            {category.description && (
              <p className="text-gray-700 leading-relaxed max-w-3xl">
                {category.description}
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <SearchBar 
                  showFilters={true}
                  onFilterChange={setFilters}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {products.length} สินค้า
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <select
                    value={`${sortBy.field}_${sortBy.direction}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('_')
                      setSortBy({ field: field as any, direction: direction as any })
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={`${option.value}_desc`} value={`${option.value}_desc`}>
                        {option.label} (มาก → น้อย)
                      </option>
                    ))}
                    {sortOptions.map((option) => (
                      <option key={`${option.value}_asc`} value={`${option.value}_asc`}>
                        {option.label} (น้อย → มาก)
                      </option>
                    ))}
                  </select>

                  {/* View Mode */}
                  <div className="flex border border-gray-300 rounded-md">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products */}
              {products.length > 0 ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showEGATInfo={true}
                      showConfidenceScore={true}
                      className={viewMode === 'list' ? 'flex flex-row' : ''}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      ไม่พบสินค้า
                    </h3>
                    <p className="text-gray-600 mb-4">
                      ลองปรับเงื่อนไขการค้นหาหรือตัวกรอง
                    </p>
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      ล้างตัวกรอง
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Load More */}
              {products.length > 0 && products.length >= 12 && (
                <div className="text-center mt-8">
                  <Button variant="outline" size="lg">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    โหลดเพิ่มเติม
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SEOOptimizer>
  )
}

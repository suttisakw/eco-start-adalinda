'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductCard from '@/components/ProductCard'
import SearchBar from '@/components/SearchBar'
import SEOOptimizer from '@/components/SEOOptimizer'
import { 
  Search, 
  Filter, 
  Grid, 
  List,
  SortAsc,
  SortDesc,
  Loader2,
  Package,
  TrendingUp
} from 'lucide-react'
import { Product, FilterOptions, SortOptions } from '@/types'
import { SEOGenerator } from '@/lib/seo-generator'
import { formatPrice } from '@/lib/utils'
import { ProductService } from '@/lib/productService'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<SortOptions>({ field: 'created_at', direction: 'desc' })
  const [filters, setFilters] = useState<FilterOptions>({
    energy_rating: searchParams.getAll('rating') as ('A' | 'B' | 'C' | 'D' | 'E')[] || [],
    price_range: searchParams.get('price_min') || searchParams.get('price_max') 
      ? { 
          min: searchParams.get('price_min') ? parseInt(searchParams.get('price_min')!) : 0,
          max: searchParams.get('price_max') ? parseInt(searchParams.get('price_max')!) : 0
        }
      : undefined,
    category: searchParams.get('category') ? [searchParams.get('category')!] : undefined,
    brand: searchParams.getAll('brand') || []
  })

  const query = searchParams.get('q') || ''

  useEffect(() => {
    fetchProducts()
  }, [query, filters, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Fetch products from database with search and filters
      const result = await ProductService.getProducts({
        search: query || undefined,
        status: 'active',
        energy_rating: filters.energy_rating?.length ? filters.energy_rating[0] : undefined,
        min_price: filters.price_range?.min,
        max_price: filters.price_range?.max,
        limit: 20,
        page: 1
      })
      
      setProducts(result.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const seoData = SEOGenerator.generateSearchSEO(query, products.length)

  const sortOptions = [
    { value: 'created_at', label: 'ล่าสุด' },
    { value: 'price', label: 'ราคา' },
    { value: 'rating', label: 'คะแนน' },
    { value: 'savings', label: 'ประหยัดเงิน' },
    { value: 'confidence_score', label: 'ความน่าเชื่อถือ' }
  ]

  return (
    <SEOOptimizer {...seoData}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
          {/* Mobile Search Bar */}
          <div className="lg:hidden mb-6">
            <div className="space-y-4">
              <SearchBar 
                showFilters={false}
                showCategorySlider={false}
                onFilterChange={setFilters}
              />
              
              {/* Mobile Filter Button */}
              <div className="flex justify-center">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  ตัวกรอง
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Sidebar - Search & Filters */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-8">
                <SearchBar 
                  showFilters={true}
                  showCategorySlider={true}
                  onFilterChange={setFilters}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {products.length} สินค้า
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  {/* Sort */}
                  <select
                    value={`${sortBy.field}_${sortBy.direction}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('_')
                      setSortBy({ field: field as any, direction: direction as any })
                    }}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-0">
                        <div className="aspect-square bg-gray-200 rounded-t-lg" />
                        <div className="p-3 sm:p-4 space-y-3">
                          <div className="h-4 bg-gray-200 rounded" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                          <div className="h-6 bg-gray-200 rounded w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className={`grid gap-4 sm:gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
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
                  <CardContent className="text-center py-8 sm:py-12">
                    <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      ไม่พบสินค้า
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      ลองปรับเงื่อนไขการค้นหาหรือตัวกรอง
                    </p>
                    <Button variant="outline" size="sm" className="sm:size-default">
                      <Search className="w-4 h-4 mr-2" />
                      ค้นหาใหม่
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Load More */}
              {products.length > 0 && products.length >= 12 && (
                <div className="text-center mt-6 sm:mt-8">
                  <Button variant="outline" size="sm" className="sm:size-lg">
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

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Loader2,
  Star,
  DollarSign,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'
import { EGATProduct, ShopeeProduct } from '@/types'
import { formatPrice, formatEnergyRating, getEnergyRatingColor } from '@/lib/utils'
import { shopeeBackendClient } from '@/lib/shopeeBackendClient'

interface Step2Props {
  selectedEgatProduct: EGATProduct
  onProductSelect: (product: ShopeeProduct, confidenceScore: number) => void
  onBack: () => void
  loading: boolean
}

export default function Step2ShopeeMatching({ 
  selectedEgatProduct, 
  onProductSelect, 
  onBack, 
  loading: externalLoading 
}: Step2Props) {
  const [shopeeProducts, setShopeeProducts] = useState<ShopeeProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Search parameters
  const [searchQuery, setSearchQuery] = useState('')
  const [searchQueries, setSearchQueries] = useState<string[]>([]) // Multiple search terms
  const [searchIn, setSearchIn] = useState<string[]>(['name']) // Multiple search fields
  const [searchMode, setSearchMode] = useState<'AND' | 'OR'>('OR')
  const [category, setCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [itemsPerPage] = useState(50) // Match example limit

  // Auto-search when component mounts with EGAT product info
  useEffect(() => {
    const brand = selectedEgatProduct.brand || ''
    const model = selectedEgatProduct.model || ''
    
    // Create dynamic search queries based on EGAT product
    const queries = [
      brand,
      model,
      `${brand} ${model}`.trim()
    ].filter(q => q.length > 0)
    
    setSearchQueries(queries)
    setSearchQuery(queries.join(', '))
    setCategory(selectedEgatProduct.category)
    setSearchIn(['description', 'model_names', 'title']) // Match example
    setSearchMode('OR')
    
    // Perform initial search
    searchShopeeProducts(queries, ['description', 'model_names', 'title'], 'OR', selectedEgatProduct.category, 1)
  }, [selectedEgatProduct])

  // Search when parameters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQueries.length > 0) {
        searchShopeeProducts(searchQueries, searchIn, searchMode, category, currentPage)
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchQueries, searchIn, searchMode, category, currentPage])

  const searchShopeeProducts = async (
    queries: string[], 
    searchInFields: string[], 
    mode: 'AND' | 'OR',
    categoryFilter: string, 
    page: number
  ) => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔍 Searching Shopee products with params:', {
        q: queries,
        search_in: searchInFields,
        search_mode: mode,
        category: categoryFilter,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      })
      
      const result = await shopeeBackendClient.searchProductsByQuery({
        q: queries,
        search_in: searchInFields,
        search_mode: mode,
        category: categoryFilter,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      })
      
      console.log('✅ Shopee API Response:', result)
      
      // Check if result has the expected structure
      if (!result) {
        throw new Error('ไม่มีข้อมูลตอบกลับจาก API')
      }
      
      // Handle different response structures
      const products = (result as any).products || (result as any).data || (result as any).items || []
      const total = (result as any).total || (result as any).total_found || (result as any).count || 0
      
      console.log('✅ Found Shopee products:', products.length, 'of', total)
      
      // Transform raw data to ShopeeProduct format
      const transformedProducts = Array.isArray(products) ? products.map(transformShopeeData) : []
      
      setShopeeProducts(transformedProducts)
      setTotalResults(total)
      
    } catch (error: any) {
      console.error('❌ Error searching Shopee products:', error)
      setError('ไม่สามารถค้นหาสินค้า Shopee ได้: ' + error.message)
      setShopeeProducts([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    setError('') // Clear previous errors
    
    // Parse search query into array
    const queries = searchQuery.split(',').map(q => q.trim()).filter(q => q.length > 0)
    setSearchQueries(queries)
    
    if (queries.length > 0) {
      searchShopeeProducts(queries, searchIn, searchMode, category, 1)
    } else {
      setError('กรุณาใส่คำค้นหา')
    }
  }

  const handleAddSearchField = (field: string) => {
    if (!searchIn.includes(field)) {
      setSearchIn([...searchIn, field])
    }
  }

  const handleRemoveSearchField = (field: string) => {
    setSearchIn(searchIn.filter(f => f !== field))
  }

  const handleResetSearch = () => {
    const brand = selectedEgatProduct.brand || ''
    const model = selectedEgatProduct.model || ''
    
    const queries = [brand, model, `${brand} ${model}`.trim()].filter(q => q.length > 0)
    
    setSearchQueries(queries)
    setSearchQuery(queries.join(', '))
    setSearchIn(['description', 'model_names', 'title'])
    setSearchMode('OR')
    setCategory(selectedEgatProduct.category)
    setCurrentPage(1)
    searchShopeeProducts(queries, ['description', 'model_names', 'title'], 'OR', selectedEgatProduct.category, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Function to transform raw Shopee API data to ShopeeProduct format
  const transformShopeeData = (rawData: any): ShopeeProduct => {
    // Safety check for rawData
    if (!rawData || typeof rawData !== 'object') {
      console.warn('Invalid rawData:', rawData)
      return {
        item_id: 0,
        name: 'Unknown Product',
        brand: '',
        model: '',
        category: 'air',
        price: 0,
        original_price: 0,
        discount_percentage: 0,
        rating: 0,
        review_count: 0,
        image_urls: [],
        shopee_url: '',
        specifications: {}
      }
    }

    // Extract model names from various fields
    const modelNames = rawData.model_names || rawData.title || ''
    
    // Extract brand from various fields
    const brand = rawData.global_brand || rawData.brand || ''
    
    // Extract category mapping
    const categoryMap: { [key: string]: string } = {
      'Home Appliances': 'air', // Default mapping
      'Remote Controls': 'air',
      'Air Conditioners': 'air',
      'Refrigerators': 'ref',
      'Washing Machines': 'washer',
      'Microwaves': 'micro',
      'Televisions': 'tvp'
    }
    
    const category = categoryMap[rawData.global_category1] || 'air'
    
    // Extract image URLs
    const imageUrls = [
      rawData.image_link,
      rawData.image_link_3,
      rawData.image_link_4,
      rawData.image_link_5,
      rawData.image_link_6,
      rawData.image_link_7,
      rawData.image_link_8,
      rawData.image_link_9,
      rawData.image_link_10
    ].filter(Boolean)
    
    // Extract specifications from various fields
    const specifications: Record<string, any> = {
      stock: rawData.stock || 0,
      item_sold: rawData.item_sold || 0,
      condition: rawData.condition || 'New',
      shop_rating: rawData.shop_rating || 0,
      is_preferred_shop: rawData.is_preferred_shop || 'Unknown',
      is_official_shop: rawData.is_official_shop || 'Unknown',
      shopee_verified_flag: rawData.shopee_verified_flag || 'Unknown',
      seller_name: rawData.seller_name || '',
      shop_name: rawData.shop_name || '',
      global_category1: rawData.global_category1 || '',
      global_category2: rawData.global_category2 || '',
      global_catid1: rawData.global_catid1 || 0,
      global_catid2: rawData.global_catid2 || 0,
      cb_option: rawData.cb_option || '',
      has_lowest_price_guarantee: rawData.has_lowest_price_guarantee || false,
      holiday_mode_on: rawData.holiday_mode_on || 'Off',
      like: rawData.like || 0,
      shop_sku_count: rawData.shop_sku_count || 0,
      seller_penalty_score: rawData.seller_penalty_score || 0
    }
    
    // Parse global_item_attributes if it's a string
    if (rawData.global_item_attributes && typeof rawData.global_item_attributes === 'string') {
      try {
        const attributes = JSON.parse(rawData.global_item_attributes)
        specifications.global_item_attributes = attributes
      } catch (e) {
        console.warn('Failed to parse global_item_attributes:', rawData.global_item_attributes)
        specifications.global_item_attributes = rawData.global_item_attributes
      }
    } else if (rawData.global_item_attributes) {
      specifications.global_item_attributes = rawData.global_item_attributes
    }

    return {
      item_id: rawData.itemid || 0,
      name: rawData.title || 'Unknown Product',
      brand: brand.replace(/\(.*?\)/g, '').trim(), // Remove parentheses content
      model: modelNames,
      category: category,
      price: rawData.sale_price || rawData.price || 0,
      original_price: rawData.price || 0,
      discount_percentage: rawData.discount_percentage || 0,
      rating: rawData.item_rating || 0,
      review_count: rawData.item_sold || 0,
      image_urls: imageUrls,
      shopee_url: rawData.product_link || '',
      specifications: specifications
    }
  }

  const calculateConfidenceScore = (shopeeProduct: ShopeeProduct): number => {
    let score = 0
    const egatBrand = selectedEgatProduct.brand.toLowerCase()
    const egatModel = selectedEgatProduct.model.toLowerCase()
    const shopeeTitle = shopeeProduct.name.toLowerCase()
    const shopeeBrand = shopeeProduct.brand?.toLowerCase() || ''
    const shopeeModel = shopeeProduct.model?.toLowerCase() || ''

    // Brand matching (40% weight)
    if (shopeeBrand && egatBrand.includes(shopeeBrand)) score += 0.4
    else if (shopeeTitle.includes(egatBrand)) score += 0.3

    // Model matching (30% weight)  
    if (shopeeModel && egatModel.includes(shopeeModel)) score += 0.3
    else if (shopeeTitle.includes(egatModel)) score += 0.2

    // Category matching (20% weight)
    if (shopeeProduct.category === selectedEgatProduct.category) score += 0.2

    // Rating bonus (10% weight)
    if (shopeeProduct.rating >= 4.0) score += 0.1

    return Math.min(score, 1.0) // Cap at 100%
  }

  // Component to render raw_data flexibly
  const RawDataDisplay = ({ rawData, productName }: { rawData: any, productName: string }) => {
    if (!rawData || typeof rawData !== 'object') {
      return <p className="text-sm text-gray-500">ไม่มีข้อมูลเพิ่มเติม</p>
    }

    const renderValue = (key: string, value: any): React.ReactNode => {
      if (value === null || value === undefined || value === '') {
        return <span className="text-gray-400">-</span>
      }

      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return value.length > 0 ? value.join(', ') : <span className="text-gray-400">-</span>
        }
        return <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
      }

      if (typeof value === 'boolean') {
        return value ? <Badge variant="default">ใช่</Badge> : <Badge variant="secondary">ไม่</Badge>
      }

      if (typeof value === 'number') {
        // Format numbers based on the key context
        if (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('baht')) {
          return formatPrice(value)
        }
        if (key.toLowerCase().includes('percent') || key.toLowerCase().includes('%')) {
          return `${value}%`
        }
        if (key.toLowerCase().includes('kwh') || key.toLowerCase().includes('watt') || key.toLowerCase().includes('power')) {
          return `${value.toLocaleString()} kWh`
        }
        if (key.toLowerCase().includes('co2')) {
          return `${value.toLocaleString()} kg CO₂/ปี`
        }
        if (key.toLowerCase().includes('score')) {
          return `${value}%`
        }
        return value.toLocaleString()
      }

      return String(value)
    }

    const formatKey = (key: string): string => {
      // Thai translations for common keys
      const keyTranslations: { [key: string]: string } = {
        'data_quality_score': 'คะแนนคุณภาพข้อมูล',
        'co2_reduction': 'การลด CO₂',
        'annual_electricity_cost': 'ค่าไฟต่อปี',
        'energy_efficiency_level': 'ระดับประหยัดไฟ',
        'power_consumption': 'การใช้พลังงาน',
        'capacity': 'ความจุ',
        'size': 'ขนาด',
        'weight': 'น้ำหนัก',
        'warranty': 'การรับประกัน',
        'features': 'คุณสมบัติ',
        'specifications': 'รายละเอียด',
        'model_year': 'ปีรุ่น',
        'price_range': 'ช่วงราคา'
      }

      if (keyTranslations[key.toLowerCase()]) {
        return keyTranslations[key.toLowerCase()]
      }

      // Convert snake_case or camelCase to readable format
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim()
    }

    // Prioritize important keys
    const priorityKeys = [
      'data_quality_score',
      'co2_reduction', 
      'annual_electricity_cost',
      'energy_efficiency_level',
      'power_consumption',
      'capacity',
      'size',
      'weight'
    ]

    const allEntries = Object.entries(rawData).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    )

    // Separate priority and other entries
    const priorityEntries = allEntries.filter(([key]) => 
      priorityKeys.some(pk => key.toLowerCase().includes(pk.toLowerCase()))
    )
    const otherEntries = allEntries.filter(([key]) => 
      !priorityKeys.some(pk => key.toLowerCase().includes(pk.toLowerCase()))
    )

    if (allEntries.length === 0) {
      return <p className="text-sm text-gray-500">ไม่มีข้อมูลเพิ่มเติม</p>
    }

    return (
      <div className="space-y-3">
        {/* Priority Information */}
        {priorityEntries.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
              ข้อมูลสำคัญ
            </h5>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {priorityEntries.map(([key, value]) => (
                <div key={key} className="bg-blue-50 border border-blue-200 p-2 rounded">
                  <div className="text-xs font-medium text-blue-700 mb-1">
                    {formatKey(key)}
                  </div>
                  <div className="text-sm text-blue-900 font-medium">
                    {renderValue(key, value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Information */}
        {otherEntries.length > 0 && (
          <div>
            {priorityEntries.length > 0 && (
              <h5 className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                ข้อมูลเพิ่มเติม
              </h5>
            )}
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {otherEntries.map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-2 rounded">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    {formatKey(key)}
                  </div>
                  <div className="text-sm text-gray-900">
                    {renderValue(key, value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'air': 'เครื่องปรับอากาศ',
      'ref': 'ตู้เย็น', 
      'washer': 'เครื่องซักผ้า',
      'heat': 'เครื่องทำน้ำอุ่น',
      'dryer': 'เครื่องอบผ้า',
      'micro': 'ไมโครเวฟ',
      'tvp': 'ทีวี/จอแสดงผล'
    }
    return categoryMap[category] || category
  }

  // Pagination component
  const PaginationComponent = () => {
    const totalPages = Math.ceil(totalResults / itemsPerPage)
    
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            แสดง {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalResults)} จาก {totalResults} รายการ
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ก่อนหน้า
          </Button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
            if (page > totalPages) return null
            
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            )
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ถัดไป
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          ค้นหาสินค้า Shopee
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Selected EGAT Product Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">สินค้า EGAT ที่เลือก</h3>
            <div className="space-y-3">
              <div>
                <p className="text-blue-700 font-semibold">{selectedEgatProduct.name}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline" className={getEnergyRatingColor(selectedEgatProduct.energy_rating)}>
                    {formatEnergyRating(selectedEgatProduct.energy_rating)}
                  </Badge>
                  <span className="text-sm text-blue-600">
                    {getCategoryDisplayName(selectedEgatProduct.category)}
                  </span>
                  <span className="text-sm text-blue-600">
                    ประหยัด {selectedEgatProduct.annual_savings_baht.toLocaleString()} บาท/ปี
                  </span>
                </div>
                {selectedEgatProduct.specifications?.data_quality_score && (
                  <div className="text-sm text-blue-600 mt-1">
                    คะแนนคุณภาพข้อมูล: {selectedEgatProduct.specifications.data_quality_score}%
                  </div>
                )}
              </div>

              {/* Raw Data Display */}
              {selectedEgatProduct.specifications && (
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">ข้อมูลรายละเอียด (Raw Data)</h4>
                  <RawDataDisplay 
                    rawData={selectedEgatProduct.specifications} 
                    productName={selectedEgatProduct.name}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Search Controls */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Search className="w-4 h-4 mr-2" />
              ค้นหาสินค้า Shopee (Dynamic Search)
            </h3>
            
            <div className="space-y-4">
              {/* Search Query - แยกเป็น input แยก */}
              <div>
                <Label htmlFor="searchQuery">คำค้นหา (q parameter)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="searchQuery"
                    placeholder="ใส่คำค้นหา เช่น: MCY-, xx3, x4 (คั่นด้วยเครื่องหมายจุลภาค)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ใส่คำค้นหาหลายคำคั่นด้วยเครื่องหมายจุลภาค เช่น "MCY-, xx3, x4"
                </p>
              </div>

              {/* Search In Fields - ปรับให้ user เลือกง่ายขึ้น */}
              <div>
                <Label>ค้นหาใน (search_in parameter)</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { value: 'title', label: 'ชื่อสินค้า (title)' },
                    { value: 'description', label: 'คำอธิบาย (description)' },
                    { value: 'model_names', label: 'ชื่อรุ่น (model_names)' },
                    { value: 'brand', label: 'แบรนด์ (brand)' },
                    { value: 'specifications', label: 'คุณสมบัติ (specifications)' },
                    { value: 'category', label: 'หมวดหมู่ (category)' }
                  ].map((field) => (
                    <label key={field.value} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={searchIn.includes(field.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleAddSearchField(field.value)
                          } else {
                            handleRemoveSearchField(field.value)
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{field.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p className="text-xs text-blue-700">
                    <strong>เลือกแล้ว:</strong> {searchIn.join(', ')}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    <strong>search_in value:</strong> {searchIn.join(',')}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Search Mode */}
                <div>
                  <Label htmlFor="searchMode">โหมดการค้นหา (search_mode)</Label>
                  <select
                    id="searchMode"
                    value={searchMode}
                    onChange={(e) => setSearchMode(e.target.value as 'AND' | 'OR')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="OR">OR - พบคำใดคำหนึ่ง</option>
                    <option value="AND">AND - ต้องพบทุกคำ</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    OR: ค้นหาสินค้าที่มีคำใดคำหนึ่ง | AND: ต้องมีทุกคำ
                  </p>
                </div>

                {/* Category Filter */}
                <div>
                  <Label htmlFor="category">หมวดหมู่ (category)</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">ทุกหมวดหมู่</option>
                    <option value="air">เครื่องปรับอากาศ</option>
                    <option value="ref">ตู้เย็น</option>
                    <option value="washer">เครื่องซักผ้า</option>
                    <option value="heat">เครื่องทำน้ำอุ่น</option>
                    <option value="dryer">เครื่องอบผ้า</option>
                    <option value="micro">ไมโครเวฟ</option>
                    <option value="tvp">ทีวี/จอแสดงผล</option>
                  </select>
                </div>
              </div>

              {/* URL Preview */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">URL ที่จะเรียก:</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>q:</strong> {searchQueries.join(',')}</div>
                  <div><strong>search_in:</strong> {searchIn.join(',')}</div>
                  <div><strong>search_mode:</strong> {searchMode}</div>
                  <div><strong>category:</strong> {category || '(ไม่ระบุ)'}</div>
                  <div><strong>limit:</strong> {itemsPerPage}</div>
                  <div><strong>offset:</strong> {(currentPage - 1) * itemsPerPage}</div>
                  <div className="mt-2 p-2 bg-white rounded border">
                    <strong>Full URL:</strong>
                    <div className="text-xs font-mono break-all text-blue-800">
                      /products?q={searchQueries.join(',')}&search_in={searchIn.join(',')}&search_mode={searchMode}{category && `&category=${category}`}&limit={itemsPerPage}&offset={(currentPage - 1) * itemsPerPage}
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Data Preview */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 mb-2">ตัวอย่างข้อมูล Shopee API:</h4>
                <div className="text-xs text-green-700 space-y-1">
                  <div><strong>itemid:</strong> 41668783997</div>
                  <div><strong>title:</strong> รีโมทแอร์ MITSUBISHI RKX502A001/GLGBM-138668/Mr Slim Air/AIR10/KP3BS /ZAPSMT SL-2301/MSY-GT15VF/MSY-GT15VF อะไหล่แอร์</div>
                  <div><strong>price:</strong> 70 บาท</div>
                  <div><strong>global_brand:</strong> Mitsubishi(มิตซูบิชิ)</div>
                  <div><strong>global_category1:</strong> Home Appliances</div>
                  <div><strong>global_category2:</strong> Remote Controls</div>
                  <div><strong>shop_name:</strong> KSPTHAI</div>
                  <div><strong>shop_rating:</strong> 4.83 ⭐</div>
                  <div><strong>item_rating:</strong> 5 ⭐</div>
                  <div><strong>stock:</strong> 41 ชิ้น</div>
                  <div><strong>item_sold:</strong> 1 ชิ้น</div>
                  <div className="mt-2 p-2 bg-white rounded border">
                    <strong>ข้อมูลที่แปลงแล้ว:</strong>
                    <div className="text-xs font-mono text-green-800">
                      • แบรนด์: Mitsubishi<br/>
                      • หมวดหมู่: air (เครื่องปรับอากาศ)<br/>
                      • ราคา: 70 บาท<br/>
                      • คะแนน: 5 ⭐<br/>
                      • ร้าน: KSPTHAI (4.83 ⭐)
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Buttons */}
              <div className="flex items-center space-x-2">
                <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
                  <Search className="w-4 h-4 mr-2" />
                  ค้นหา
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleResetSearch}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  รีเซ็ต
                </Button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-red-700">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSearch}
                className="mt-2"
              >
                ลองใหม่
              </Button>
            </div>
          )}

          {/* Search Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                ผลการค้นหา
              </h3>
              {!loading && shopeeProducts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    พบ {totalResults.toLocaleString()} รายการ
                  </span>
                  <Badge variant="outline">
                    หน้า {currentPage} / {Math.ceil(totalResults / itemsPerPage)}
                  </Badge>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">กำลังค้นหาสินค้า...</p>
              </div>
            ) : shopeeProducts.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ไม่พบสินค้าที่ตรงกับการค้นหา</p>
                <p className="text-sm text-gray-400 mt-1">
                  ลองปรับเปลี่ยนคำค้นหาหรือเงื่อนไขการค้นหา
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {shopeeProducts.map((product, index) => {
                  const confidenceScore = calculateConfidenceScore(product)
                  return (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Product Header */}
                          <div className="flex items-center space-x-2 mb-3">
                            <h4 className="font-semibold text-gray-900 flex-1">
                              {product.name}
                            </h4>
                            <Badge 
                              variant={confidenceScore > 0.8 ? 'default' : confidenceScore > 0.6 ? 'secondary' : 'outline'}
                              className="shrink-0"
                            >
                              {Math.round(confidenceScore * 100)}% ตรงกัน
                            </Badge>
                          </div>
                          
                          {/* Product Details */}
                          <div className="grid gap-3 md:grid-cols-2 mb-3">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                {product.rating} ({product.review_count.toLocaleString()} รีวิว)
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {formatPrice(product.price)}
                                {product.original_price > product.price && (
                                  <span className="ml-2 text-xs text-gray-400 line-through">
                                    {formatPrice(product.original_price)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">แบรนด์:</span> {product.brand || '-'}
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">รุ่น:</span> {product.model || '-'}
                              </div>
                            </div>
                          </div>

                          {/* Discount Badge */}
                          {product.discount_percentage > 0 && (
                            <div className="mb-3">
                              <Badge variant="destructive">
                                ลด {product.discount_percentage}%
                              </Badge>
                            </div>
                          )}

                          {/* Category and URL */}
                          <div className="mb-3 space-y-1">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">หมวดหมู่:</span> {getCategoryDisplayName(product.category)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              <span className="font-medium">URL:</span> {product.shopee_url}
                            </div>
                          </div>

                          {/* Product Specifications Preview */}
                          {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs font-medium text-gray-600 mb-2">ข้อมูลเพิ่มเติม:</p>
                              <div className="grid gap-1 md:grid-cols-2 text-xs text-gray-600">
                                {/* Show key specifications first */}
                                {product.specifications.stock && (
                                  <div>
                                    <span className="font-medium">สต็อก:</span> {product.specifications.stock.toLocaleString()} ชิ้น
                                  </div>
                                )}
                                {product.specifications.item_sold && (
                                  <div>
                                    <span className="font-medium">ขายแล้ว:</span> {product.specifications.item_sold.toLocaleString()} ชิ้น
                                  </div>
                                )}
                                {product.specifications.shop_rating && (
                                  <div>
                                    <span className="font-medium">คะแนนร้าน:</span> {product.specifications.shop_rating} ⭐
                                  </div>
                                )}
                                {product.specifications.shop_name && (
                                  <div>
                                    <span className="font-medium">ร้าน:</span> {product.specifications.shop_name}
                                  </div>
                                )}
                                {product.specifications.shopee_verified_flag && (
                                  <div>
                                    <span className="font-medium">สถานะ:</span> {product.specifications.shopee_verified_flag}
                                  </div>
                                )}
                                {product.specifications.is_preferred_shop && (
                                  <div>
                                    <span className="font-medium">ร้านแนะนำ:</span> {product.specifications.is_preferred_shop}
                                  </div>
                                )}
                              </div>
                              
                              {/* Show other specifications */}
                              {Object.entries(product.specifications)
                                .filter(([key]) => !['stock', 'item_sold', 'shop_rating', 'shop_name', 'shopee_verified_flag', 'is_preferred_shop'].includes(key))
                                .slice(0, 2) // Show only 2 more specs
                                .map(([key, value]) => (
                                  <div key={key} className="mt-2">
                                    <span className="font-medium text-gray-700">{key}:</span> 
                                    <span className="text-gray-600 ml-1">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Select Button */}
                        <div className="ml-4">
                          <Button
                            onClick={() => onProductSelect(product, confidenceScore)}
                            disabled={externalLoading}
                            className="shrink-0"
                          >
                            เลือก
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* Pagination */}
                <PaginationComponent />
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack}>
              ย้อนกลับ
            </Button>
            
            {shopeeProducts.length === 0 && !loading && (
              <Button 
                variant="outline" 
                onClick={handleSearch}
              >
                ค้นหาใหม่
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

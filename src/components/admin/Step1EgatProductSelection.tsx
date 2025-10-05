'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Package, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'
import { EGATProduct } from '@/types'
import { formatPrice, getEnergyRatingColor } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Step1Props {
  onProductSelect: (product: EGATProduct) => void
  loading: boolean
}

export default function Step1EgatProductSelection({ onProductSelect, loading: externalLoading }: Step1Props) {
  // State for products and filters
  const [egatProducts, setEgatProducts] = useState<EGATProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedEfficiency, setSelectedEfficiency] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Available options for filters
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [efficiencyLevels, setEfficiencyLevels] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  
  // Dynamic filters based on category
  const [categorySpecificFilters, setCategorySpecificFilters] = useState<{[key: string]: string[]}>({})
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<{[key: string]: string}>({})

  // Expanded details state
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchEgatProducts()
    fetchFilterOptions()
  }, [])

  // Fetch data when filters change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEgatProducts()
    }, searchTerm ? 500 : 0) // Debounce search by 500ms
    
    return () => clearTimeout(timeoutId)
  }, [
    searchTerm, 
    selectedCategory, 
    selectedBrand, 
    selectedEfficiency, 
    selectedType,
    priceRange.min, 
    priceRange.max, 
    sortBy, 
    sortOrder, 
    currentPage, 
    JSON.stringify(selectedCategoryFilters)
  ])

  // Fetch category-specific filters when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchCategorySpecificFilters(selectedCategory)
    } else {
      setCategorySpecificFilters({})
      setSelectedCategoryFilters({})
    }
  }, [selectedCategory])

  const fetchFilterOptions = async () => {
    try {
      // Get unique categories, brands, efficiency levels, and types from raw_data
      const { data, error } = await supabase
        .from('egat_products')
        .select('category, brand, energy_efficiency_level, raw_data')
      
      if (error) throw error
      
      const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))]
      const uniqueBrands = [...new Set(data.map(item => item.brand).filter(Boolean))]
      const uniqueEfficiencies = [...new Set(data.map(item => item.energy_efficiency_level).filter(Boolean))]
      
      // Extract types from raw_data
      const uniqueTypes = new Set<string>()
      data.forEach(item => {
        if (item.raw_data) {
          const type = item.raw_data.ชนิด || item.raw_data.type
          if (type) {
            uniqueTypes.add(type)
          }
        }
      })
      
      setCategories(uniqueCategories.sort())
      setBrands(uniqueBrands.sort())
      setEfficiencyLevels(uniqueEfficiencies.sort())
      setTypes(Array.from(uniqueTypes).sort())
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const fetchCategorySpecificFilters = async (category: string) => {
    try {
      console.log('🎯 Fetching category-specific filters for:', category)
      
      // Get all products in this category to analyze their raw_data
      const { data, error } = await supabase
        .from('egat_products')
        .select('raw_data')
        .eq('category', category)
        .not('raw_data', 'is', null)
      
      if (error) {
        console.error('❌ Error fetching category data:', error)
        throw error
      }
      
      console.log('📊 Found products in category:', data?.length)
      
      // Define which fields to extract for each category
      const categoryFieldMap: { [key: string]: string[] } = {
        'air': ['air_type', 'cooling_capacity', 'heating_capacity', 'room_size'],
        'ref': ['refrigerator_type', 'capacity_liters', 'door_type', 'defrost_type'],
        'washer': ['washer_type', 'capacity_kg', 'wash_programs', 'spin_speed'],
        'heat': ['heater_type', 'capacity_liters', 'heating_method', 'tank_type'],
        'dryer': ['dryer_type', 'capacity_kg', 'heat_source', 'programs'],
        'micro': ['microwave_type', 'capacity_liters', 'power_watts', 'features'],
        'tvp': ['display_type', 'screen_size', 'resolution', 'smart_features']
      }
      
      const fieldsToExtract = categoryFieldMap[category] || []
      console.log('🔍 Fields to extract:', fieldsToExtract)
      
      const filters: { [key: string]: string[] } = {}
      
      // Extract unique values for each field
      fieldsToExtract.forEach(field => {
        const values = new Set<string>()
        
        data.forEach(item => {
          if (item.raw_data && typeof item.raw_data === 'object') {
            const value = item.raw_data[field]
            if (value && typeof value === 'string') {
              values.add(value)
            } else if (Array.isArray(value)) {
              value.forEach(v => v && values.add(String(v)))
            } else if (value !== null && value !== undefined) {
              values.add(String(value))
            }
          }
        })
        
        if (values.size > 0) {
          filters[field] = Array.from(values).sort()
          console.log(`   ✅ ${field}: ${Array.from(values).join(', ')}`)
        } else {
          console.log(`   ❌ ${field}: No values found`)
        }
      })
      
      console.log('🎛️ Final filters:', filters)
      setCategorySpecificFilters(filters)
      // Reset selected filters when category changes
      setSelectedCategoryFilters({})
      
    } catch (error) {
      console.error('❌ Error fetching category-specific filters:', error)
    }
  }

  const fetchEgatProducts = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔍 Fetching with filters:', {
        searchTerm,
        selectedCategory,
        selectedBrand,
        selectedEfficiency,
        selectedType,
        priceRange,
        selectedCategoryFilters,
        sortBy,
        sortOrder,
        currentPage
      })
      
      // Build query
      let query = supabase
        .from('egat_products')
        .select(`
          id,
          category,
          brand,
          model,
          energy_efficiency_level,
          annual_electricity_cost,
          co2_reduction,
          data_quality_score,
          raw_data,
          created_at,
          updated_at
        `, { count: 'exact' })

      // Apply search filter
      if (searchTerm.trim()) {
        console.log('📝 Applying search filter:', searchTerm)
        query = query.or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      }

      // Apply category filter
      if (selectedCategory) {
        console.log('📂 Applying category filter:', selectedCategory)
        query = query.eq('category', selectedCategory)
      }

      // Apply brand filter
      if (selectedBrand) {
        console.log('🏷️ Applying brand filter:', selectedBrand)
        query = query.eq('brand', selectedBrand)
      }

      // Apply efficiency filter
      if (selectedEfficiency) {
        console.log('⚡ Applying efficiency filter:', selectedEfficiency)
        query = query.eq('energy_efficiency_level', selectedEfficiency)
      }

      // Apply type filter from raw_data
      if (selectedType) {
        console.log('🏷️ Applying type filter:', selectedType)
        query = query.eq('raw_data->>ชนิด', selectedType)
      }

      // Apply price range filter
      if (priceRange.min) {
        console.log('💰 Applying min price filter:', priceRange.min)
        query = query.gte('annual_electricity_cost', parseFloat(priceRange.min))
      }
      if (priceRange.max) {
        console.log('💰 Applying max price filter:', priceRange.max)
        query = query.lte('annual_electricity_cost', parseFloat(priceRange.max))
      }

      // Apply category-specific filters
      if (selectedCategory && Object.keys(selectedCategoryFilters).length > 0) {
        console.log('🎯 Applying category-specific filters:', selectedCategoryFilters)
        Object.entries(selectedCategoryFilters).forEach(([field, value]) => {
          if (value) {
            console.log(`   - ${field}: ${value}`)
            // Use raw_data->>field to query JSON field
            query = query.eq(`raw_data->>${field}`, value)
          }
        })
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      console.log('🔄 Executing query...')
      const { data, error, count } = await query

      if (error) {
        console.error('❌ Query error:', error)
        throw error
      }

      console.log('✅ Query successful:', { count, dataLength: data?.length })

      // Transform data to EGATProduct format
      const transformedProducts: EGATProduct[] = (data || []).map(item => {
        // Extract model from raw_data if model column is null
        const modelFromRawData = item.raw_data?.รุ่น || item.raw_data?.model || item.model || ''
        const typeFromRawData = item.raw_data?.ชนิด || item.raw_data?.type || ''
        
        return {
          id: item.id.toString(),
          name: `${item.brand} ${modelFromRawData}`.trim(),
          brand: item.brand || '',
          model: modelFromRawData,
          category: item.category || '',
          energy_rating: item.energy_efficiency_level || 'A',
          energy_consumption: item.annual_electricity_cost || 0,
          annual_savings_kwh: 0, // Calculate if needed
          annual_savings_baht: item.annual_electricity_cost || 0,
          recommended_price: 0, // Not available in current schema
          certification_date: item.created_at || new Date().toISOString(),
          specifications: {
            ...item.raw_data,
            data_quality_score: item.data_quality_score,
            co2_reduction: item.co2_reduction,
            annual_electricity_cost: item.annual_electricity_cost,
            energy_efficiency_level: item.energy_efficiency_level,
            // Add type from raw_data for filtering
            type: typeFromRawData
          },
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        }
      })

      setEgatProducts(transformedProducts)
      setTotalItems(count || 0)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
      
    } catch (error: any) {
      console.error('❌ Error fetching EGAT products from Supabase:', error)
      setError('ไม่สามารถโหลดข้อมูลสินค้า EGAT ได้: ' + error.message)
      setEgatProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Filter handlers
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedBrand('')
    setSelectedEfficiency('')
    setSelectedType('')
    setPriceRange({ min: '', max: '' })
    setSelectedCategoryFilters({})
    setCurrentPage(1)
  }

  const handleCategoryFilterChange = (field: string, value: string) => {
    console.log('🎛️ Category filter changed:', { field, value })
    setSelectedCategoryFilters(prev => {
      const newFilters = {
        ...prev,
        [field]: value
      }
      console.log('🎛️ New category filters:', newFilters)
      return newFilters
    })
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const getFieldDisplayName = (field: string): string => {
    const fieldTranslations: { [key: string]: string } = {
      // Air conditioner fields
      'air_type': 'ประเภทแอร์',
      'cooling_capacity': 'ความสามารถในการทำความเย็น',
      'heating_capacity': 'ความสามารถในการทำความร้อน',
      'room_size': 'ขนาดห้อง',
      
      // Refrigerator fields
      'refrigerator_type': 'ประเภทตู้เย็น',
      'capacity_liters': 'ความจุ (ลิตร)',
      'door_type': 'ประเภทประตู',
      'defrost_type': 'ระบบละลายน้ำแข็ง',
      
      // Washing machine fields
      'washer_type': 'ประเภทเครื่องซักผ้า',
      'capacity_kg': 'ความจุ (กิโลกรัม)',
      'wash_programs': 'โปรแกรมซัก',
      'spin_speed': 'ความเร็วปั่นแห้ง',
      
      // Water heater fields
      'heater_type': 'ประเภทเครื่องทำน้ำอุ่น',
      'heating_method': 'วิธีการทำความร้อน',
      'tank_type': 'ประเภทถัง',
      
      // Dryer fields
      'dryer_type': 'ประเภทเครื่องอบผ้า',
      'heat_source': 'แหล่งความร้อน',
      'programs': 'โปรแกรม',
      
      // Microwave fields
      'microwave_type': 'ประเภทไมโครเวฟ',
      'power_watts': 'กำลังไฟ (วัตต์)',
      'features': 'คุณสมบัติ',
      
      // TV fields
      'display_type': 'ประเภทจอแสดงผล',
      'screen_size': 'ขนาดหน้าจอ',
      'resolution': 'ความละเอียด',
      'smart_features': 'ฟีเจอร์สมาร์ท'
    }

    return fieldTranslations[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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

  // Toggle expanded product details
  const toggleProductDetails = (productId: string) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  // Expand/Collapse all products
  const toggleAllProducts = () => {
    if (expandedProducts.size === egatProducts.length) {
      // Collapse all
      setExpandedProducts(new Set())
    } else {
      // Expand all
      setExpandedProducts(new Set(egatProducts.map(p => p.id)))
    }
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
      <div className="space-y-4">
        {/* Priority Information */}
        {priorityEntries.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              ข้อมูลสำคัญ
            </h5>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {priorityEntries.map(([key, value]) => (
                <div key={key} className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
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
              <h5 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                ข้อมูลเพิ่มเติม
              </h5>
            )}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {otherEntries.map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg">
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

  // Pagination component
  const PaginationComponent = () => (
    <div className="flex items-center justify-between mt-6">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">
          แสดง {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems} รายการ
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5" />
          เลือกสินค้า EGAT ({totalItems} รายการ)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div>
              <Label htmlFor="search">ค้นหา</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="ค้นหาด้วยชื่อ แบรนด์ หรือรุ่น..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Label htmlFor="category">หมวดหมู่</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryDisplayName(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <Label htmlFor="brand">ยี่ห้อ</Label>
              <select
                id="brand"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกยี่ห้อ</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <Label htmlFor="type">ชนิด</Label>
              <select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกชนิด</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Efficiency Filter */}
            <div>
              <Label htmlFor="efficiency">ระดับประหยัดไฟ</Label>
              <select
                id="efficiency"
                value={selectedEfficiency}
                onChange={(e) => setSelectedEfficiency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกระดับ</option>
                {efficiencyLevels.map((level) => (
                  <option key={level} value={level}>
                    เบอร์ {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category-Specific Filters */}
          {selectedCategory && Object.keys(categorySpecificFilters).length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Info className="w-4 h-4 mr-1" />
                ตัวกรองเฉพาะ{getCategoryDisplayName(selectedCategory)}
              </h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(categorySpecificFilters).map(([field, options]) => (
                  <div key={field}>
                    <Label htmlFor={field}>{getFieldDisplayName(field)}</Label>
                    <select
                      id={field}
                      value={selectedCategoryFilters[field] || ''}
                      onChange={(e) => handleCategoryFilterChange(field, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">ทั้งหมด</option>
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Range and Sort */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Price Range */}
            <div>
              <Label>ช่วงค่าไฟต่อปี (บาท)</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="ต่ำสุด"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="สูงสุด"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <Label htmlFor="sortBy">เรียงตาม</Label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">วันที่สร้าง</option>
                <option value="brand">ยี่ห้อ</option>
                <option value="model">รุ่น</option>
                <option value="annual_electricity_cost">ค่าไฟต่อปี</option>
                <option value="data_quality_score">คะแนนคุณภาพ</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <Label htmlFor="sortOrder">ลำดับ</Label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">มากไปน้อย</option>
                <option value="asc">น้อยไปมาก</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <div className="w-full">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  ล้างตัวกรอง
                  {(searchTerm || selectedCategory || selectedBrand || selectedEfficiency || selectedType || priceRange.min || priceRange.max || Object.keys(selectedCategoryFilters).some(key => selectedCategoryFilters[key])) && (
                    <Badge variant="destructive" className="ml-2">
                      {[
                        searchTerm && 'ค้นหา',
                        selectedCategory && 'หมวดหมู่',
                        selectedBrand && 'ยี่ห้อ',
                        selectedType && 'ชนิด',
                        selectedEfficiency && 'ประหยัดไฟ',
                        (priceRange.min || priceRange.max) && 'ราคา',
                        ...Object.keys(selectedCategoryFilters).filter(key => selectedCategoryFilters[key])
                      ].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
              </div>
            ) : egatProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ไม่พบข้อมูลสินค้า EGAT</p>
                <p className="text-sm text-gray-400 mt-1">ลองปรับเปลี่ยนเงื่อนไขการค้นหา</p>
              </div>
            ) : (
              <>
                {/* Results Header with Expand/Collapse All */}
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      พบ {egatProducts.length} รายการ
                    </div>
                    {selectedCategory && (
                      <Badge variant="outline" className="text-xs">
                        {getCategoryDisplayName(selectedCategory)}
                      </Badge>
                    )}
                    {Object.entries(selectedCategoryFilters).filter(([_, value]) => value).map(([field, value]) => (
                      <Badge key={field} variant="secondary" className="text-xs">
                        {getFieldDisplayName(field)}: {value}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAllProducts}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {expandedProducts.size === egatProducts.length ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        ยุบทั้งหมด
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        ขยายทั้งหมด
                      </>
                    )}
                  </Button>
                </div>

                {egatProducts.map((product) => {
                  const isExpanded = expandedProducts.has(product.id)
                  return (
                    <div key={product.id} className="border rounded-lg hover:shadow-md transition-shadow">
                      {/* Main Product Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline" className={getEnergyRatingColor(product.energy_rating)}>
                                เบอร์ {product.energy_rating}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {getCategoryDisplayName(product.category)}
                              </span>
                              <span className="text-sm text-gray-600">
                                ค่าไฟ: {formatPrice(product.energy_consumption)}/ปี
                              </span>
                              {product.specifications?.data_quality_score && (
                                <Badge variant="secondary">
                                  คุณภาพ: {product.specifications.data_quality_score}%
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              สร้างเมื่อ: {new Date(product.created_at).toLocaleDateString('th-TH')}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Details Toggle Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleProductDetails(product.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Info className="w-4 h-4 mr-1" />
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  ซ่อน
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  รายละเอียด
                                </>
                              )}
                            </Button>
                            
                            {/* Select Button */}
                            <Button
                              onClick={() => onProductSelect(product)}
                              disabled={externalLoading}
                            >
                              เลือก
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t bg-gray-50 p-4">
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Package className="w-4 h-4 mr-1" />
                              รายละเอียดเพิ่มเติม
                            </h4>
                            <RawDataDisplay 
                              rawData={product.specifications} 
                              productName={product.name}
                            />
                          </div>
                          
                          {/* Additional calculated info */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="grid gap-2 md:grid-cols-3 text-xs text-gray-600">
                              <div>
                                <span className="font-medium">ID:</span> {product.id}
                              </div>
                              <div>
                                <span className="font-medium">แบรนด์:</span> {product.brand || '-'}
                              </div>
                              <div>
                                <span className="font-medium">รุ่น:</span> {product.model || '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {/* Pagination */}
                <PaginationComponent />
              </>
            )}
          </div>

          {error && (
            <div className="text-center py-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

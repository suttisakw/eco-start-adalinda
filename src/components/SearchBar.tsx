'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter, Zap } from 'lucide-react'
import { debounce } from '@/lib/utils'
import CategorySlider from './CategorySlider'

interface SearchBarProps {
  placeholder?: string
  showFilters?: boolean
  showCategorySlider?: boolean
  onFilterChange?: (filters: any) => void
  className?: string
  autoNavigate?: boolean
}

export default function SearchBar({ 
  placeholder = "ค้นหาเครื่องใช้ไฟฟ้าเบอร์ 5...",
  showFilters = true,
  showCategorySlider = true,
  onFilterChange,
  className = "",
  autoNavigate = false
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    energy_rating: searchParams.getAll('rating') || [],
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.getAll('brand') || []
  })

  // Debounced search
  const debouncedSearch = debounce((searchQuery: string) => {
    const params = new URLSearchParams()
    if (searchQuery) {
      params.set('q', searchQuery)
    }
    
    // Add filters to URL
    if (filters.energy_rating.length > 0) {
      filters.energy_rating.forEach(rating => params.append('rating', rating))
    }
    if (filters.price_min) params.set('price_min', filters.price_min)
    if (filters.price_max) params.set('price_max', filters.price_max)
    if (filters.category) params.set('category', filters.category)
    if (filters.brand.length > 0) {
      filters.brand.forEach(brand => params.append('brand', brand))
    }

    router.push(`/search?${params.toString()}`)
  }, 300)

  useEffect(() => {
    // Only auto-navigate when explicitly enabled or already on /search
    const shouldAutoNavigate = autoNavigate || pathname.startsWith('/search')
    if (!shouldAutoNavigate) return
    if (query !== searchParams.get('q')) {
      debouncedSearch(query)
    }
  }, [query, autoNavigate, pathname])

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters)
    }
  }, [filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    debouncedSearch(query)
  }

  const clearFilters = () => {
    setFilters({
      energy_rating: [],
      price_min: '',
      price_max: '',
      category: '',
      brand: []
    })
    setQuery('')
    router.push('/search')
  }

  const toggleEnergyRating = (rating: string) => {
    setFilters(prev => ({
      ...prev,
      energy_rating: prev.energy_rating.includes(rating)
        ? prev.energy_rating.filter(r => r !== rating)
        : [...prev.energy_rating, rating]
    }))
  }

  const handleCategorySelect = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: category
    }))
  }

  const energyRatings = [
    { value: 'A', label: 'เบอร์ A', color: 'bg-green-100 text-green-800' },
    { value: 'B', label: 'เบอร์ B', color: 'bg-blue-100 text-blue-800' },
    { value: 'C', label: 'เบอร์ C', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'D', label: 'เบอร์ D', color: 'bg-orange-100 text-orange-800' },
    { value: 'E', label: 'เบอร์ E', color: 'bg-red-100 text-red-800' }
  ]

  const categories = [
    { value: 'refrigerator', label: 'ตู้เย็น' },
    { value: 'air-conditioner', label: 'แอร์' },
    { value: 'washing-machine', label: 'เครื่องซักผ้า' },
    { value: 'microwave', label: 'ไมโครเวฟ' },
    { value: 'water-heater', label: 'เครื่องทำน้ำอุ่น' },
    { value: 'fan', label: 'พัดลม' },
    { value: 'hair-dryer', label: 'เครื่องเป่าผม' },
    { value: 'tv', label: 'ทีวี' },
    { value: 'water-pump', label: 'ปั๊มน้ำ' }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-12 py-4 text-lg border-2 focus:border-primary-300 rounded-xl shadow-soft"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <Button type="submit" className="mt-4 w-full h-12 bg-primary-600 hover:bg-primary-700 shadow-medium hover:shadow-large transition-all duration-300 text-base font-medium">
          <Search className="w-5 h-5 mr-2" />
          ค้นหา
        </Button>
      </form>

      {/* Category Slider */}
      {showCategorySlider && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            หมวดหมู่สินค้า
          </h3>
          <CategorySlider 
            onCategorySelect={handleCategorySelect}
            selectedCategory={filters.category}
          />
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              ตัวกรอง
            </h3>
            {(filters.energy_rating.length > 0 || filters.price_min || filters.price_max || filters.category || filters.brand.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                ล้างตัวกรอง
              </Button>
            )}
          </div>

          {/* Energy Rating Filter */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              ระดับประหยัดไฟ
            </label>
            <div className="flex flex-wrap gap-2">
              {energyRatings.map((rating) => (
                <button
                  key={rating.value}
                  type="button"
                  onClick={() => toggleEnergyRating(rating.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.energy_rating.includes(rating.value)
                      ? rating.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Zap className="w-3 h-3 mr-1 inline" />
                  {rating.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              ช่วงราคา (บาท)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="ราคาต่ำสุด"
                value={filters.price_min}
                onChange={(e) => setFilters(prev => ({ ...prev, price_min: e.target.value }))}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="ราคาสูงสุด"
                value={filters.price_max}
                onChange={(e) => setFilters(prev => ({ ...prev, price_max: e.target.value }))}
                className="text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              หมวดหมู่
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {(filters.energy_rating.length > 0 || filters.price_min || filters.price_max || filters.category || filters.brand.length > 0) && (
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                ตัวกรองที่ใช้งาน
              </label>
              <div className="flex flex-wrap gap-2">
                {filters.energy_rating.map((rating) => (
                  <Badge key={rating} variant="secondary" className="text-xs">
                    เบอร์ {rating}
                    <button
                      onClick={() => toggleEnergyRating(rating)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {filters.category && (
                  <Badge variant="secondary" className="text-xs">
                    {categories.find(c => c.value === filters.category)?.label}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {(filters.price_min || filters.price_max) && (
                  <Badge variant="secondary" className="text-xs">
                    ราคา {filters.price_min || '0'} - {filters.price_max || '∞'}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, price_min: '', price_max: '' }))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

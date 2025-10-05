'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Package, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Refrigerator,
  Wind,
  WashingMachine,
  Microwave,
  Droplets,
  Fan,
  Zap as HairDryer,
  Tv,
  Waves
} from 'lucide-react'
import { CategoryService, CategoryStats } from '@/lib/categoryService'

interface Category {
  name: string
  slug: string
  icon: any
  count: number
  description: string
  color: string
}

interface CategorySliderProps {
  onCategorySelect?: (category: string) => void
  selectedCategory?: string
  className?: string
}

export default function CategorySlider({ 
  onCategorySelect, 
  selectedCategory = '',
  className = '' 
}: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Icon mapping for categories
  const categoryIcons: Record<string, any> = {
    'refrigerator': Refrigerator,
    'air-conditioner': Wind,
    'washing-machine': WashingMachine,
    'microwave': Microwave,
    'water-heater': Droplets,
    'fan': Fan,
    'hair-dryer': HairDryer,
    'tv': Tv,
    'water-pump': Waves
  }

  // Color mapping for categories
  const categoryColors: Record<string, string> = {
    'refrigerator': 'from-blue-100 to-blue-200',
    'air-conditioner': 'from-cyan-100 to-cyan-200',
    'washing-machine': 'from-purple-100 to-purple-200',
    'microwave': 'from-orange-100 to-orange-200',
    'water-heater': 'from-red-100 to-red-200',
    'fan': 'from-green-100 to-green-200',
    'hair-dryer': 'from-pink-100 to-pink-200',
    'tv': 'from-indigo-100 to-indigo-200',
    'water-pump': 'from-teal-100 to-teal-200'
  }

  useEffect(() => {
    fetchCategoryStats()
  }, [])

  const fetchCategoryStats = async () => {
    try {
      setLoading(true)
      const categoryStats = await CategoryService.getCategoryStats()
      
      // Calculate total products
      const totalProducts = categoryStats.reduce((sum, stat) => sum + stat.count, 0)
      
      // Create categories array with real data
      const categoriesWithData: Category[] = [
        {
          name: 'ทั้งหมด',
          slug: '',
          icon: Package,
          count: totalProducts,
          description: 'สินค้าทั้งหมด',
          color: 'from-gray-100 to-gray-200'
        },
        ...categoryStats.map(stat => ({
          name: stat.category,
          slug: stat.slug,
          icon: categoryIcons[stat.slug] || Package,
          count: stat.count,
          description: `${stat.category}ประหยัดไฟ`,
          color: categoryColors[stat.slug] || 'from-gray-100 to-gray-200'
        }))
      ]
      
      setCategories(categoriesWithData)
    } catch (error) {
      console.error('Error fetching category stats:', error)
      // Fallback to default categories if API fails
      setCategories(getDefaultCategories())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultCategories = (): Category[] => [
    {
      name: 'ทั้งหมด',
      slug: '',
      icon: Package,
      count: 0,
      description: 'สินค้าทั้งหมด',
      color: 'from-gray-100 to-gray-200'
    },
    {
      name: 'ตู้เย็น',
      slug: 'refrigerator',
      icon: Refrigerator,
      count: 0,
      description: 'ตู้เย็นประหยัดไฟ',
      color: 'from-blue-100 to-blue-200'
    },
    {
      name: 'แอร์',
      slug: 'air-conditioner',
      icon: Wind,
      count: 0,
      description: 'แอร์ประหยัดไฟ',
      color: 'from-cyan-100 to-cyan-200'
    },
    {
      name: 'เครื่องซักผ้า',
      slug: 'washing-machine',
      icon: WashingMachine,
      count: 0,
      description: 'เครื่องซักผ้าประหยัดไฟ',
      color: 'from-purple-100 to-purple-200'
    },
    {
      name: 'ไมโครเวฟ',
      slug: 'microwave',
      icon: Microwave,
      count: 0,
      description: 'ไมโครเวฟประหยัดไฟ',
      color: 'from-orange-100 to-orange-200'
    },
    {
      name: 'เครื่องทำน้ำอุ่น',
      slug: 'water-heater',
      icon: Droplets,
      count: 0,
      description: 'เครื่องทำน้ำอุ่นประหยัดไฟ',
      color: 'from-red-100 to-red-200'
    },
    {
      name: 'พัดลม',
      slug: 'fan',
      icon: Fan,
      count: 0,
      description: 'พัดลมประหยัดไฟ',
      color: 'from-green-100 to-green-200'
    },
    {
      name: 'เครื่องเป่าผม',
      slug: 'hair-dryer',
      icon: HairDryer,
      count: 0,
      description: 'เครื่องเป่าผมประหยัดไฟ',
      color: 'from-pink-100 to-pink-200'
    },
    {
      name: 'ทีวี',
      slug: 'tv',
      icon: Tv,
      count: 0,
      description: 'ทีวีประหยัดไฟ',
      color: 'from-indigo-100 to-indigo-200'
    },
    {
      name: 'ปั๊มน้ำ',
      slug: 'water-pump',
      icon: Waves,
      count: 0,
      description: 'ปั๊มน้ำประหยัดไฟ',
      color: 'from-teal-100 to-teal-200'
    }
  ]

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const handleCategoryClick = (slug: string) => {
    if (onCategorySelect) {
      onCategorySelect(slug)
    }
  }

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="flex-shrink-0 w-40 animate-pulse">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Left scroll button */}
      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-medium hover:shadow-large transition-all duration-300"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      {/* Categories container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category, index) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.slug
          
          return (
            <Card
              key={category.slug}
              className={`flex-shrink-0 w-40 cursor-pointer transition-all duration-300 border-0 shadow-soft hover:shadow-medium hover:-translate-y-1 ${
                isSelected 
                  ? 'ring-2 ring-primary-500 shadow-large' 
                  : 'hover:ring-1 hover:ring-primary-200'
              }`}
              onClick={() => handleCategoryClick(category.slug)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 ${
                  isSelected ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    isSelected ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                </div>
                
                <h3 className={`text-sm font-semibold mb-1 transition-colors ${
                  isSelected ? 'text-primary-600' : 'text-gray-900'
                }`}>
                  {category.name}
                </h3>
                
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {category.description}
                </p>
                
                <div className={`text-xs font-medium ${
                  isSelected ? 'text-primary-600' : 'text-gray-600'
                }`}>
                  {category.count} สินค้า
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-medium hover:shadow-large transition-all duration-300"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

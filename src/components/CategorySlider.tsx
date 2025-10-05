'use client'

import { useState, useRef } from 'react'
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

  const categories: Category[] = [
    {
      name: 'ทั้งหมด',
      slug: '',
      icon: Package,
      count: 500,
      description: 'สินค้าทั้งหมด',
      color: 'from-gray-100 to-gray-200'
    },
    {
      name: 'ตู้เย็น',
      slug: 'refrigerator',
      icon: Refrigerator,
      count: 45,
      description: 'ตู้เย็นเบอร์ 5 ประหยัดไฟ',
      color: 'from-blue-100 to-blue-200'
    },
    {
      name: 'แอร์',
      slug: 'air-conditioner',
      icon: Wind,
      count: 38,
      description: 'แอร์ประหยัดไฟเบอร์ 5',
      color: 'from-cyan-100 to-cyan-200'
    },
    {
      name: 'เครื่องซักผ้า',
      slug: 'washing-machine',
      icon: WashingMachine,
      count: 32,
      description: 'เครื่องซักผ้าเบอร์ 5',
      color: 'from-purple-100 to-purple-200'
    },
    {
      name: 'ไมโครเวฟ',
      slug: 'microwave',
      icon: Microwave,
      count: 28,
      description: 'ไมโครเวฟเบอร์ 5',
      color: 'from-orange-100 to-orange-200'
    },
    {
      name: 'เครื่องทำน้ำอุ่น',
      slug: 'water-heater',
      icon: Droplets,
      count: 25,
      description: 'เครื่องทำน้ำอุ่นประหยัดไฟ',
      color: 'from-red-100 to-red-200'
    },
    {
      name: 'พัดลม',
      slug: 'fan',
      icon: Fan,
      count: 22,
      description: 'พัดลมประหยัดไฟ',
      color: 'from-green-100 to-green-200'
    },
    {
      name: 'เครื่องเป่าผม',
      slug: 'hair-dryer',
      icon: HairDryer,
      count: 18,
      description: 'เครื่องเป่าผมเบอร์ 5',
      color: 'from-pink-100 to-pink-200'
    },
    {
      name: 'ทีวี',
      slug: 'tv',
      icon: Tv,
      count: 35,
      description: 'ทีวีประหยัดไฟ',
      color: 'from-indigo-100 to-indigo-200'
    },
    {
      name: 'ปั๊มน้ำ',
      slug: 'water-pump',
      icon: Waves,
      count: 15,
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

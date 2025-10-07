'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Menu, 
  X, 
  Zap, 
  ShoppingCart,
  User,
  Heart,
  BarChart3
} from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)

  useEffect(() => {
    // Load favorite count from localStorage
    const loadFavoriteCount = () => {
      try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
        setFavoriteCount(favorites.length)
      } catch (error) {
        console.error('Error loading favorite count:', error)
      }
    }

    loadFavoriteCount()

    // Listen for storage changes (when favorites are updated in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'favorites') {
        loadFavoriteCount()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const navigation = [
    { name: 'หน้าแรก', href: '/' },
    { name: 'ค้นหาสินค้า', href: '/search' },
    // { name: 'เปรียบเทียบ', href: '/compare' },
    // { name: 'เกี่ยวกับเรา', href: '/about' },
    // { name: 'ติดต่อ', href: '/contact' },
  ]

  return (
    <header className="bg-white shadow-sm border-b">
      {/* Top Bar */}
      <div className="bg-green-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:inline">💚 ประหยัดไฟสูงสุด</span>
              <span className="sm:hidden">💚 ประหยัดไฟ</span>
              <span className="hidden sm:inline">⭐ ข้อมูลจาก EGAT</span>
              <span className="sm:hidden">⭐ EGAT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">เลือกให้คุ้ม.com</h1>
              <p className="text-xs text-gray-600">Energy Efficient</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-900">เลือกให้คุ้ม</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาเครื่องใช้ไฟฟ้าประหยัดไฟ..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/favorites" className="relative">
                <Heart className="w-5 h-5" />
                {favoriteCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {favoriteCount > 9 ? '9+' : favoriteCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="sm">
              <ShoppingCart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาเครื่องใช้ไฟฟ้าประหยัดไฟ..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>



            {/* Mobile Action Buttons */}
            <div className="mt-6 flex space-x-4">
              <Button variant="outline" size="sm" className="flex-1 relative" asChild>
                <Link href="/favorites">
                  <Heart className="w-4 h-4 mr-2" />
                  รายการโปรด
                  {favoriteCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center text-xs p-0"
                    >
                      {favoriteCount > 9 ? '9+' : favoriteCount}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                เปรียบเทียบ
              </Button>
            </div>
          </div>
        </div>
      )}


    </header>
  )
}

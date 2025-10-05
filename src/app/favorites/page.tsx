'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ProductCard from '@/components/ProductCard'
import { 
  Heart, 
  Package, 
  Trash2, 
  ShoppingCart,
  ExternalLink,
  CheckCircle
} from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, formatEnergyRating, getEnergyRatingColor } from '@/lib/utils'
import { ProductService } from '@/lib/productService'

export default function FavoritesPage() {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      
      // Load favorite slugs from localStorage
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setFavoriteSlugs(favorites)
      
      if (favorites.length === 0) {
        setProducts([])
        return
      }
      
      // Fetch products by slugs
      const productPromises = favorites.map(async (slug: string) => {
        try {
          return await ProductService.getProductBySlug(slug)
        } catch (error) {
          console.error(`Error fetching product ${slug}:`, error)
          return null
        }
      })
      
      const fetchedProducts = await Promise.all(productPromises)
      const validProducts = fetchedProducts.filter(product => product !== null) as Product[]
      
      setProducts(validProducts)
    } catch (error) {
      console.error('Error loading favorites:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการโหลดรายการโปรด' })
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = (slug: string) => {
    try {
      const newFavorites = favoriteSlugs.filter(favSlug => favSlug !== slug)
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setFavoriteSlugs(newFavorites)
      setProducts(products.filter(p => p.slug !== slug))
      setMessage({ type: 'success', text: 'ลบออกจากรายการโปรดแล้ว' })
    } catch (error) {
      console.error('Error removing favorite:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการลบรายการโปรด' })
    }
  }

  const clearAllFavorites = () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายการโปรดทั้งหมด?')) return
    
    try {
      localStorage.removeItem('favorites')
      setFavoriteSlugs([])
      setProducts([])
      setMessage({ type: 'success', text: 'ลบรายการโปรดทั้งหมดแล้ว' })
    } catch (error) {
      console.error('Error clearing favorites:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการลบรายการโปรด' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดรายการโปรด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Heart className="w-8 h-8 text-red-500 mr-3" />
              รายการโปรด
            </h1>
            <p className="text-gray-600 mt-2">
              สินค้าที่คุณชื่นชอบ ({products.length} รายการ)
            </p>
          </div>
          
          {products.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearAllFavorites}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              ลบทั้งหมด
            </Button>
          )}
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center">
              <CheckCircle className={`w-4 h-4 mr-2 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Empty State */}
        {products.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ยังไม่มีรายการโปรด
              </h3>
              <p className="text-gray-600 mb-6">
                เพิ่มสินค้าที่คุณชื่นชอบลงในรายการโปรดเพื่อดูที่นี่
              </p>
              <Button asChild>
                <Link href="/search">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  เริ่มค้นหาสินค้า
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getEnergyRatingColor(product.energy_rating || 'A')}>
                          {formatEnergyRating(product.energy_rating || 'A')}
                        </Badge>
                        {product.is_featured && (
                          <Badge variant="default" className="bg-orange-100 text-orange-800">
                            แนะนำ
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(product.slug)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                      title="ลบออกจากรายการโปรด"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_urls?.[0] ? (
                      <img
                        src={product.image_urls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                  
                  {/* Energy Savings */}
                  {product.annual_savings_baht && (
                    <div className="text-sm text-green-600">
                      ประหยัด {formatPrice(product.annual_savings_baht)}/ปี
                    </div>
                  )}
                  
                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <span>⭐ {product.rating}</span>
                      <span>({product.review_count} รีวิว)</span>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/product/${product.slug}`}>
                        ดูรายละเอียด
                      </Link>
                    </Button>
                    
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        if (product.affiliate_url) {
                          window.open(product.affiliate_url, '_blank')
                        } else {
                          window.open(product.shopee_url, '_blank')
                        }
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

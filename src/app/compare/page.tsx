'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import SEOOptimizer from '@/components/SEOOptimizer'
import EnergyBadge from '@/components/EnergyBadge'
import { 
  Package, 
  Zap, 
  DollarSign, 
  Star,
  TrendingUp,
  Plus,
  X,
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Product } from '@/types'
import { SEOGenerator } from '@/lib/seo-generator'
import { formatPrice, calculatePaybackPeriod } from '@/lib/utils'

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load products from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('compare_products')
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts))
      } catch (error) {
        console.error('Error loading compare products:', error)
      }
    }
  }, [])

  // Save products to localStorage
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('compare_products', JSON.stringify(products))
    } else {
      localStorage.removeItem('compare_products')
    }
  }, [products])

  const addProduct = (product: Product) => {
    if (products.length >= 4) {
      setError('สามารถเปรียบเทียบได้สูงสุด 4 สินค้า')
      return
    }
    
    if (products.find(p => p.id === product.id)) {
      setError('สินค้านี้อยู่ในรายการเปรียบเทียบแล้ว')
      return
    }

    setProducts([...products, product])
    setError('')
  }

  const removeProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId))
  }

  const clearAll = () => {
    setProducts([])
    setError('')
  }

  const seoData = SEOGenerator.generateCompareSEO(products)

  const comparisonFields = [
    { key: 'name', label: 'ชื่อสินค้า', type: 'text' },
    { key: 'brand', label: 'แบรนด์', type: 'text' },
    { key: 'price', label: 'ราคา', type: 'price' },
    { key: 'rating', label: 'คะแนน', type: 'rating' },
    { key: 'review_count', label: 'จำนวนรีวิว', type: 'number' },
    { key: 'energy_rating', label: 'ระดับประหยัดไฟ', type: 'energy_rating' },
    { key: 'energy_consumption_kwh', label: 'การใช้ไฟฟ้า (kWh/ปี)', type: 'number' },
    { key: 'annual_savings_baht', label: 'ประหยัดเงิน (บาท/ปี)', type: 'price' },
    { key: 'confidence_score', label: 'ความน่าเชื่อถือ', type: 'percentage' }
  ]

  const renderValue = (product: Product, field: any) => {
    const value = product[field.key as keyof Product]
    
    switch (field.type) {
      case 'price':
        return value ? formatPrice(value as number) : '-'
      case 'rating':
        return value ? (
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{String(value)}</span>
          </div>
        ) : '-'
      case 'energy_rating':
        return value ? <EnergyBadge rating={value as any} size="sm" /> : '-'
      case 'percentage':
        return value ? `${Math.round((value as number) * 100)}%` : '-'
      case 'number':
        return value ? (value as number).toLocaleString() : '-'
      default:
        return String(value || '-')
    }
  }

  return (
    <SEOOptimizer {...seoData}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              เปรียบเทียบสินค้า
            </h1>
            <p className="text-gray-600">
              เปรียบเทียบสินค้าเบอร์ 5 เพื่อเลือกที่เหมาะสมที่สุด
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Product Selection */}
          {products.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ยังไม่มีสินค้าในรายการเปรียบเทียบ
                </h3>
                <p className="text-gray-600 mb-4">
                  เพิ่มสินค้าที่ต้องการเปรียบเทียบจากหน้ารายการสินค้า
                </p>
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  ดูสินค้าทั้งหมด
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {products.length} สินค้าในรายการเปรียบเทียบ
                  </span>
                  {products.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      <X className="w-4 h-4 mr-2" />
                      ล้างทั้งหมด
                    </Button>
                  )}
                </div>
                
                {products.length < 4 && (
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มสินค้า
                  </Button>
                )}
              </div>

              {/* Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    ตารางเปรียบเทียบ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            รายการ
                          </th>
                          {products.map((product) => (
                            <th key={product.id} className="text-center py-3 px-4 min-w-[200px]">
                              <div className="space-y-2">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto overflow-hidden">
                                  {product.image_urls?.[0] ? (
                                    <img
                                      src={product.image_urls[0]}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-8 h-8 text-gray-400 mx-auto mt-4" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                                    {product.name}
                                  </h4>
                                  <div className="flex items-center justify-center mt-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeProduct(product.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonFields.map((field) => (
                          <tr key={field.key} className="border-b">
                            <td className="py-3 px-4 font-medium text-gray-600">
                              {field.label}
                            </td>
                            {products.map((product) => (
                              <td key={product.id} className="py-3 px-4 text-center">
                                <div>{renderValue(product, field)}</div>
                              </td>
                            ))}
                          </tr>
                        ))}
                        
                        {/* Payback Period */}
                        <tr className="border-b">
                          <td className="py-3 px-4 font-medium text-gray-600">
                            ระยะเวลาคืนทุน
                          </td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4 text-center">
                              {product.annual_savings_baht 
                                ? `${calculatePaybackPeriod(product.price, product.annual_savings_baht)} ปี`
                                : '-'
                              }
                            </td>
                          ))}
                        </tr>

                        {/* Actions */}
                        <tr>
                          <td className="py-3 px-4 font-medium text-gray-600">
                            การดำเนินการ
                          </td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4 text-center">
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
                                <DollarSign className="w-4 h-4 mr-1" />
                                ซื้อ
                              </Button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Best Price */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-600">
                      <DollarSign className="mr-2 h-5 w-5" />
                      ราคาดีที่สุด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const cheapest = products.reduce((min, product) => 
                        product.price < min.price ? product : min
                      )
                      return (
                        <div>
                          <h4 className="font-medium text-gray-900">{cheapest.name}</h4>
                          <p className="text-2xl font-bold text-green-600">
                            {formatPrice(cheapest.price)}
                          </p>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Best Rating */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-yellow-600">
                      <Star className="mr-2 h-5 w-5" />
                      คะแนนสูงสุด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const bestRated = products.reduce((max, product) => 
                        product.rating > max.rating ? product : max
                      )
                      return (
                        <div>
                          <h4 className="font-medium text-gray-900">{bestRated.name}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <span className="text-2xl font-bold">{bestRated.rating}</span>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Best Savings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-600">
                      <Zap className="mr-2 h-5 w-5" />
                      ประหยัดมากที่สุด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const mostSavings = products.reduce((max, product) => 
                        (product.annual_savings_baht || 0) > (max.annual_savings_baht || 0) ? product : max
                      )
                      return (
                        <div>
                          <h4 className="font-medium text-gray-900">{mostSavings.name}</h4>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatPrice(mostSavings.annual_savings_baht || 0)}/ปี
                          </p>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </SEOOptimizer>
  )
}

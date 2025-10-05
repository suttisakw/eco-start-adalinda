'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Loader2,
  Zap,
  Package,
  Star,
  DollarSign,
  Calendar,
  Award,
  Eye,
  ExternalLink,
  Share2,
  AlertTriangle
} from 'lucide-react'
import { EGATProduct, ShopeeProduct } from '@/types'
import { formatPrice, formatEnergyRating, getEnergyRatingColor } from '@/lib/utils'

interface Step5Props {
  customizedProduct: any
  selectedEgatProduct: EGATProduct
  selectedShopeeProduct: ShopeeProduct
  confidenceScore: number
  onCreateProduct: () => void
  onBack: () => void
  loading: boolean
}

export default function Step5ProductReview({ 
  customizedProduct,
  selectedEgatProduct,
  selectedShopeeProduct,
  confidenceScore,
  onCreateProduct,
  onBack,
  loading 
}: Step5Props) {
  const [showRawData, setShowRawData] = useState(false)

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

  const generateAffiliateUrl = () => {
    // Get affiliate_id from environment variables
    const affiliateId = process.env.NEXT_PUBLIC_SHOPEE_AFFILIATE_ID || ''
    const timestamp = Date.now()
    const subId = `product_${timestamp}-nc_${timestamp}_n86u24x1v-admin_create-${selectedEgatProduct.id}-${selectedShopeeProduct.item_id}`
    
    return `https://s.shopee.co.th/an_redir?origin_link=${encodeURIComponent(selectedShopeeProduct.shopee_url)}&affiliate_id=${affiliateId}&sub_id=${subId}`
  }

  const getValidationErrors = () => {
    const errors = []
    
    if (!customizedProduct.name?.trim()) {
      errors.push('ชื่อสินค้าห้ามว่าง')
    }
    
    if (!customizedProduct.slug?.trim()) {
      errors.push('URL Slug ห้ามว่าง')
    }
    
    if (!customizedProduct.image_urls?.length) {
      errors.push('ต้องเลือกรูปภาพอย่างน้อย 1 รูป')
    }
    
    if (!customizedProduct.price || customizedProduct.price <= 0) {
      errors.push('ราคาต้องมากกว่า 0')
    }
    
    if (customizedProduct.meta_title?.length > 100) {
      errors.push('Meta Title ต้องไม่เกิน 100 ตัวอักษร')
    }
    
    if (customizedProduct.meta_description?.length > 250) {
      errors.push('Meta Description ต้องไม่เกิน 250 ตัวอักษร')
    }
    
    return errors
  }

  const validationErrors = getValidationErrors()
  const hasErrors = validationErrors.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2 h-5 w-5" />
          ตรวจสอบข้อมูลก่อนสร้างสินค้า
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Validation Errors */}
          {hasErrors && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-red-900">พบข้อผิดพลาด</h3>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Product Summary */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">สินค้าที่จะสร้าง</h3>
              <Badge 
                variant={confidenceScore > 0.8 ? 'default' : confidenceScore > 0.6 ? 'secondary' : 'outline'}
              >
                ความน่าเชื่อถือ {Math.round(confidenceScore * 100)}%
              </Badge>
            </div>
            <p className="text-green-700 font-medium">{customizedProduct.name}</p>
            <p className="text-green-600 text-sm mt-1">
              URL: /product/{customizedProduct.slug}
            </p>
          </div>

          {/* Product Preview */}
          <div className="bg-white border p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              ตัวอย่างสินค้า
            </h3>
            
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Product Images */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">รูปภาพ ({customizedProduct.image_urls?.length || 0} รูป)</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {customizedProduct.image_urls?.slice(0, 4).map((imageUrl: string, index: number) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-image.png'
                        }}
                      />
                      {index === 0 && (
                        <Badge variant="default" className="absolute top-1 left-1 text-xs">
                          หลัก
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{customizedProduct.name}</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className={getEnergyRatingColor(selectedEgatProduct.energy_rating)}>
                      {formatEnergyRating(selectedEgatProduct.energy_rating)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {getCategoryDisplayName(selectedEgatProduct.category)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ราคา:</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatPrice(customizedProduct.price)}
                    </span>
                  </div>
                  
                  {customizedProduct.original_price > customizedProduct.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ราคาเดิม:</span>
                      <span className="text-gray-400 line-through">
                        {formatPrice(customizedProduct.original_price)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">ประหยัดต่อปี:</span>
                    <span className="text-green-600 font-medium">
                      {formatPrice(selectedEgatProduct.annual_savings_baht)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">คะแนน:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{selectedShopeeProduct.rating}</span>
                      <span className="text-sm text-gray-500">
                        ({selectedShopeeProduct.review_count} รีวิว)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {customizedProduct.is_featured && (
                    <Badge variant="default">สินค้าแนะนำ</Badge>
                  )}
                  {customizedProduct.is_flash_sale && (
                    <Badge variant="destructive">แฟลชเซล</Badge>
                  )}
                  <Badge variant="outline">ประหยัดไฟ</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* EGAT Data */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                ข้อมูล EGAT
              </h3>
              
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-blue-700">ชื่อ:</span>
                  <p className="text-blue-900">{selectedEgatProduct.name}</p>
                </div>
                
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium text-blue-700">แบรนด์:</span>
                    <p className="text-blue-900">{selectedEgatProduct.brand}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">รุ่น:</span>
                    <p className="text-blue-900">{selectedEgatProduct.model}</p>
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium text-blue-700">การใช้ไฟ:</span>
                    <p className="text-blue-900">{selectedEgatProduct.energy_consumption} kWh/ปี</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">ประหยัด:</span>
                    <p className="text-blue-900">{formatPrice(selectedEgatProduct.annual_savings_baht)}/ปี</p>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-blue-700">วันที่รับรอง:</span>
                  <p className="text-blue-900">
                    {new Date(selectedEgatProduct.certification_date).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
            </div>

            {/* Shopee Data */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Star className="w-5 h-5 mr-2 text-orange-600" />
                ข้อมูล Shopee
              </h3>
              
              <div className="space-y-3 bg-orange-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-orange-700">ชื่อ:</span>
                  <p className="text-orange-900">{selectedShopeeProduct.name}</p>
                </div>
                
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium text-orange-700">ราคา:</span>
                    <p className="text-orange-900">{formatPrice(selectedShopeeProduct.price)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-orange-700">คะแนน:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-orange-900">{selectedShopeeProduct.rating}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-orange-700">ร้าน:</span>
                  <p className="text-orange-900">{selectedShopeeProduct.specifications?.shop_name}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-orange-700">URL:</span>
                  <p className="text-orange-900 text-xs truncate">{selectedShopeeProduct.shopee_url}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Preview</h3>
            
            <div className="space-y-4">
              {/* Meta Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Meta Title:</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    (customizedProduct.meta_title?.length || 0) > 100 
                      ? 'bg-red-100 text-red-700' 
                      : (customizedProduct.meta_title?.length || 0) > 80
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {customizedProduct.meta_title?.length || 0}/100 ตัวอักษร
                  </span>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-900 font-medium break-words">
                    {customizedProduct.meta_title || 'ยังไม่ได้ตั้งค่า Meta Title'}
                  </p>
                </div>
              </div>
              
              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Meta Description:</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    (customizedProduct.meta_description?.length || 0) > 250 
                      ? 'bg-red-100 text-red-700' 
                      : (customizedProduct.meta_description?.length || 0) > 200
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {customizedProduct.meta_description?.length || 0}/250 ตัวอักษร
                  </span>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-900 break-words leading-relaxed">
                    {customizedProduct.meta_description || 'ยังไม่ได้ตั้งค่า Meta Description'}
                  </p>
                </div>
              </div>
              
              {/* URL */}
              <div>
                <span className="text-sm font-medium text-gray-600 mb-2 block">URL:</span>
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-900 font-mono text-sm break-all">
                    /product/{customizedProduct.slug}
                  </p>
                </div>
              </div>

              {/* SEO Preview Simulation */}
              <div>
                <span className="text-sm font-medium text-gray-600 mb-2 block">ตัวอย่างการแสดงผลใน Google:</span>
                <div className="bg-white p-4 rounded border border-gray-200">
                  <div className="space-y-2">
                    {/* Title in search results */}
                    <div className="text-blue-600 text-lg leading-tight hover:underline cursor-pointer">
                      {customizedProduct.meta_title || customizedProduct.name}
                    </div>
                    
                    {/* URL in search results */}
                    <div className="text-green-700 text-sm">
                      /product/{customizedProduct.slug}
                    </div>
                    
                    {/* Description in search results */}
                    <div className="text-gray-600 text-sm leading-relaxed">
                      {customizedProduct.meta_description || customizedProduct.description || 'คำอธิบายสินค้า...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Affiliate Link Preview */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Share2 className="w-5 h-5 mr-2" />
              Affiliate Link
            </h3>
            
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Short Link:</span>
                <p className="text-gray-900 font-mono text-sm break-all">
                  {generateAffiliateUrl()}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Original URL:</span>
                <p className="text-gray-900 text-sm break-all">
                  {selectedShopeeProduct.shopee_url}
                </p>
              </div>
            </div>
          </div>

          {/* Raw Data Toggle */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Button
              variant="outline"
              onClick={() => setShowRawData(!showRawData)}
              className="w-full"
            >
              {showRawData ? 'ซ่อน' : 'แสดง'} ข้อมูลดิบ
            </Button>
            
            {showRawData && (
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customized Product Data:</h4>
                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                    {JSON.stringify(customizedProduct, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack} disabled={loading}>
              ย้อนกลับ
            </Button>
            
            <Button 
              onClick={onCreateProduct}
              disabled={loading || hasErrors}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสร้างสินค้า...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  สร้างสินค้า
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">ข้อมูลสำคัญ</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• สินค้าจะถูกสร้างในสถานะ "ร่าง" เพื่อให้คุณตรวจสอบก่อนเผยแพร่</li>
                  <li>• Affiliate link จะถูกสร้างโดยอัตโนมัติ</li>
                  <li>• ข้อมูลจะถูกรวมจาก EGAT และ Shopee</li>
                  <li>• คุณสามารถแก้ไขข้อมูลได้ในภายหลัง</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

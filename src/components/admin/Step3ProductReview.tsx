'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Loader2,
  Zap,
  Package,
  Star,
  DollarSign,
  Calendar,
  Award
} from 'lucide-react'
import { EGATProduct, ShopeeProduct } from '@/types'
import { formatPrice, formatEnergyRating, getEnergyRatingColor } from '@/lib/utils'

interface Step3Props {
  selectedEgatProduct: EGATProduct
  selectedShopeeProduct: ShopeeProduct
  confidenceScore: number
  productPreview: any
  onCreateProduct: () => void
  onBack: () => void
  loading: boolean
}

export default function Step3ProductReview({ 
  selectedEgatProduct,
  selectedShopeeProduct,
  confidenceScore,
  productPreview,
  onCreateProduct,
  onBack,
  loading 
}: Step3Props) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2 h-5 w-5" />
          ตรวจสอบและสร้างสินค้า
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
            <p className="text-green-700 font-medium">{productPreview?.name}</p>
          </div>

          {/* Product Details Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* EGAT Product Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                ข้อมูล EGAT
              </h3>
              
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-blue-700">ชื่อสินค้า</Label>
                  <p className="text-blue-900 font-medium">{selectedEgatProduct.name}</p>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-blue-700">แบรนด์</Label>
                    <p className="text-blue-900">{selectedEgatProduct.brand || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-700">รุ่น</Label>
                    <p className="text-blue-900">{selectedEgatProduct.model || '-'}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-blue-700">หมวดหมู่</Label>
                  <p className="text-blue-900">{getCategoryDisplayName(selectedEgatProduct.category)}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-blue-700">ระดับประหยัดไฟ</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={getEnergyRatingColor(selectedEgatProduct.energy_rating)}>
                      {formatEnergyRating(selectedEgatProduct.energy_rating)}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-blue-700">การใช้ไฟฟ้า</Label>
                    <p className="text-blue-900">{selectedEgatProduct.energy_consumption} kWh/ปี</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-700">ประหยัดเงิน</Label>
                    <p className="text-blue-900">{formatPrice(selectedEgatProduct.annual_savings_baht)}/ปี</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-blue-700">วันที่รับรอง</Label>
                  <p className="text-blue-900">
                    {new Date(selectedEgatProduct.certification_date).toLocaleDateString('th-TH')}
                  </p>
                </div>

                {selectedEgatProduct.specifications?.data_quality_score && (
                  <div>
                    <Label className="text-sm font-medium text-blue-700">คะแนนคุณภาพข้อมูล</Label>
                    <p className="text-blue-900">{selectedEgatProduct.specifications.data_quality_score}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shopee Product Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Star className="w-5 h-5 mr-2 text-orange-600" />
                ข้อมูล Shopee
              </h3>
              
              <div className="space-y-3 bg-orange-50 p-4 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-orange-700">ชื่อสินค้า</Label>
                  <p className="text-orange-900 font-medium">{selectedShopeeProduct.name}</p>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-orange-700">แบรนด์</Label>
                    <p className="text-orange-900">{selectedShopeeProduct.brand || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-orange-700">รุ่น</Label>
                    <p className="text-orange-900">{selectedShopeeProduct.model || '-'}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-orange-700">ราคา</Label>
                    <div className="flex items-center space-x-2">
                      <p className="text-orange-900 font-bold">{formatPrice(selectedShopeeProduct.price)}</p>
                      {selectedShopeeProduct.original_price > selectedShopeeProduct.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(selectedShopeeProduct.original_price)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-orange-700">ส่วนลด</Label>
                    <p className="text-orange-900">
                      {selectedShopeeProduct.discount_percentage > 0 
                        ? `${selectedShopeeProduct.discount_percentage}%` 
                        : 'ไม่มี'
                      }
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-orange-700">คะแนน</Label>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <p className="text-orange-900">{selectedShopeeProduct.rating}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-orange-700">จำนวนรีวิว</Label>
                    <p className="text-orange-900">{selectedShopeeProduct.review_count.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-orange-700">หมวดหมู่</Label>
                  <p className="text-orange-900">{getCategoryDisplayName(selectedShopeeProduct.category)}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-orange-700">URL</Label>
                  <p className="text-orange-900 text-xs truncate">{selectedShopeeProduct.shopee_url}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Product Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ตัวอย่างสินค้าที่จะสร้าง</h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">ชื่อสินค้าสุดท้าย</Label>
                <p className="text-gray-900 font-medium">{productPreview?.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">ราคาขาย</Label>
                <p className="text-gray-900 font-bold text-lg">{formatPrice(productPreview?.price)}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">ระดับประหยัดไฟ</Label>
                <div className="mt-1">
                  <Badge variant="outline" className={getEnergyRatingColor(productPreview?.energy_rating)}>
                    {formatEnergyRating(productPreview?.energy_rating)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">ประหยัดต่อปี</Label>
                <p className="text-green-600 font-medium">{formatPrice(productPreview?.annual_savings_baht)}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">คะแนนรีวิว</Label>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <p className="text-gray-900">{productPreview?.rating}</p>
                  <span className="text-sm text-gray-500">({productPreview?.review_count})</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">ความน่าเชื่อถือ</Label>
                <Badge variant={confidenceScore > 0.8 ? 'default' : 'secondary'}>
                  {Math.round(confidenceScore * 100)}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Specifications Preview */}
          {productPreview?.specifications && Object.keys(productPreview.specifications).length > 0 && (
            <div className="bg-white border p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">คุณสมบัติรวม</h4>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
                {Object.entries(productPreview.specifications)
                  .slice(0, 9) // Show first 9 specifications
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="text-gray-900 font-medium">{String(value)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack} disabled={loading}>
              ย้อนกลับ
            </Button>
            
            <Button 
              onClick={onCreateProduct}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสร้าง...
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
                  <li>• ข้อมูลจาก EGAT และ Shopee จะถูกรวมเข้าด้วยกัน</li>
                  <li>• คุณสามารถแก้ไขข้อมูลได้ในภายหลัง</li>
                  <li>• Affiliate link จะถูกสร้างโดยอัตโนมัติ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

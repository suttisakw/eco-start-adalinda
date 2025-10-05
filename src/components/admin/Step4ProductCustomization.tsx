'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Edit3, 
  Loader2,
  Image,
  Star,
  DollarSign,
  Save,
  Eye,
  RefreshCw,
  CheckCircle
} from 'lucide-react'
import { EGATProduct, ShopeeProduct } from '@/types'
import { formatPrice, formatEnergyRating, getEnergyRatingColor } from '@/lib/utils'

interface Step4Props {
  selectedEgatProduct: EGATProduct
  selectedShopeeProduct: ShopeeProduct
  confidenceScore: number
  onProductCustomize: (customizedProduct: any) => void
  onBack: () => void
  loading: boolean
}

export default function Step4ProductCustomization({ 
  selectedEgatProduct,
  selectedShopeeProduct,
  confidenceScore,
  onProductCustomize,
  onBack,
  loading 
}: Step4Props) {
  // Product customization state
  const [customName, setCustomName] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [customPrice, setCustomPrice] = useState(0)
  const [customOriginalPrice, setCustomOriginalPrice] = useState(0)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isFlashSale, setIsFlashSale] = useState(false)
  const [flashSaleEndTime, setFlashSaleEndTime] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [customSlug, setCustomSlug] = useState('')

  // Initialize form with combined data
  useEffect(() => {
    // Generate initial product name
    const initialName = `${selectedEgatProduct.brand} ${selectedEgatProduct.model} - ${selectedShopeeProduct.name}`
    setCustomName(initialName)
    
    // Generate initial description
    const initialDescription = `${selectedEgatProduct.name} - ${selectedShopeeProduct.name}. สินค้าประหยัดไฟระดับ ${formatEnergyRating(selectedEgatProduct.energy_rating)} ประหยัดค่าไฟได้ ${formatPrice(selectedEgatProduct.annual_savings_baht)} ต่อปี`
    setCustomDescription(initialDescription)
    
    // Set initial images (first 3 from Shopee)
    setSelectedImages(selectedShopeeProduct.image_urls.slice(0, 3))
    
    // Set initial prices
    setCustomPrice(selectedShopeeProduct.price)
    setCustomOriginalPrice(selectedShopeeProduct.original_price)
    
    // Generate initial slug
    const initialSlug = generateSlug(initialName)
    setCustomSlug(initialSlug)
    
    // Generate SEO fields
    setMetaTitle(initialName)
    setMetaDescription(initialDescription)
  }, [selectedEgatProduct, selectedShopeeProduct])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (value: string) => {
    setCustomName(value)
    setCustomSlug(generateSlug(value))
    setMetaTitle(value)
  }

  const handleImageToggle = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(img => img !== imageUrl)
      } else if (prev.length < 5) {
        return [...prev, imageUrl]
      }
      return prev
    })
  }

  const handleSaveCustomization = () => {
    const customizedProduct = {
      // Basic Info
      name: customName,
      slug: customSlug,
      description: customDescription,
      
      // Pricing
      price: customPrice,
      original_price: customOriginalPrice,
      discount_percentage: customOriginalPrice > customPrice 
        ? Math.round(((customOriginalPrice - customPrice) / customOriginalPrice) * 100)
        : 0,
      
      // Images
      image_urls: selectedImages,
      
      // Features
      is_featured: isFeatured,
      is_flash_sale: isFlashSale,
      flash_sale_end_time: isFlashSale ? flashSaleEndTime : null,
      
      // SEO
      meta_title: metaTitle,
      meta_description: metaDescription,
      
      // Combined Data
      egat_product: selectedEgatProduct,
      shopee_product: selectedShopeeProduct,
      confidence_score: confidenceScore,
      
      // Status
      status: 'draft'
    }
    
    onProductCustomize(customizedProduct)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Edit3 className="mr-2 h-5 w-5" />
          ปรับแต่งข้อมูลสินค้า
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Product Summary */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Badge 
                variant={confidenceScore > 0.8 ? 'default' : confidenceScore > 0.6 ? 'secondary' : 'outline'}
              >
                ความน่าเชื่อถือ {Math.round(confidenceScore * 100)}%
              </Badge>
              <Badge variant="outline" className={getEnergyRatingColor(selectedEgatProduct.energy_rating)}>
                {formatEnergyRating(selectedEgatProduct.energy_rating)}
              </Badge>
            </div>
            <p className="text-blue-700">
              {getCategoryDisplayName(selectedEgatProduct.category)} | 
              ประหยัด {formatPrice(selectedEgatProduct.annual_savings_baht)}/ปี
            </p>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">ข้อมูลพื้นฐาน</h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="customName">ชื่อสินค้า *</Label>
                <Input
                  id="customName"
                  value={customName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="ใส่ชื่อสินค้า"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ชื่อสินค้าที่จะแสดงในเว็บไซต์
                </p>
              </div>

              <div>
                <Label htmlFor="customSlug">URL Slug</Label>
                <Input
                  id="customSlug"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="url-slug"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /product/{customSlug}
                </p>
              </div>

              <div>
                <Label htmlFor="customDescription">คำอธิบายสินค้า</Label>
                <textarea
                  id="customDescription"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="ใส่คำอธิบายสินค้า"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Image Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Image className="w-5 h-5 mr-2" />
              เลือกรูปภาพ ({selectedImages.length}/5)
            </h3>
            
            <div className="space-y-3">
              {selectedShopeeProduct.image_urls.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    selectedImages.includes(imageUrl)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleImageToggle(imageUrl)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Small Preview Image */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover rounded border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-image.png'
                        }}
                      />
                      {selectedImages.includes(imageUrl) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Image Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          รูป {index + 1}
                        </Badge>
                        {selectedImages.includes(imageUrl) && (
                          <Badge variant="default" className="text-xs">
                            เลือกแล้ว
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-600 break-all">
                        {imageUrl}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        คลิกเพื่อ {selectedImages.includes(imageUrl) ? 'ยกเลิกการเลือก' : 'เลือก'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedImages.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Image className="w-8 h-8 mx-auto mb-2" />
                <p>กรุณาเลือกรูปภาพอย่างน้อย 1 รูป</p>
              </div>
            )}

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">รูปภาพที่เลือก ({selectedImages.length} รูป):</h4>
                <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
                  {selectedImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Selected image ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-image.png'
                        }}
                      />
                      <div className="absolute top-1 left-1">
                        <Badge variant="default" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                      <button
                        onClick={() => handleImageToggle(imageUrl)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        title="ลบรูปภาพ"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              ราคา
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="customPrice">ราคาขาย *</Label>
                <Input
                  id="customPrice"
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="customOriginalPrice">ราคาเดิม</Label>
                <Input
                  id="customOriginalPrice"
                  type="number"
                  value={customOriginalPrice}
                  onChange={(e) => setCustomOriginalPrice(Number(e.target.value))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
            
            {customOriginalPrice > customPrice && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-700 text-sm">
                  ส่วนลด: {Math.round(((customOriginalPrice - customPrice) / customOriginalPrice) * 100)}% 
                  (ประหยัด {formatPrice(customOriginalPrice - customPrice)})
                </p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">คุณสมบัติพิเศษ</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">สินค้าแนะนำ (Featured)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isFlashSale}
                  onChange={(e) => setIsFlashSale(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">แฟลชเซล (Flash Sale)</span>
              </label>
              
              {isFlashSale && (
                <div className="ml-6">
                  <Label htmlFor="flashSaleEndTime">วันเวลาสิ้นสุด</Label>
                  <Input
                    id="flashSaleEndTime"
                    type="datetime-local"
                    value={flashSaleEndTime}
                    onChange={(e) => setFlashSaleEndTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">SEO</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Title สำหรับ SEO"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {metaTitle.length}/100 ตัวอักษร
                </p>
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Description สำหรับ SEO"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {metaDescription.length}/250 ตัวอักษร
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              ตัวอย่างสินค้า
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-900">{customName}</h4>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className={getEnergyRatingColor(selectedEgatProduct.energy_rating)}>
                    {formatEnergyRating(selectedEgatProduct.energy_rating)}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {getCategoryDisplayName(selectedEgatProduct.category)}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(customPrice)}
                  </span>
                  {customOriginalPrice > customPrice && (
                    <span className="ml-2 text-sm text-gray-400 line-through">
                      {formatPrice(customOriginalPrice)}
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>ประหยัด: {formatPrice(selectedEgatProduct.annual_savings_baht)}/ปี</div>
                  <div>คะแนน: {selectedShopeeProduct.rating} ⭐</div>
                  <div>รีวิว: {selectedShopeeProduct.review_count} รายการ</div>
                  <div>รูปภาพ: {selectedImages.length} รูป</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack} disabled={loading}>
              ย้อนกลับ
            </Button>
            
            <Button 
              onClick={handleSaveCustomization}
              disabled={loading || !customName.trim() || selectedImages.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกและไปขั้นถัดไป
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import EnergyBadge from '@/components/EnergyBadge'
import { 
  Star, 
  Zap, 
  ExternalLink,
  TrendingUp,
  Shield,
  CheckCircle,
  Heart,
  Share2,
  Package,
  BarChart3
} from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, formatDateTime, calculatePaybackPeriod } from '@/lib/utils'

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps): JSX.Element {
  const [isLiked, setIsLiked] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => {
    loadFavorites()
  }, [product.slug])

  // Load favorites from localStorage
  const loadFavorites = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setIsLiked(favorites.includes(product.slug))
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  // Toggle favorite
  const toggleFavorite = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      const newFavorites = isLiked 
        ? favorites.filter((id: string) => id !== product.slug)
        : [...favorites, product.slug]
      
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsLiked(!isLiked)
      
      // Show success message
      setShareMessage(isLiked ? 'ลบออกจากรายการโปรดแล้ว' : 'เพิ่มในรายการโปรดแล้ว')
      setTimeout(() => setShareMessage(''), 3000)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      setShareMessage('เกิดข้อผิดพลาดในการบันทึก')
      setTimeout(() => setShareMessage(''), 3000)
    }
  }

  // Share product
  const handleShare = async () => {
    try {
      const shareUrl = product?.affiliate_url || product?.shopee_url || window.location.href
      const shareData = {
        title: product?.name || 'สินค้าประหยัดไฟ',
        text: `ดูสินค้า ${product?.name} ที่ประหยัดไฟระดับ ${product?.energy_rating || 'A'}`,
        url: shareUrl
      }

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        setShareMessage('คัดลอกลิงก์แชร์แล้ว')
        setTimeout(() => setShareMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback: Copy to clipboard
      try {
        const shareUrl = product?.affiliate_url || product?.shopee_url || window.location.href
        await navigator.clipboard.writeText(shareUrl)
        setShareMessage('คัดลอกลิงก์แชร์แล้ว')
        setTimeout(() => setShareMessage(''), 3000)
      } catch (clipboardError) {
        setShareMessage('ไม่สามารถแชร์ได้')
        setTimeout(() => setShareMessage(''), 3000)
      }
    }
  }

  const paybackPeriod = calculatePaybackPeriod(product.price, product.annual_savings_baht || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {shareMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{shareMessage}</span>
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-green-600">หน้าแรก</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-green-600">ค้นหาสินค้า</Link>
          <span>/</span>
          <Link href={`/category/${product.egat_product_data?.category || 'air'}`} className="hover:text-green-600">
            {product.egat_product_data?.category || 'เครื่องใช้ไฟฟ้า'}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden">
              {product.image_urls?.[selectedImageIndex] ? (
                <Image
                  src={product.image_urls[selectedImageIndex]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.image_urls.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <EnergyBadge rating={product.energy_rating || 'A'} size="lg" />
                {product.is_featured && (
                  <Badge variant="default" className="bg-orange-500">
                    <Star className="w-3 h-3 mr-1" />
                    แนะนำ
                  </Badge>
                )}
                {product.is_flash_sale && (
                  <Badge variant="destructive">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Flash Sale
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>แบรนด์: {product.egat_product_data?.brand || product.shopee_product_data?.brand || 'ไม่ระบุ'}</span>
                <span>หมวดหมู่: {product.egat_product_data?.category || product.shopee_product_data?.category || 'ไม่ระบุ'}</span>
              </div>
            </div>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium">{product.rating}</span>
                <span className="text-gray-600">({product.review_count.toLocaleString()} รีวิว)</span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
                {product.discount_percentage > 0 && (
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    ลด {product.discount_percentage}%
                  </Badge>
                )}
              </div>
            </div>

            {/* EGAT Energy Info */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <Zap className="mr-2 h-5 w-5" />
                  ข้อมูลประหยัดไฟ (EGAT)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">ประหยัดไฟฟ้า:</span>
                    <div className="text-lg font-semibold text-green-700">
                      {product.energy_consumption_kwh} kWh/ปี
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">ประหยัดเงิน:</span>
                    <div className="text-lg font-semibold text-green-700">
                      {formatPrice(product.annual_savings_baht || 0)}/ปี
                    </div>
                  </div>
                </div>
                
                {paybackPeriod > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">ระยะเวลาคืนทุน:</span>
                    <div className="text-lg font-semibold text-green-700">
                      {paybackPeriod} ปี
                    </div>
                  </div>
                )}

                {product.confidence_score && (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">ความน่าเชื่อถือ:</span>
                    <Badge 
                      variant={product.confidence_score > 0.8 ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {Math.round(product.confidence_score * 100)}%
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (product.affiliate_url) {
                      window.open(product.affiliate_url, '_blank')
                    } else {
                      window.open(product.shopee_url, '_blank')
                    }
                  }}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  ซื้อใน Shopee
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={toggleFavorite}
                  title={isLiked ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                >
                  <Heart 
                    className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                  />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleShare}
                  title="แชร์สินค้า"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Description */}
            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดสินค้า</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* EGAT Energy Data */}
            {product.egat_product_data && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <Zap className="mr-2 h-5 w-5" />
                    ข้อมูลประสิทธิภาพพลังงาน (EGAT)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(product.egat_product_data).map(([key, value]) => {
                      // Skip nested objects and handle display
                      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        return null;
                      }
                      
                      let displayValue = value;
                      let displayKey = key;
                      
                      // Format key names
                      const keyMap: { [key: string]: string } = {
                        'energy_rating': 'ระดับประหยัดไฟ',
                        'energy_consumption': 'การใช้พลังงาน (kWh/ปี)',
                        'annual_savings_kwh': 'ประหยัดพลังงาน (kWh/ปี)',
                        'annual_savings_baht': 'ประหยัดค่าไฟ (บาท/ปี)',
                        'recommended_price': 'ราคาแนะนำ',
                        'certification_date': 'วันที่รับรอง',
                        'brand': 'แบรนด์',
                        'model': 'รุ่น',
                        'category': 'หมวดหมู่',
                        'name': 'ชื่อสินค้า',
                        'id': 'รหัสสินค้า'
                      };
                      
                      displayKey = keyMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
                      
                      // Format values
                      if (typeof value === 'boolean') {
                        displayValue = value ? 'ใช่' : 'ไม่';
                      } else if (key === 'certification_date' && value) {
                        displayValue = new Date(value).toLocaleDateString('th-TH');
                      } else if (key.includes('price') && typeof value === 'number') {
                        displayValue = formatPrice(value);
                      } else if (key.includes('savings') && typeof value === 'number') {
                        displayValue = formatPrice(value);
                      } else {
                        displayValue = String(value);
                      }
                      
                      return (
                        <div key={key} className="flex justify-between py-2 border-b border-green-100">
                          <span className="text-green-700 font-medium">
                            {displayKey}:
                          </span>
                          <span className="font-semibold text-green-800 text-right max-w-xs break-words">
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* EGAT Specifications */}
            {product.egat_product_data?.specifications && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <Package className="mr-2 h-5 w-5" />
                    ข้อมูลจำเพาะ (EGAT)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(product.egat_product_data.specifications).map(([key, value]) => {
                      if (typeof value === 'object' && value !== null) {
                        return null;
                      }
                      
                      let displayValue = value;
                      let displayKey = key;
                      
                      // Format key names
                      const keyMap: { [key: string]: string } = {
                        'ชนิด': 'ประเภท',
                        'รุ่น': 'รุ่น',
                        'ระดับ': 'ระดับประหยัดไฟ',
                        'ลำดับ': 'ลำดับ',
                        'ประเภท': 'ประเภทสินค้า',
                        'ลดCO₂(KgCO₂/ปี)': 'ลด CO₂ (กก./ปี)',
                        'ค่าไฟฟ้า(บาท/ปี)': 'ค่าไฟฟ้า (บาท/ปี)',
                        'เครื่องหมายการค้า': 'แบรนด์',
                        'ขนาด(บีทียู/ชั่วโมง)': 'ขนาด (BTU/ชม.)',
                        'ค่าประสิทธิภาพ(บีทียู/ชั่วโมง/วัตต์)': 'ประสิทธิภาพ (BTU/ชม./วัตต์)',
                        'data_quality_score': 'คะแนนคุณภาพข้อมูล',
                        'co2_reduction': 'ลด CO₂',
                        'annual_electricity_cost': 'ค่าไฟฟ้าต่อปี',
                        'energy_efficiency_level': 'ระดับประสิทธิภาพพลังงาน'
                      };
                      
                      displayKey = keyMap[key] || key;
                      
                      // Format values
                      if (typeof value === 'boolean') {
                        displayValue = value ? 'ใช่' : 'ไม่';
                      } else if (key.includes('ค่าไฟฟ้า') && typeof value === 'number') {
                        displayValue = formatPrice(value);
                      } else {
                        displayValue = String(value);
                      }
                      
                      return (
                        <div key={key} className="flex justify-between py-2 border-b border-blue-100">
                          <span className="text-blue-700 font-medium">
                            {displayKey}:
                          </span>
                          <span className="font-semibold text-blue-800 text-right max-w-xs break-words">
                            {String(displayValue)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shopee Data */}
            {product.shopee_product_data && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    ข้อมูลจาก Shopee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(product.shopee_product_data).map(([key, value]) => {
                      // Skip nested objects and arrays
                      if (typeof value === 'object' && value !== null) {
                        return null;
                      }
                      
                      let displayValue = value;
                      let displayKey = key;
                      
                      // Format key names
                      const keyMap: { [key: string]: string } = {
                        'item_id': 'รหัสสินค้า',
                        'name': 'ชื่อสินค้า',
                        'brand': 'แบรนด์',
                        'model': 'รุ่น',
                        'category': 'หมวดหมู่',
                        'price': 'ราคา',
                        'original_price': 'ราคาเดิม',
                        'discount_percentage': 'ส่วนลด (%)',
                        'rating': 'คะแนน',
                        'review_count': 'จำนวนรีวิว',
                        'shopee_url': 'ลิงก์ Shopee'
                      };
                      
                      displayKey = keyMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
                      
                      // Format values
                      if (typeof value === 'boolean') {
                        displayValue = value ? 'ใช่' : 'ไม่';
                      } else if (key.includes('price') && typeof value === 'number') {
                        displayValue = formatPrice(value);
                      } else if (key === 'rating' && typeof value === 'number') {
                        displayValue = `${value} ⭐`;
                      } else if (key === 'review_count' && typeof value === 'number') {
                        displayValue = value.toLocaleString();
                      } else {
                        displayValue = String(value);
                      }
                      
                      return (
                        <div key={key} className="flex justify-between py-2 border-b border-orange-100">
                          <span className="text-orange-700 font-medium">
                            {displayKey}:
                          </span>
                          <span className="font-semibold text-orange-800 text-right max-w-xs break-words">
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Energy Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  ประสิทธิภาพพลังงาน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <EnergyBadge rating={product.energy_rating || 'A'} size="lg" />
                  <p className="text-sm text-gray-600 mt-2">
                    ระดับประหยัดไฟสูงสุด
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">การใช้ไฟฟ้า:</span>
                    <span className="font-medium">{product.energy_consumption_kwh} kWh/ปี</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ประหยัดเงิน:</span>
                    <span className="font-medium text-green-600">
                      {formatPrice(product.annual_savings_baht || 0)}/ปี
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">คืนทุน:</span>
                    <span className="font-medium">{paybackPeriod} ปี</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลสินค้า</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">แบรนด์:</span>
                  <span className="font-medium">{product.egat_product_data?.brand || product.shopee_product_data?.brand || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">หมวดหมู่:</span>
                  <span className="font-medium">{product.egat_product_data?.category || product.shopee_product_data?.category || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">สถานะ:</span>
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">อัพเดท:</span>
                  <span className="font-medium text-sm">
                    {formatDateTime(product.updated_at)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Data Source */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  แหล่งข้อมูล
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">ข้อมูลจาก EGAT</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">ราคาจาก Shopee</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">อัพเดทล่าสุด</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

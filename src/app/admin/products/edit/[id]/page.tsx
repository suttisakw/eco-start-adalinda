'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, formatEnergyRating, getEnergyRatingColor } from '@/lib/utils'
import { ProductService } from '@/lib/productService'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [originalPrice, setOriginalPrice] = useState(0)
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>('draft')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isFlashSale, setIsFlashSale] = useState(false)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const productData = await ProductService.getProductById(productId)
      
      if (!productData) {
        setMessage({ type: 'error', text: 'ไม่พบสินค้าที่ต้องการแก้ไข' })
        return
      }
      
      setProduct(productData)
      
      // Populate form
      setName(productData.name)
      setDescription(productData.description || '')
      setPrice(productData.price)
      setOriginalPrice(productData.original_price || 0)
      setStatus(productData.status)
      setIsFeatured(productData.is_featured)
      setIsFlashSale(productData.is_flash_sale)
      setMetaTitle(productData.meta_title || '')
      setMetaDescription(productData.meta_description || '')
    } catch (error) {
      console.error('Error fetching product:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!product) return
    
    try {
      setSaving(true)
      setMessage(null)
      
      const updatedProduct = await ProductService.updateProduct(productId, {
        name,
        description,
        price,
        original_price: originalPrice,
        status,
        is_featured: isFeatured,
        is_flash_sale: isFlashSale,
        meta_title: metaTitle,
        meta_description: metaDescription,
        discount_percentage: originalPrice > price 
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0
      })
      
      setProduct(updatedProduct)
      setMessage({ type: 'success', text: 'บันทึกข้อมูลสินค้าสำเร็จ' })
    } catch (error) {
      console.error('Error updating product:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">ไม่พบสินค้าที่ต้องการแก้ไข</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/admin/products')}
          >
            กลับไปหน้ารายการสินค้า
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/admin/products')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">แก้ไขสินค้า</h1>
            <p className="text-gray-600">แก้ไขข้อมูลสินค้า: {product.name}</p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              บันทึก
            </>
          )}
        </Button>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 mr-2" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">ชื่อสินค้า *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ใส่ชื่อสินค้า"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">คำอธิบายสินค้า</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ใส่คำอธิบายสินค้า"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="price">ราคาขาย *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="originalPrice">ราคาเดิม</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>

              {originalPrice > price && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-700 text-sm">
                    ส่วนลด: {Math.round(((originalPrice - price) / originalPrice) * 100)}% 
                    (ประหยัด {formatPrice(originalPrice - price)})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>สถานะ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">สถานะสินค้า</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'draft')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                >
                  <option value="draft">ร่าง</option>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>
              </div>

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
              </div>
            </CardContent>
          </Card>

          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลสินค้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ID:</span>
                <span className="text-sm font-mono">{product.id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Slug:</span>
                <span className="text-sm font-mono">{product.slug}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">พลังงาน:</span>
                <Badge variant="outline" className={getEnergyRatingColor(product.energy_rating || 'A')}>
                  {formatEnergyRating(product.energy_rating || 'A')}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">คะแนน:</span>
                <span className="text-sm">{product.rating} ⭐</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">รีวิว:</span>
                <span className="text-sm">{product.review_count}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">สร้างเมื่อ:</span>
                <span className="text-sm">{new Date(product.created_at).toLocaleDateString('th-TH')}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">อัปเดตเมื่อ:</span>
                <span className="text-sm">{new Date(product.updated_at).toLocaleDateString('th-TH')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>การดำเนินการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href={`/product/${product.slug}`} target="_blank">
                  ดูสินค้า
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/admin/products')}
              >
                กลับไปหน้ารายการ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  RefreshCw,
  Package,
  TrendingUp,
  DollarSign,
  MoreHorizontal,
  Copy,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, formatDateTime, getEnergyRatingColor } from '@/lib/utils'
import { ProductService } from '@/lib/productService'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Fetch products from database
      const result = await ProductService.getProducts({
        search: searchTerm || undefined,
        status: selectedStatus !== 'all' ? selectedStatus as 'active' | 'inactive' | 'draft' : undefined,
        limit: 50,
        page: 1
      })
      
      setProducts(result.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Products are already filtered by the API call
  const filteredProducts = products

  // Action handlers
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const handleUpdateStatus = async (productId: string, newStatus: 'active' | 'inactive' | 'draft') => {
    try {
      setActionLoading(productId)
      setMessage(null)
      
      await ProductService.updateProduct(productId, { status: newStatus })
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, status: newStatus } : p
      ))
      
      setMessage({ type: 'success', text: `อัปเดตสถานะสินค้าเป็น ${newStatus} สำเร็จ` })
    } catch (error) {
      console.error('Error updating product status:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัปเดตสถานะสินค้า' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) return
    
    try {
      setActionLoading(productId)
      setMessage(null)
      
      await ProductService.deleteProduct(productId)
      
      // Update local state
      setProducts(prev => prev.filter(p => p.id !== productId))
      setSelectedProducts(prev => prev.filter(id => id !== productId))
      
      setMessage({ type: 'success', text: 'ลบสินค้าสำเร็จ' })
    } catch (error) {
      console.error('Error deleting product:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการลบสินค้า' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkUpdateStatus = async (newStatus: 'active' | 'inactive' | 'draft') => {
    if (selectedProducts.length === 0) return
    
    try {
      setActionLoading('bulk')
      setMessage(null)
      
      // Update each product
      await Promise.all(
        selectedProducts.map(id => ProductService.updateProduct(id, { status: newStatus }))
      )
      
      // Update local state
      setProducts(prev => prev.map(p => 
        selectedProducts.includes(p.id) ? { ...p, status: newStatus } : p
      ))
      
      setSelectedProducts([])
      setMessage({ type: 'success', text: `อัปเดตสถานะสินค้า ${selectedProducts.length} รายการเป็น ${newStatus} สำเร็จ` })
    } catch (error) {
      console.error('Error bulk updating products:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัปเดตสถานะสินค้าหลายรายการ' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return
    
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบสินค้า ${selectedProducts.length} รายการ?`)) return
    
    try {
      setActionLoading('bulk')
      setMessage(null)
      
      // Delete each product
      await Promise.all(
        selectedProducts.map(id => ProductService.deleteProduct(id))
      )
      
      // Update local state
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)))
      setSelectedProducts([])
      
      setMessage({ type: 'success', text: `ลบสินค้า ${selectedProducts.length} รายการสำเร็จ` })
    } catch (error) {
      console.error('Error bulk deleting products:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการลบสินค้าหลายรายการ' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRefresh = () => {
    fetchProducts()
    setMessage(null)
  }

  const categories = [
    { value: '', label: 'ทุกหมวดหมู่' },
    { value: '1', label: 'ตู้เย็น' },
    { value: '2', label: 'แอร์' },
    { value: '3', label: 'เครื่องซักผ้า' },
    { value: '4', label: 'ไมโครเวฟ' }
  ]

  const statusOptions = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'active', label: 'ใช้งาน' },
    { value: 'draft', label: 'ร่าง' },
    { value: 'inactive', label: 'ไม่ใช้งาน' }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">ใช้งาน</Badge>
      case 'draft':
        return <Badge variant="secondary">ร่าง</Badge>
      case 'inactive':
        return <Badge variant="destructive">ไม่ใช้งาน</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h1>
          <p className="text-gray-600">จัดการสินค้าทั้งหมดในระบบ</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            ส่งออก
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
          <Button asChild>
            <a href="/admin/products/create">
              <Plus className="w-4 h-4 mr-2" />
              สร้างสินค้าใหม่
            </a>
          </Button>
        </div>
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

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-800">
                  เลือกแล้ว {selectedProducts.length} รายการ
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedProducts([])}
                >
                  ยกเลิกการเลือก
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkUpdateStatus('active')}
                  disabled={actionLoading === 'bulk'}
                >
                  {actionLoading === 'bulk' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  เปิดใช้งาน
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkUpdateStatus('inactive')}
                  disabled={actionLoading === 'bulk'}
                >
                  {actionLoading === 'bulk' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  ปิดใช้งาน
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkUpdateStatus('draft')}
                  disabled={actionLoading === 'bulk'}
                >
                  {actionLoading === 'bulk' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2" />
                  )}
                  เป็นร่าง
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={actionLoading === 'bulk'}
                >
                  {actionLoading === 'bulk' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  ลบ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">ค้นหา</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ค้นหาสินค้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">หมวดหมู่</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">สถานะ</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                ตัวกรองเพิ่มเติม
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                สินค้าทั้งหมด ({filteredProducts.length})
              </span>
              {filteredProducts.length > 0 && (
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                  <span>เลือกทั้งหมด</span>
                </label>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded" />
                  <div className="w-16 h-8 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className={`flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow ${
                  selectedProducts.includes(product.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="rounded border-gray-300"
                  />

                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {product.image_urls?.[0] ? (
                      <img
                        src={product.image_urls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline" className={getEnergyRatingColor(product.energy_rating || 'A')}>
                        เบอร์ {product.energy_rating || 'A'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.is_featured && (
                        <Badge variant="default" className="bg-orange-100 text-orange-800">
                          แนะนำ
                        </Badge>
                      )}
                      {product.is_flash_sale && (
                        <Badge variant="destructive">
                          Flash Sale
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>สร้าง: {formatDateTime(product.created_at)}</span>
                      {product.confidence_score && (
                        <span>ความน่าเชื่อถือ: {Math.round(product.confidence_score * 100)}%</span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(product.status)}
                    
                    {/* Status Toggle */}
                    <div className="flex items-center space-x-2">
                      {product.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(product.id, 'inactive')}
                          disabled={actionLoading === product.id}
                          className="text-green-600 hover:text-green-700"
                          title="ปิดใช้งาน"
                        >
                          {actionLoading === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ToggleRight className="w-4 h-4" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(product.id, 'active')}
                          disabled={actionLoading === product.id}
                          className="text-gray-400 hover:text-green-600"
                          title="เปิดใช้งาน"
                        >
                          {actionLoading === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/product/${product.slug}`} target="_blank" title="ดูสินค้า">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/admin/products/edit/${product.id}`} title="แก้ไขสินค้า">
                          <Edit className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={actionLoading === product.id}
                        className="text-red-600 hover:text-red-700"
                        title="ลบสินค้า"
                      >
                        {actionLoading === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">ไม่พบสินค้า</p>
                  <p className="text-sm text-gray-400 mt-1">
                    ลองปรับตัวกรองหรือสร้างสินค้าใหม่
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

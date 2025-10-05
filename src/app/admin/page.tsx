'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatsGridSkeleton, TableSkeleton } from '@/components/ui/skeleton'
import { 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign,
  Zap,
  ShoppingCart,
  BarChart3,
  Clock
} from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { AdminService, DashboardStats } from '@/lib/adminService'


export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('📊 Fetching real dashboard stats...')
      const realStats = await AdminService.getDashboardStats()
      setStats(realStats)
      
    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error)
      setError('ไม่สามารถโหลดข้อมูลได้: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Stats Skeleton */}
        <StatsGridSkeleton cols={4} />
        
        {/* Recent Products Skeleton */}
        <TableSkeleton rows={3} />
        
        {/* Quick Actions Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-white p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="h-5 w-5 bg-gray-200 rounded mr-2" />
                <div className="h-6 w-32 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ลองใหม่
        </button>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ไม่พบข้อมูล</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'สินค้าทั้งหมด',
      value: stats.total_products.toLocaleString(),
      icon: Package,
      description: `${stats.active_products} ใช้งาน`,
      color: 'text-blue-600'
    },
    {
      title: 'สินค้าที่ใช้งาน',
      value: stats.active_products.toLocaleString(),
      icon: TrendingUp,
      description: `${stats.draft_products} ร่าง`,
      color: 'text-green-600'
    },
    {
      title: 'สินค้าแนะนำ',
      value: stats.featured_products.toLocaleString(),
      icon: Zap,
      description: 'สินค้าเบอร์ 5',
      color: 'text-orange-600'
    },
    {
      title: 'สินค้าร่าง',
      value: stats.draft_products.toLocaleString(),
      icon: Clock,
      description: 'รอการอนุมัติ',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">ภาพรวมระบบจัดการสินค้าประหยัดไฟเบอร์ 5 (Public Access)</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            สินค้าล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recent_products.length > 0 ? (
              stats.recent_products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">{formatPrice(product.price)}</span>
                      <Badge variant="outline" className={product.energy_rating === 'A' ? 'text-green-600 border-green-600' : ''}>
                        เบอร์ {product.energy_rating}
                      </Badge>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status === 'active' ? 'ใช้งาน' : 'ร่าง'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(product.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>ยังไม่มีสินค้า</p>
                <p className="text-sm">เริ่มสร้างสินค้าแรกของคุณ</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-blue-600" />
              สร้างสินค้าใหม่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              สร้างสินค้าใหม่จากข้อมูล EGAT และ Shopee
            </p>
            <a href="/admin/products/create" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              เริ่มสร้าง →
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-green-600" />
              จัดการสินค้า
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              ดูและแก้ไขสินค้าทั้งหมด
            </p>
            <a href="/admin/products" className="text-green-600 hover:text-green-700 text-sm font-medium">
              ไปจัดการ →
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
              ดู Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              วิเคราะห์ข้อมูลการใช้งาน
            </p>
            <a href="/admin/analytics" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              ดูรายงาน →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

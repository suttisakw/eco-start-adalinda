'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'

interface AnalyticsData {
  overview: {
    total_products: number
    active_products: number
    total_clicks: number
    total_conversions: number
    conversion_rate: number
    revenue: number
    avg_order_value: number
  }
  daily_stats: Array<{
    date: string
    clicks: number
    conversions: number
    revenue: number
  }>
  top_products: Array<{
    id: string
    name: string
    clicks: number
    conversions: number
    revenue: number
    conversion_rate: number
  }>
  category_performance: Array<{
    category: string
    products: number
    clicks: number
    conversions: number
    revenue: number
  }>
  energy_rating_stats: Array<{
    rating: string
    products: number
    clicks: number
    conversions: number
    avg_savings: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      const mockAnalytics: AnalyticsData = {
        overview: {
          total_products: 156,
          active_products: 142,
          total_clicks: 2847,
          total_conversions: 89,
          conversion_rate: 3.13,
          revenue: 1425000,
          avg_order_value: 16011
        },
        daily_stats: [
          { date: '2024-01-20', clicks: 234, conversions: 8, revenue: 128000 },
          { date: '2024-01-21', clicks: 189, conversions: 6, revenue: 96000 },
          { date: '2024-01-22', clicks: 312, conversions: 12, revenue: 192000 },
          { date: '2024-01-23', clicks: 278, conversions: 9, revenue: 144000 },
          { date: '2024-01-24', clicks: 345, conversions: 15, revenue: 240000 },
          { date: '2024-01-25', clicks: 298, conversions: 11, revenue: 176000 },
          { date: '2024-01-26', clicks: 267, conversions: 7, revenue: 112000 }
        ],
        top_products: [
          {
            id: '1',
            name: 'ตู้เย็น Samsung RT28K5070SG',
            clicks: 456,
            conversions: 18,
            revenue: 288000,
            conversion_rate: 3.95
          },
          {
            id: '2',
            name: 'แอร์ Daikin FTKM35U',
            clicks: 389,
            conversions: 14,
            revenue: 320600,
            conversion_rate: 3.60
          },
          {
            id: '3',
            name: 'เครื่องซักผ้า LG WM3900HWA',
            clicks: 234,
            conversions: 8,
            revenue: 128000,
            conversion_rate: 3.42
          }
        ],
        category_performance: [
          {
            category: 'ตู้เย็น',
            products: 45,
            clicks: 1234,
            conversions: 42,
            revenue: 672000
          },
          {
            category: 'แอร์',
            products: 38,
            clicks: 987,
            conversions: 28,
            revenue: 641200
          },
          {
            category: 'เครื่องซักผ้า',
            products: 32,
            clicks: 456,
            conversions: 12,
            revenue: 192000
          }
        ],
        energy_rating_stats: [
          {
            rating: 'A',
            products: 89,
            clicks: 1890,
            conversions: 67,
            avg_savings: 850
          },
          {
            rating: 'B',
            products: 34,
            clicks: 567,
            conversions: 15,
            avg_savings: 650
          },
          {
            rating: 'C',
            products: 19,
            clicks: 234,
            conversions: 4,
            avg_savings: 420
          }
        ]
      }
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const dateRangeOptions = [
    { value: '7d', label: '7 วัน' },
    { value: '30d', label: '30 วัน' },
    { value: '90d', label: '90 วัน' },
    { value: '1y', label: '1 ปี' }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ไม่สามารถโหลดข้อมูลได้</p>
      </div>
    )
  }

  const overviewCards = [
    {
      title: 'สินค้าทั้งหมด',
      value: analytics.overview.total_products.toLocaleString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: BarChart3,
      description: `${analytics.overview.active_products} ใช้งาน`
    },
    {
      title: 'คลิก Affiliate',
      value: analytics.overview.total_clicks.toLocaleString(),
      change: '+8.5%',
      changeType: 'positive' as const,
      icon: MousePointer,
      description: 'คลิกทั้งหมด'
    },
    {
      title: 'การขาย',
      value: analytics.overview.total_conversions.toLocaleString(),
      change: '+15.2%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      description: `${analytics.overview.conversion_rate}% conversion rate`
    },
    {
      title: 'รายได้',
      value: formatPrice(analytics.overview.revenue),
      change: '+22.1%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: `AOV ${formatPrice(analytics.overview.avg_order_value)}`
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">วิเคราะห์ข้อมูลการใช้งานและประสิทธิภาพ</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            ส่งออก
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center space-x-2 mt-1">
                  {card.changeType === 'positive' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-xs ${
                    card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              สินค้าที่ขายดี
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.top_products.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{product.clicks} คลิก</span>
                        <span>{product.conversions} ขาย</span>
                        <span>{product.conversion_rate}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatPrice(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              ประสิทธิภาพตามหมวดหมู่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.category_performance.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{category.category}</h4>
                    <span className="text-sm text-gray-600">{category.products} สินค้า</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">คลิก:</span>
                      <div className="font-medium">{category.clicks.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">ขาย:</span>
                      <div className="font-medium">{category.conversions}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">รายได้:</span>
                      <div className="font-medium text-green-600">{formatPrice(category.revenue)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Energy Rating Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            สถิติตามระดับประหยัดไฟ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {analytics.energy_rating_stats.map((rating) => (
              <div key={rating.rating} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    เบอร์ {rating.rating}
                  </Badge>
                  <span className="text-sm text-gray-600">{rating.products} สินค้า</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">คลิก:</span>
                    <span className="font-medium">{rating.clicks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ขาย:</span>
                    <span className="font-medium">{rating.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ประหยัดเฉลี่ย:</span>
                    <span className="font-medium text-green-600">
                      {formatPrice(rating.avg_savings)}/ปี
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            สถิติรายวัน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">กราฟแสดงสถิติรายวัน</p>
              <p className="text-sm text-gray-400">คลิก: {analytics.daily_stats.reduce((sum, day) => sum + day.clicks, 0).toLocaleString()}</p>
              <p className="text-sm text-gray-400">ขาย: {analytics.daily_stats.reduce((sum, day) => sum + day.conversions, 0).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

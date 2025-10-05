'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Settings, 
  Home,
  Menu,
  X,
  Zap,
  ShoppingCart,
  Search,
  TrendingUp,
  Users,
  FileText,
  Database,
  Globe,
  Star,
  Tag,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  HelpCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Handle smooth closing animation
  const handleCloseSidebar = () => {
    setIsClosing(true)
    setTimeout(() => {
      setSidebarOpen(false)
      setIsClosing(false)
    }, 150)
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard,
      description: 'ภาพรวมระบบ'
    },
    { 
      name: 'จัดการสินค้า', 
      href: '/admin/products', 
      icon: ShoppingCart,
      description: 'ดูและแก้ไขสินค้า'
    },
    { 
      name: 'สร้างสินค้าใหม่', 
      href: '/admin/products/create', 
      icon: Plus,
      description: 'เพิ่มสินค้าใหม่'
    },
    { 
      name: 'หมวดหมู่', 
      href: '/admin/categories', 
      icon: Tag,
      description: 'จัดการหมวดหมู่สินค้า'
    },
    { 
      name: 'Analytics', 
      href: '/admin/analytics', 
      icon: BarChart3,
      description: 'วิเคราะห์ข้อมูล'
    },
    { 
      name: 'รายงาน', 
      href: '/admin/reports', 
      icon: FileText,
      description: 'รายงานต่างๆ'
    },
    { 
      name: 'SEO', 
      href: '/admin/seo', 
      icon: Globe,
      description: 'จัดการ SEO'
    },
    { 
      name: 'ฐานข้อมูล', 
      href: '/admin/database', 
      icon: Database,
      description: 'จัดการฐานข้อมูล'
    },
    { 
      name: 'การตั้งค่า', 
      href: '/admin/settings', 
      icon: Settings,
      description: 'ตั้งค่าระบบ'
    },
    { 
      name: 'ช่วยเหลือ', 
      href: '/admin/help', 
      icon: HelpCircle,
      description: 'คู่มือการใช้งาน'
    }
  ]

  const quickActions = [
    { name: 'กลับหน้าหลัก', href: '/', icon: Home },
    { name: 'ค้นหา', href: '/search', icon: Search },
    { name: 'เปรียบเทียบ', href: '/compare', icon: Eye }
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md" onClick={handleCloseSidebar} />
          <div className={`fixed inset-y-0 left-0 flex w-full flex-col bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out ${
            sidebarOpen && !isClosing ? 'translate-x-0 scale-100' : '-translate-x-full scale-95'
          }`}>
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200/50 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-xl">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Admin Panel</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseSidebar}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Mobile Navigation - Full Height Scrollable */}
            <div className="flex-1 overflow-y-auto py-8 px-6 bg-gradient-to-b from-white/90 to-gray-50/90 scrollbar-thin">
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 flex items-center">
                  <div className="h-0.5 w-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3"></div>
                  เมนูหลัก
                </div>
                {navigation.map((item, index) => {
                  const Icon = item.icon
                  const isActive = isActiveRoute(item.href)
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.href)
                        handleCloseSidebar()
                      }}
                      className={cn(
                        "w-full flex items-start px-5 py-4 text-sm font-medium rounded-2xl transition-all duration-300 group transform hover:scale-[1.02] active:scale-[0.98]",
                        isActive
                          ? "bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 text-green-700 border border-green-200/50 shadow-lg shadow-green-100/50"
                          : "text-gray-700 hover:bg-white/70 hover:text-gray-900 hover:shadow-md hover:shadow-gray-100/50 hover:border hover:border-gray-200/50"
                      )}
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animation: sidebarOpen ? 'slideInLeft 0.3s ease-out forwards' : ''
                      }}
                    >
                      <div className={cn(
                        "p-2 rounded-xl transition-all duration-200 mr-4",
                        isActive 
                          ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg" 
                          : "bg-gray-100 group-hover:bg-gray-200"
                      )}>
                        <Icon className={cn(
                          "h-5 w-5 transition-all duration-200", 
                          isActive ? "text-white" : "text-gray-600 group-hover:text-gray-700"
                        )} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-base">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                      </div>
                    </button>
                  )
                })}
                
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 mt-8 flex items-center">
                  <div className="h-0.5 w-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-3"></div>
                  ลิงก์ด่วน
                </div>
                {quickActions.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.href)
                        handleCloseSidebar()
                      }}
                      className="w-full flex items-center px-5 py-3 text-sm font-medium rounded-2xl text-gray-700 hover:bg-white/70 hover:text-gray-900 transition-all duration-300 group transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-gray-100/50"
                      style={{ 
                        animationDelay: `${(navigation.length + index) * 50}ms`,
                        animation: sidebarOpen ? 'slideInLeft 0.3s ease-out forwards' : ''
                      }}
                    >
                      <div className="p-2 bg-gray-100 group-hover:bg-gray-200 rounded-xl transition-all duration-200 mr-4">
                        <Icon className="h-4 w-4 text-gray-600 group-hover:text-gray-700 transition-colors duration-200" />
                      </div>
                      <span className="text-base font-medium">{item.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Mobile Footer */}
            <div className="border-t border-gray-200/50 p-6 bg-gradient-to-r from-gray-50/90 to-white/90 backdrop-blur-xl">
              <div className="text-center text-sm text-gray-600">
                <div className="font-semibold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">เว็บไซต์ประหยัดไฟเบอร์ 5</div>
                <div className="text-xs text-gray-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Admin Panel (Public Access)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop sidebar - Full Height */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
          <div className="flex flex-col h-full bg-white shadow-lg border-r border-gray-200">
            {/* Desktop Header */}
            <div className="flex h-16 items-center px-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
              </div>
            </div>
            
            {/* Desktop Navigation - Full Height Scrollable */}
            <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-3">
                  เมนูหลัก
                </div>
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveRoute(item.href)
                  return (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "w-full flex items-start px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 group",
                        isActive
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-l-4 border-green-600 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                      )}
                    >
                      <Icon className={cn("h-6 w-6 flex-shrink-0 mt-0.5 transition-colors duration-200", isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600")} />
                      <div className="ml-4 text-left">
                        <div className="font-medium text-base">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                      </div>
                    </button>
                  )
                })}
                
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-3 mt-8">
                  ลิงก์ด่วน
                </div>
                {quickActions.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                    >
                      <Icon className="h-5 w-5 text-gray-400 mr-4 group-hover:text-gray-600 transition-colors duration-200" />
                      <span className="text-base">{item.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Desktop Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50/50 backdrop-blur-sm">
              <div className="text-center text-sm text-gray-600">
                <div className="font-medium mb-1">เว็บไซต์ประหยัดไฟเบอร์ 5</div>
                <div className="text-xs text-gray-500">Admin Panel (Public Access)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-80">
          {/* Top bar */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1 items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">เว็บไซต์ประหยัดไฟเบอร์ 5</span>
                  <span className="mx-2">•</span>
                  <span>Admin Panel (Public Access)</span>
                </div>
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="hidden sm:flex"
                >
                  <Home className="h-4 w-4 mr-2" />
                  กลับหน้าหลัก
                </Button>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           {children}
            </div>
          </main>
        </div>
        
        {/* Performance Monitor */}
        <PerformanceMonitor />
      </div>
  )
}

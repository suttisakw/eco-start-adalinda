import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md">
        <CardContent className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ไม่พบหน้าที่ต้องการ
          </h2>
          <p className="text-gray-600 mb-6">
            หน้าที่คุณกำลังมองหาอาจไม่พร้อมใช้งานหรือถูกย้ายไปแล้ว
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                กลับหน้าแรก
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/search">
                <Search className="w-4 h-4 mr-2" />
                ค้นหาสินค้า
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

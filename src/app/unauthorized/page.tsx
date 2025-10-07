'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            ไม่ได้รับอนุญาต
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            ขออภัย คุณไม่มีสิทธิ์เข้าถึงหน้านี้
          </p>
          <p className="text-sm text-gray-500">
            หน้านี้เฉพาะสำหรับผู้ดูแลระบบเท่านั้น
          </p>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับหน้าก่อนหน้า
            </Button>
            
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              กลับหน้าหลัก
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

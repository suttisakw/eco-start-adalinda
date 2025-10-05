'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SEOOptimizer from '@/components/SEOOptimizer'
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Award,
  CheckCircle,
  BarChart3,
  Globe,
  Heart
} from 'lucide-react'
import { SEOGenerator } from '@/lib/seo-generator'

export default function AboutPage() {
  const seoData = SEOGenerator.generateAboutSEO()

  const features = [
    {
      icon: Shield,
      title: 'ข้อมูลจาก EGAT',
      description: 'ข้อมูลประหยัดไฟที่ถูกต้องและน่าเชื่อถือจากองค์การบริหารจัดการก๊าซเรือนกระจก'
    },
    {
      icon: TrendingUp,
      title: 'เปรียบเทียบราคา',
      description: 'เปรียบเทียบราคาจาก Shopee พร้อมข้อมูลล่าสุดและโปรโมชันพิเศษ'
    },
    {
      icon: BarChart3,
      title: 'วิเคราะห์ข้อมูล',
      description: 'วิเคราะห์ข้อมูลประหยัดไฟและคำนวณระยะเวลาคืนทุนอย่างละเอียด'
    },
    {
      icon: Users,
      title: 'รีวิวผู้ใช้',
      description: 'รีวิวและคะแนนจากผู้ใช้จริงที่ซื้อสินค้าและใช้งานจริง'
    }
  ]

  const stats = [
    { number: '500+', label: 'สินค้าเบอร์ 5' },
    { number: '50%', label: 'ประหยัดไฟ' },
    { number: '1000+', label: 'รีวิว' },
    { number: '99%', label: 'ความพึงพอใจ' }
  ]

  const values = [
    {
      title: 'ความน่าเชื่อถือ',
      description: 'ข้อมูลที่ถูกต้องและอัพเดทจากแหล่งที่น่าเชื่อถือ'
    },
    {
      title: 'ความโปร่งใส',
      description: 'แสดงข้อมูลอย่างชัดเจนและไม่บิดเบือน'
    },
    {
      title: 'ประโยชน์ของผู้ใช้',
      description: 'มุ่งเน้นประโยชน์สูงสุดของผู้ใช้ในการเลือกสินค้า'
    },
    {
      title: 'การประหยัดพลังงาน',
      description: 'ส่งเสริมการใช้พลังงานอย่างมีประสิทธิภาพ'
    }
  ]

  return (
    <SEOOptimizer {...seoData}>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                เกี่ยวกับเรา
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                เว็บไซต์แนะนำเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ 
                ที่มุ่งมั่นช่วยให้คุณเลือกสินค้าที่เหมาะสมที่สุด 
                เพื่อประหยัดพลังงานและค่าใช้จ่าย
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ภารกิจของเรา
                </h2>
                <p className="text-lg text-gray-600">
                  มุ่งมั่นสร้างสังคมที่ใช้พลังงานอย่างมีประสิทธิภาพ
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="mr-2 h-6 w-6 text-red-500" />
                      วิสัยทัศน์
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      เป็นเว็บไซต์ชั้นนำในการแนะนำเครื่องใช้ไฟฟ้าเบอร์ 5 
                      ที่ช่วยให้ผู้บริโภคเลือกสินค้าที่เหมาะสม 
                      และสร้างสังคมที่ใช้พลังงานอย่างมีประสิทธิภาพ
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="mr-2 h-6 w-6 text-blue-500" />
                      พันธกิจ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      ให้ข้อมูลที่ถูกต้องและน่าเชื่อถือเกี่ยวกับเครื่องใช้ไฟฟ้าเบอร์ 5 
                      เปรียบเทียบราคาและคุณสมบัติ เพื่อช่วยให้ผู้บริโภคตัดสินใจซื้อได้อย่างเหมาะสม
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ทำไมต้องเลือกเรา
              </h2>
              <p className="text-lg text-gray-600">
                เราให้ข้อมูลที่ถูกต้องและน่าเชื่อถือ
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ค่านิยมของเรา
              </h2>
              <p className="text-lg text-gray-600">
                หลักการที่เรายึดถือในการทำงาน
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Source Section */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                แหล่งข้อมูลที่เชื่อถือได้
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      ข้อมูลจาก EGAT
                    </h3>
                    <p className="text-gray-600 text-sm">
                      ข้อมูลประหยัดไฟที่ถูกต้องและน่าเชื่อถือจากองค์การบริหารจัดการก๊าซเรือนกระจก
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      ราคาจาก Shopee
                    </h3>
                    <p className="text-gray-600 text-sm">
                      ราคาล่าสุดและโปรโมชันพิเศษจาก Shopee ที่อัพเดททุกวัน
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      รีวิวผู้ใช้จริง
                    </h3>
                    <p className="text-gray-600 text-sm">
                      รีวิวและคะแนนจากผู้ใช้จริงที่ซื้อสินค้าและใช้งานจริง
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-green-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              เริ่มประหยัดไฟวันนี้
            </h2>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              ค้นหาเครื่องใช้ไฟฟ้าเบอร์ 5 ที่เหมาะสมกับบ้านคุณ 
              และเริ่มประหยัดค่าไฟได้ทันที
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/search" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
                <Zap className="w-5 h-5 mr-2 inline" />
                ค้นหาสินค้า
              </a>
              <a href="/compare" className="border border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-lg font-medium transition-colors">
                <TrendingUp className="w-5 h-5 mr-2 inline" />
                เปรียบเทียบ
              </a>
            </div>
          </div>
        </section>
      </div>
    </SEOOptimizer>
  )
}

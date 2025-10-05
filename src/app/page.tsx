'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ProductCard from '@/components/ProductCard'
import SearchBar from '@/components/SearchBar'
import SEOOptimizer from '@/components/SEOOptimizer'
import { 
  Zap, 
  TrendingUp, 
  Star, 
  Shield, 
  ArrowRight,
  Package,
  DollarSign,
  Users,
  Award,
  CheckCircle
} from 'lucide-react'
import { Product } from '@/types'
import { SEOGenerator } from '@/lib/seo-generator'
import { formatPrice } from '@/lib/utils'
import { ProductService } from '@/lib/productService'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true)
      
      // Fetch featured products from database
      const result = await ProductService.getProducts({
        limit: 6,
        is_featured: true,
        status: 'active'
      })
      
      setFeaturedProducts(result.products)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      setFeaturedProducts([])
    } finally {
      setLoading(false)
    }
  }

  const seoData = SEOGenerator.generateHomepageSEO()

  const categories = [
    {
      name: 'ตู้เย็น',
      slug: 'refrigerator',
      icon: Package,
      count: 45,
      description: 'ตู้เย็นเบอร์ 5 ประหยัดไฟ'
    },
    {
      name: 'แอร์',
      slug: 'air-conditioner',
      icon: Zap,
      count: 38,
      description: 'แอร์ประหยัดไฟเบอร์ 5'
    },
    {
      name: 'เครื่องซักผ้า',
      slug: 'washing-machine',
      icon: Package,
      count: 32,
      description: 'เครื่องซักผ้าเบอร์ 5'
    },
    {
      name: 'ไมโครเวฟ',
      slug: 'microwave',
      icon: Package,
      count: 28,
      description: 'ไมโครเวฟเบอร์ 5'
    }
  ]

  const features = [
    {
      icon: Shield,
      title: 'ข้อมูลจาก EGAT',
      description: 'ข้อมูลประหยัดไฟจากองค์การบริหารจัดการก๊าซเรือนกระจก'
    },
    {
      icon: TrendingUp,
      title: 'เปรียบเทียบราคา',
      description: 'เปรียบเทียบราคาจาก Shopee พร้อมข้อมูลล่าสุด'
    },
    {
      icon: Star,
      title: 'รีวิวผู้ใช้',
      description: 'รีวิวและคะแนนจากผู้ใช้จริง'
    },
    {
      icon: DollarSign,
      title: 'คำนวณประหยัด',
      description: 'คำนวณเงินที่ประหยัดได้ต่อปี'
    }
  ]

  return (
    <SEOOptimizer {...seoData}>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-green-50 to-emerald-50 py-20 lg:py-32">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="container mx-auto px-4 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-6">
                  <Badge variant="outline" className="bg-primary-100 text-primary-800 border-primary-300 shadow-soft">
                    <Zap className="w-4 h-4 mr-2" />
                    เว็บไซต์ประหยัดไฟเบอร์ 5
                  </Badge>
                  <h1 className="text-responsive-3xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
                    เครื่องใช้ไฟฟ้า
                    <span className="gradient-text"> เบอร์ 5</span>
                    <br />
                    <span className="text-primary-600">ประหยัดไฟ</span>
                  </h1>
                  <p className="text-lg lg:text-xl text-gray-600 leading-relaxed text-balance max-w-2xl">
                    ค้นหาและเปรียบเทียบเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ 
                    ข้อมูลจาก EGAT ราคาจาก Shopee พร้อมคำแนะนำการประหยัดพลังงาน
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/search">
                    <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-lg px-8 py-4 shadow-medium hover:shadow-large transition-all duration-300 interactive">
                      <Zap className="w-5 h-5 mr-2" />
                      ค้นหาสินค้า
                    </Button>
                  </Link>
                  <Link href="/compare">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 shadow-soft hover:shadow-medium transition-all duration-300">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      เปรียบเทียบ
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div className="text-center group">
                    <div className="text-2xl lg:text-3xl font-bold text-primary-600 group-hover:scale-110 transition-transform duration-300">500+</div>
                    <div className="text-sm text-gray-600">สินค้าเบอร์ 5</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-2xl lg:text-3xl font-bold text-primary-600 group-hover:scale-110 transition-transform duration-300">50%</div>
                    <div className="text-sm text-gray-600">ประหยัดไฟ</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-2xl lg:text-3xl font-bold text-primary-600 group-hover:scale-110 transition-transform duration-300">1000+</div>
                    <div className="text-sm text-gray-600">รีวิว</div>
                  </div>
                </div>
              </div>

              <div className="relative animate-slide-up">
                <div className="relative w-full h-96 lg:h-[500px] group">
                  <Image
                    src="/assets/hero-banner.svg"
                    alt="เครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ"
                    fill
                    className="object-cover rounded-2xl shadow-large group-hover:shadow-xl transition-all duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-large border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">ข้อมูลจาก EGAT</div>
                      <div className="text-sm text-gray-600">รับรองคุณภาพ</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-700">Live Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-16 lg:py-20 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-responsive-2xl lg:text-4xl font-bold text-gray-900 mb-4 text-balance">
                  ค้นหาเครื่องใช้ไฟฟ้าเบอร์ 5
                </h2>
                <p className="text-lg text-gray-600 text-balance">
                  ค้นหาสินค้าที่เหมาะสมกับความต้องการของคุณ
                </p>
              </div>
              <div className="bg-gradient-to-r from-primary-50 to-green-50 p-8 rounded-2xl shadow-soft">
                <SearchBar showCategorySlider={true} showFilters={false} autoNavigate={false} />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-responsive-2xl lg:text-4xl font-bold text-gray-900 mb-4 text-balance">
                หมวดหมู่สินค้า
              </h2>
              <p className="text-lg text-gray-600 text-balance">
                เลือกหมวดหมู่ที่คุณสนใจ
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                const Icon = category.icon
                return (
                  <Link key={category.slug} href={`/category/${category.slug}`}>
                    <Card className="hover:shadow-large transition-all duration-300 cursor-pointer group border-0 shadow-soft hover:-translate-y-2 bg-white/80 backdrop-blur-sm" 
                          style={{animationDelay: `${index * 100}ms`}}>
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-soft">
                          <Icon className="w-8 h-8 text-primary-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 text-balance">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-center text-sm text-primary-600 font-medium">
                          <span>{category.count} สินค้า</span>
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-responsive-2xl lg:text-4xl font-bold text-gray-900 mb-4 text-balance">
                สินค้าแนะนำ
              </h2>
              <p className="text-lg text-gray-600 text-balance">
                สินค้าเบอร์ 5 ประหยัดไฟที่ได้รับความนิยม
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse shadow-soft">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gray-200 rounded-t-lg loading-shimmer" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded loading-shimmer" />
                        <div className="h-3 bg-gray-200 rounded w-2/3 loading-shimmer" />
                        <div className="h-6 bg-gray-200 rounded w-1/2 loading-shimmer" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map((product, index) => (
                  <div key={product.id} className="animate-fade-in" style={{animationDelay: `${index * 150}ms`}}>
                    <ProductCard
                      product={product}
                      showEGATInfo={true}
                      showConfidenceScore={true}
                      className="hover:-translate-y-2 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/products">
                <Button variant="outline" size="lg" className="border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 shadow-soft hover:shadow-medium transition-all duration-300 interactive">
                  ดูสินค้าทั้งหมด
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-primary-50/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-responsive-2xl lg:text-4xl font-bold text-gray-900 mb-4 text-balance">
                ทำไมต้องเลือกเรา
              </h2>
              <p className="text-lg text-gray-600 text-balance">
                เราให้ข้อมูลที่ถูกต้องและน่าเชื่อถือ
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="text-center group animate-fade-in" style={{animationDelay: `${index * 200}ms`}}>
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-soft">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed text-balance">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-r from-primary-600 via-green-600 to-emerald-600 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}></div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-responsive-2xl lg:text-4xl font-bold text-white mb-6 text-balance">
                เริ่มประหยัดไฟวันนี้
              </h2>
              <p className="text-lg lg:text-xl text-green-100 mb-8 text-balance leading-relaxed">
                ค้นหาเครื่องใช้ไฟฟ้าเบอร์ 5 ที่เหมาะสมกับบ้านคุณ 
                และเริ่มประหยัดค่าไฟได้ทันที
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/search">
                  <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100 shadow-large hover:shadow-xl transition-all duration-300 interactive">
                    <Zap className="w-5 h-5 mr-2" />
                    ค้นหาสินค้า
                  </Button>
                </Link>
                <Link href="/compare">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 shadow-medium hover:shadow-large transition-all duration-300">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    เปรียบเทียบ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
    </div>
    </SEOOptimizer>
  )
}
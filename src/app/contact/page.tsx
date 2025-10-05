'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import SEOOptimizer from '@/components/SEOOptimizer'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Zap
} from 'lucide-react'
import { SEOGenerator } from '@/lib/seo-generator'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // TODO: Replace with actual API call
      console.log('Contact form submitted:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const seoData = SEOGenerator.generateContactSEO()

  const contactInfo = [
    {
      icon: Mail,
      title: 'อีเมล',
      value: 'info@energyefficient.co.th',
      description: 'ติดต่อทางอีเมล'
    },
    {
      icon: Phone,
      title: 'โทรศัพท์',
      value: '02-123-4567',
      description: 'จันทร์-ศุกร์ 9:00-18:00'
    },
    {
      icon: MapPin,
      title: 'ที่อยู่',
      value: 'กรุงเทพมหานคร, ประเทศไทย',
      description: 'สำนักงานใหญ่'
    },
    {
      icon: Clock,
      title: 'เวลาทำการ',
      value: 'จันทร์-ศุกร์',
      description: '9:00-18:00 น.'
    }
  ]

  const faqs = [
    {
      question: 'ข้อมูลสินค้าอัพเดทบ่อยแค่ไหน?',
      answer: 'ข้อมูลสินค้าจะอัพเดททุกวัน เพื่อให้คุณได้รับข้อมูลล่าสุดเสมอ'
    },
    {
      question: 'ราคาที่แสดงเป็นราคาจริงหรือไม่?',
      answer: 'ราคาที่แสดงเป็นราคาล่าสุดจาก Shopee และอาจมีการเปลี่ยนแปลงตามโปรโมชัน'
    },
    {
      question: 'สามารถเปรียบเทียบสินค้าได้กี่รายการ?',
      answer: 'สามารถเปรียบเทียบสินค้าได้สูงสุด 4 รายการในแต่ละครั้ง'
    },
    {
      question: 'ข้อมูลประหยัดไฟมาจากไหน?',
      answer: 'ข้อมูลประหยัดไฟมาจาก EGAT (องค์การบริหารจัดการก๊าซเรือนกระจก)'
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
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                ติดต่อเรา
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                มีคำถามหรือต้องการความช่วยเหลือ? 
                เราพร้อมให้คำแนะนำเกี่ยวกับเครื่องใช้ไฟฟ้าเบอร์ 5
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Send className="mr-2 h-5 w-5" />
                    ส่งข้อความถึงเรา
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {success && (
                    <Alert className="mb-6">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        ส่งข้อความสำเร็จ! เราจะติดต่อกลับโดยเร็วที่สุด
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="กรอกชื่อ-นามสกุล"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">อีเมล *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="กรอกอีเมล"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">หัวข้อ *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="กรอกหัวข้อข้อความ"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">ข้อความ *</Label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="กรอกข้อความที่ต้องการติดต่อ"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          กำลังส่ง...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="w-4 h-4 mr-2" />
                          ส่งข้อความ
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลการติดต่อ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{info.title}</h4>
                          <p className="text-gray-600">{info.value}</p>
                          <p className="text-sm text-gray-500">{info.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle>คำถามที่พบบ่อย</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>ลิงก์ด่วน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/search" 
                    className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-medium text-gray-900">ค้นหาสินค้า</span>
                    </div>
                  </a>
                  <a 
                    href="/compare" 
                    className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">เปรียบเทียบสินค้า</span>
                    </div>
                  </a>
                  <a 
                    href="/about" 
                    className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="font-medium text-gray-900">เกี่ยวกับเรา</span>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SEOOptimizer>
  )
}

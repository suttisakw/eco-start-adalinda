'use client'

import Link from 'next/link'
import { 
  Zap, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram,
  Youtube,
  ArrowRight
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const categories = [
    { name: 'ตู้เย็น', href: '/category/refrigerator' },
    { name: 'แอร์', href: '/category/air-conditioner' },
    { name: 'เครื่องซักผ้า', href: '/category/washing-machine' },
    { name: 'ไมโครเวฟ', href: '/category/microwave' },
    { name: 'เครื่องทำน้ำอุ่น', href: '/category/water-heater' },
    { name: 'พัดลม', href: '/category/fan' },
  ]

  const quickLinks = [
    { name: 'เกี่ยวกับเรา', href: '/about' },
    { name: 'ติดต่อเรา', href: '/contact' },
    { name: 'นโยบายความเป็นส่วนตัว', href: '/privacy' },
    { name: 'ข้อกำหนดการใช้งาน', href: '/terms' },
    { name: 'คำถามที่พบบ่อย', href: '/faq' },
    { name: 'วิธีสั่งซื้อ', href: '/how-to-order' },
  ]

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'YouTube', href: '#', icon: Youtube },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">เลือกให้คุ้ม.com</h3>
                <p className="text-sm text-gray-400">Energy Efficient</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              เว็บไซต์แนะนำเครื่องใช้ไฟฟ้าประหยัดไฟ 
              เปรียบเทียบราคาและข้อมูลประหยัดพลังงานจาก EGAT
            </p>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="w-4 h-4" />
                <span>info@energyefficient.co.th</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="w-4 h-4" />
                <span>02-123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>กรุงเทพมหานคร, ประเทศไทย</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">หมวดหมู่สินค้า</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-gray-300 hover:text-green-400 text-sm transition-colors flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">ลิงก์ด่วน</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-green-400 text-sm transition-colors flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">ติดตามเรา</h4>
            
            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">
                สมัครรับข่าวสารและโปรโมชันพิเศษ
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="อีเมลของคุณ"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-r-lg transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">ติดตามเราบนโซเชียล</p>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-8 h-8 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                      aria-label={social.name}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">ความน่าเชื่อถือ</p>
              <div className="flex space-x-2">
                <div className="px-2 py-1 bg-green-600 rounded text-xs">
                  <span className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    EGAT
                  </span>
                </div>
                <div className="px-2 py-1 bg-blue-600 rounded text-xs">
                  <span>Shopee</span>
                </div>
                <div className="px-2 py-1 bg-yellow-600 rounded text-xs">
                  <span>SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} เลือกให้คุ้ม.com. สงวนลิขสิทธิ์ทุกประการ
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-green-400 transition-colors">
                นโยบายความเป็นส่วนตัว
              </Link>
              <Link href="/terms" className="hover:text-green-400 transition-colors">
                ข้อกำหนดการใช้งาน
              </Link>
              <Link href="/sitemap" className="hover:text-green-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="กลับไปด้านบน"
      >
        <ArrowRight className="w-6 h-6 rotate-[-90deg]" />
      </button>
    </footer>
  )
}

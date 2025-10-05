import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'เครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ - เปรียบเทียบราคา Shopee',
  description: 'ค้นหาและเปรียบเทียบเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ ข้อมูลจาก EGAT ราคาจาก Shopee พร้อมคำแนะนำการประหยัดพลังงาน',
  keywords: [
    'เครื่องใช้ไฟฟ้าเบอร์ 5',
    'ประหยัดไฟ',
    'EGAT',
    'Shopee',
    'พลังงาน',
    'เครื่องใช้ไฟฟ้าประหยัดพลังงาน'
  ],
  authors: [{ name: 'เว็บไซต์ประหยัดไฟเบอร์ 5' }],
  creator: 'เว็บไซต์ประหยัดไฟเบอร์ 5',
  publisher: 'เว็บไซต์ประหยัดไฟเบอร์ 5',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
    siteName: 'ประหยัดไฟเบอร์ 5',
    title: 'เครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ - เปรียบเทียบราคา Shopee',
    description: 'ค้นหาและเปรียบเทียบเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ ข้อมูลจาก EGAT ราคาจาก Shopee',
    images: [
      {
        url: '/assets/hero-banner.svg',
        width: 1200,
        height: 630,
        alt: 'เครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'เครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ - เปรียบเทียบราคา Shopee',
    description: 'ค้นหาและเปรียบเทียบเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ ข้อมูลจาก EGAT ราคาจาก Shopee',
    images: ['/assets/hero-banner.svg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Header />
          <main>{children}</main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  )
}
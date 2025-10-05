import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import AnalyticsDebugger from '@/components/AnalyticsDebugger'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'เลือกให้คุ้ม.com - เครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ',
  description: 'เลือกให้คุ้ม.com - ค้นหาและเปรียบเทียบเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ ข้อมูลจาก EGAT ราคาจาก Shopee พร้อมคำแนะนำการประหยัดพลังงาน',
  keywords: [
    'เครื่องใช้ไฟฟ้าเบอร์ 5',
    'ประหยัดไฟ',
    'EGAT',
    'Shopee',
    'พลังงาน',
    'เครื่องใช้ไฟฟ้าประหยัดพลังงาน'
  ],
  authors: [{ name: 'เลือกให้คุ้ม.com' }],
  creator: 'เลือกให้คุ้ม.com',
  publisher: 'เลือกให้คุ้ม.com',
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
    siteName: 'เลือกให้คุ้ม.com',
    title: 'เลือกให้คุ้ม.com - เครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ',
    description: 'เลือกให้คุ้ม.com - ค้นหาและเปรียบเทียบเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ ข้อมูลจาก EGAT ราคาจาก Shopee',
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
    title: 'เลือกให้คุ้ม.com - เครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ',
    description: 'เลือกให้คุ้ม.com - ค้นหาและเปรียบเทียบเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ ข้อมูลจาก EGAT ราคาจาก Shopee',
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
        
        {/* Facebook Pixel */}
        {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Header />
          <main>{children}</main>
          <Footer />
          <AnalyticsDebugger />
        </ErrorBoundary>
      </body>
    </html>
  )
}
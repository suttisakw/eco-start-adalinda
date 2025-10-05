import Head from 'next/head'
import { SEOProps, Product } from '@/types'

interface SEOOptimizerProps extends SEOProps {
  children?: React.ReactNode
}

export default function SEOOptimizer({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  product,
  children
}: SEOOptimizerProps) {
  const fullTitle = `${title} | ประหยัดไฟเบอร์ 5`
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // ใช้ redirect URL สำหรับ Facebook sharing เพื่อให้สามารถ track และ redirect ได้
  const facebookUrl = product?.affiliate_url || product?.shopee_url 
    ? `${siteUrl}${url}/redirect?source=facebook`
    : `${siteUrl}${url || ''}`
  const fullUrl = `${siteUrl}${url || ''}`
  const defaultImage = `${siteUrl}/assets/hero-banner.svg`
  const finalImage = image || product?.image_urls?.[0] || defaultImage

  const defaultKeywords = [
    'เครื่องใช้ไฟฟ้าเบอร์ 5',
    'ประหยัดไฟ',
    'EGAT',
    'Shopee',
    'พลังงาน',
    'เครื่องใช้ไฟฟ้าประหยัดพลังงาน'
  ]

  const finalKeywords = [...new Set([...defaultKeywords, ...keywords])]

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={finalKeywords.join(', ')} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="เว็บไซต์ประหยัดไฟเบอร์ 5" />
        <meta name="language" content="th" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={type === 'product' ? 'product' : 'website'} />
        <meta property="og:url" content={facebookUrl} />
        <meta property="og:image" content={finalImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={product?.name || title} />
        <meta property="og:site_name" content="ประหยัดไฟเบอร์ 5" />
        <meta property="og:locale" content="th_TH" />
        
        {/* Product-specific Open Graph Tags */}
        {product && (
          <>
            <meta property="og:price:amount" content={product.price.toString()} />
            <meta property="og:price:currency" content="THB" />
            {product.original_price && product.original_price > product.price && (
              <meta property="og:price:original_amount" content={product.original_price.toString()} />
            )}
            {product.rating > 0 && (
              <>
                <meta property="og:rating" content={product.rating.toString()} />
                <meta property="og:rating_scale" content="5" />
              </>
            )}
            <meta property="product:brand" content={product.egat_product_data?.brand || product.shopee_product_data?.brand || ''} />
            <meta property="product:availability" content="in stock" />
            <meta property="product:condition" content="new" />
            <meta property="product:price:amount" content={product.price.toString()} />
            <meta property="product:price:currency" content="THB" />
            <meta property="product:category" content={product.egat_product_data?.category || product.shopee_product_data?.category || 'เครื่องใช้ไฟฟ้า'} />
          </>
        )}
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={finalImage} />
        <meta name="twitter:image:alt" content={product?.name || title} />
        <meta name="twitter:site" content="@energyefficient" />
        <meta name="twitter:creator" content="@energyefficient" />
        
        {/* Additional Meta Tags for Better Social Sharing */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ประหยัดไฟเบอร์ 5" />
        
        {/* Facebook App ID (ถ้ามี) */}
        <meta property="fb:app_id" content={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''} />
        
        {/* WhatsApp Sharing */}
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:secure_url" content={finalImage} />
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#16a34a" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={fullUrl} />
        
        {/* Product Schema */}
        {product && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                "name": product.name,
                "description": product.description || `${product.name} ${product.egat_product_data?.brand || product.shopee_product_data?.brand || ''} เบอร์ ${product.energy_rating} ประหยัดไฟ`,
                "image": product.image_urls,
                "brand": {
                  "@type": "Brand",
                  "name": product.egat_product_data?.brand || product.shopee_product_data?.brand || ''
                },
                "category": product.egat_product_data?.category || product.shopee_product_data?.category || '',
                "offers": {
                  "@type": "Offer",
                  "price": product.price,
                  "priceCurrency": "THB",
                  "availability": "https://schema.org/InStock",
                  "url": product.shopee_url,
                  "seller": {
                    "@type": "Organization",
                    "name": "Shopee"
                  }
                },
                "aggregateRating": product.rating > 0 ? {
                  "@type": "AggregateRating",
                  "ratingValue": product.rating,
                  "reviewCount": product.review_count
                } : undefined,
                "additionalProperty": [
                  {
                    "@type": "PropertyValue",
                    "name": "ระดับประหยัดไฟ",
                    "value": `เบอร์ ${product.energy_rating}`
                  },
                  {
                    "@type": "PropertyValue",
                    "name": "ประหยัดไฟฟ้า",
                    "value": `${product.energy_consumption_kwh} kWh/ปี`
                  },
                  {
                    "@type": "PropertyValue",
                    "name": "ประหยัดเงิน",
                    "value": `${product.annual_savings_baht} บาท/ปี`
                  }
                ].filter(Boolean)
              })
            }}
          />
        )}
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "เว็บไซต์ประหยัดไฟเบอร์ 5",
              "description": "เว็บไซต์แนะนำเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ เปรียบเทียบราคาและข้อมูลประหยัดพลังงาน",
              "url": process.env.NEXT_PUBLIC_SITE_URL,
              "logo": `${process.env.NEXT_PUBLIC_SITE_URL}/assets/logo.png`,
              "sameAs": [
                "https://facebook.com/energyefficient",
                "https://twitter.com/energyefficient"
              ]
            })
          }}
        />
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ประหยัดไฟเบอร์ 5",
              "description": "เว็บไซต์แนะนำเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ",
              "url": process.env.NEXT_PUBLIC_SITE_URL,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>
      {children}
    </>
  )
}

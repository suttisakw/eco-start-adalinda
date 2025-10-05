import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductService } from '@/lib/productService'
import { SEOGenerator } from '@/lib/seo-generator'
import ProductDetailClient from './ProductDetailClient'

// Generate metadata for this page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const product = await ProductService.getProductBySlug(params.slug)
    
    if (!product) {
      return {
        title: 'ไม่พบสินค้า | เลือกให้คุ้ม.com',
        description: 'ไม่พบสินค้าที่คุณกำลังมองหา',
      }
    }

    const seoData = SEOGenerator.generateProductSEO(product)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    // ใช้ redirect URL สำหรับ Facebook sharing เพื่อให้สามารถ track และ redirect ได้
    const facebookUrl = product.affiliate_url || product.shopee_url 
      ? `${siteUrl}/product/${params.slug}/redirect?source=facebook`
      : `${siteUrl}${seoData.url}`
    
    return {
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords,
      openGraph: {
        title: seoData.title,
        description: seoData.description,
        type: 'website',
        url: facebookUrl,
        images: [
          {
            url: seoData.image || `${siteUrl}/assets/hero-banner.svg`,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        siteName: 'เลือกให้คุ้ม.com',
        locale: 'th_TH',
      },
      twitter: {
        card: 'summary_large_image',
        title: seoData.title,
        description: seoData.description,
        images: [seoData.image || `${siteUrl}/assets/hero-banner.svg`],
        creator: '@energyefficient',
        site: '@energyefficient',
      },
      alternates: {
        canonical: `${siteUrl}${seoData.url}`,
      },
      other: {
        'product:brand': product.egat_product_data?.brand || product.shopee_product_data?.brand || '',
        'product:availability': 'in stock',
        'product:condition': 'new',
        'product:price:amount': product.price.toString(),
        'product:price:currency': 'THB',
        'product:category': product.egat_product_data?.category || product.shopee_product_data?.category || 'เครื่องใช้ไฟฟ้า',
        'og:price:amount': product.price.toString(),
        'og:price:currency': 'THB',
        ...(product.original_price && product.original_price > product.price && {
          'og:price:original_amount': product.original_price.toString(),
        }),
        ...(product.rating > 0 && {
          'og:rating': product.rating.toString(),
          'og:rating_scale': '5',
        }),
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'สินค้า | เลือกให้คุ้ม.com',
      description: 'ดูข้อมูลสินค้าประหยัดไฟ',
    }
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  try {
    const product = await ProductService.getProductBySlug(params.slug)
    
    if (!product) {
      notFound()
    }

    return <ProductDetailClient product={product} />
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound()
  }
}

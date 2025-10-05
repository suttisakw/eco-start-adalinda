import { redirect } from 'next/navigation'
import { ProductService } from '@/lib/productService'
import { trackFacebookClick } from '@/lib/analytics'

interface RedirectPageProps {
  params: {
    slug: string
  }
  searchParams: {
    source?: string
    fbclid?: string
  }
}

export default async function RedirectPage({ params, searchParams }: RedirectPageProps) {
  try {
    const product = await ProductService.getProductBySlug(params.slug)
    
    if (!product) {
      redirect('/')
    }

    // ตรวจสอบว่ามาจาก Facebook หรือไม่
    const isFromFacebook = searchParams.source === 'facebook' || searchParams.fbclid
    
    if (isFromFacebook) {
      // Track Facebook click
      try {
        await trackFacebookClick(params.slug, product.id, product.affiliate_url, product.shopee_url)
      } catch (error) {
        console.error('Error tracking Facebook click:', error)
      }

      if (product.affiliate_url) {
        // Redirect ไปยัง affiliate URL
        redirect(product.affiliate_url)
      } else if (product.shopee_url) {
        // Redirect ไปยัง Shopee URL
        redirect(product.shopee_url)
      } else {
        // Redirect ไปยังหน้า product detail ปกติ
        redirect(`/product/${params.slug}`)
      }
    } else {
      // Redirect ไปยังหน้า product detail ปกติ
      redirect(`/product/${params.slug}`)
    }
  } catch (error) {
    console.error('Error in redirect page:', error)
    redirect('/')
  }
}

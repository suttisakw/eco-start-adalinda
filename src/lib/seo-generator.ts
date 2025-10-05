import { SEOProps, Product, Category } from '@/types'

export class SEOGenerator {
  static generateProductSEO(product: Product): SEOProps {
    const brand = product.egat_product_data?.brand || product.shopee_product_data?.brand || 'ไม่ระบุ'
    const category = product.egat_product_data?.category || product.shopee_product_data?.category || 'เครื่องใช้ไฟฟ้า'
    const energyRating = product.energy_rating || 'A'
    
    // สร้าง title ที่เหมาะสำหรับ Facebook preview
    const title = `${product.name} | ${brand} เบอร์ ${energyRating} ประหยัดไฟ`
    
    // สร้าง description ที่มีข้อมูลสำคัญสำหรับ Facebook
    const priceText = product.original_price && product.original_price > product.price 
      ? `ราคา ${product.price.toLocaleString()} บาท (ลดจาก ${product.original_price.toLocaleString()} บาท)`
      : `ราคา ${product.price.toLocaleString()} บาท`
    
    const savingsText = product.annual_savings_baht 
      ? `ประหยัดไฟ ${product.annual_savings_baht.toLocaleString()} บาท/ปี`
      : 'ประหยัดไฟ'
    
    const ratingText = product.rating > 0 
      ? `⭐ ${product.rating}/5 (${product.review_count.toLocaleString()} รีวิว)`
      : ''
    
    const description = `${product.name} ${brand} เบอร์ ${energyRating} ${category} ${priceText} ${savingsText} ${ratingText} ข้อมูลจาก EGAT ซื้อใน Shopee`
    
    const keywords = [
      product.name,
      brand,
      `เบอร์ ${energyRating}`,
      'ประหยัดไฟ',
      'เครื่องใช้ไฟฟ้า',
      category,
      'EGAT',
      'Shopee',
      `${brand} ${product.name}`,
      `${category} เบอร์ ${energyRating}`
    ].filter(Boolean)
    
    return {
      title,
      description,
      keywords,
      image: product.image_urls?.[0],
      url: `/product/${product.slug}`,
      type: 'product',
      product
    }
  }
  
  static generateCategorySEO(category: Category): SEOProps {
    const categoryNames = {
      'refrigerator': 'ตู้เย็น',
      'air-conditioner': 'แอร์',
      'washing-machine': 'เครื่องซักผ้า',
      'microwave': 'ไมโครเวฟ',
      'water-heater': 'เครื่องทำน้ำอุ่น',
      'fan': 'พัดลม',
      'hair-dryer': 'เครื่องเป่าผม',
      'tv': 'ทีวี',
      'water-pump': 'ปั๊มน้ำ'
    }
    
    const categoryName = categoryNames[category.name as keyof typeof categoryNames] || category.name
    const title = `เครื่องใช้ไฟฟ้า${categoryName}เบอร์ 5 ประหยัดไฟ`
    const description = `เลือกซื้อเครื่องใช้ไฟฟ้า${categoryName}เบอร์ 5 ประหยัดไฟ เปรียบเทียบราคาและข้อมูลประหยัดพลังงานจาก EGAT`
    const keywords = [
      `เครื่องใช้ไฟฟ้า${categoryName}`,
      'เบอร์ 5',
      'ประหยัดไฟ',
      'EGAT',
      'พลังงาน',
      categoryName
    ]
    
    return {
      title,
      description,
      keywords,
      image: category.image_url,
      url: `/category/${category.slug}`,
      type: 'website'
    }
  }
  
  static generateHomepageSEO(): SEOProps {
    return {
      title: 'เครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ - เปรียบเทียบราคา Shopee',
      description: 'ค้นหาและเปรียบเทียบเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ ข้อมูลจาก EGAT ราคาจาก Shopee พร้อมคำแนะนำการประหยัดพลังงาน',
      keywords: [
        'เครื่องใช้ไฟฟ้าเบอร์ 5',
        'ประหยัดไฟ',
        'EGAT',
        'Shopee',
        'พลังงาน',
        'เครื่องใช้ไฟฟ้าประหยัดพลังงาน',
        'ตู้เย็นเบอร์ 5',
        'แอร์ประหยัดไฟ',
        'เครื่องซักผ้าเบอร์ 5'
      ],
      url: '/',
      type: 'website'
    }
  }

  static generateSearchSEO(query: string, resultsCount: number): SEOProps {
    const title = `ค้นหา "${query}" - เครื่องใช้ไฟฟ้าเบอร์ 5`
    const description = `ผลการค้นหา "${query}" พบ ${resultsCount} สินค้าเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ เปรียบเทียบราคาและข้อมูลประหยัดพลังงาน`
    const keywords = [
      query,
      'เครื่องใช้ไฟฟ้าเบอร์ 5',
      'ประหยัดไฟ',
      'EGAT',
      'Shopee'
    ]
    
    return {
      title,
      description,
      keywords,
      url: `/search?q=${encodeURIComponent(query)}`,
      type: 'website'
    }
  }

  static generateCompareSEO(products: Product[]): SEOProps {
    const productNames = products.map(p => p.name).join(', ')
    const title = `เปรียบเทียบ ${products.length} สินค้าเบอร์ 5`
    const description = `เปรียบเทียบ ${productNames} ข้อมูลประหยัดไฟ ราคา และคุณสมบัติจาก EGAT`
    const keywords = [
      'เปรียบเทียบ',
      'เครื่องใช้ไฟฟ้าเบอร์ 5',
      'ประหยัดไฟ',
      'EGAT',
      ...products.map(p => p.name)
    ]
    
    return {
      title,
      description,
      keywords,
      url: '/compare',
      type: 'website'
    }
  }

  static generateBlogSEO(title: string, description: string, tags: string[] = []): SEOProps {
    const fullTitle = `${title} - เคล็ดลับประหยัดไฟ`
    const keywords = [
      'เคล็ดลับประหยัดไฟ',
      'ประหยัดพลังงาน',
      'เครื่องใช้ไฟฟ้า',
      'เบอร์ 5',
      ...tags
    ]
    
    return {
      title: fullTitle,
      description,
      keywords,
      url: `/blog/${title.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'article'
    }
  }

  static generateAboutSEO(): SEOProps {
    return {
      title: 'เกี่ยวกับเรา - เว็บไซต์ประหยัดไฟเบอร์ 5',
      description: 'เว็บไซต์แนะนำเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ เปรียบเทียบราคาและข้อมูลประหยัดพลังงานจาก EGAT',
      keywords: [
        'เกี่ยวกับเรา',
        'ประหยัดไฟ',
        'เครื่องใช้ไฟฟ้าเบอร์ 5',
        'EGAT',
        'พลังงาน'
      ],
      url: '/about',
      type: 'website'
    }
  }

  static generateContactSEO(): SEOProps {
    return {
      title: 'ติดต่อเรา - เว็บไซต์ประหยัดไฟเบอร์ 5',
      description: 'ติดต่อสอบถามเกี่ยวกับเครื่องใช้ไฟฟ้าเบอร์ 5 ประหยัดไฟ คำแนะนำการประหยัดพลังงาน',
      keywords: [
        'ติดต่อเรา',
        'ประหยัดไฟ',
        'เครื่องใช้ไฟฟ้าเบอร์ 5',
        'สอบถาม',
        'คำแนะนำ'
      ],
      url: '/contact',
      type: 'website'
    }
  }
}

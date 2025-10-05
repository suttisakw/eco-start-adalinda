import { ShopeeProduct, ProductSearchRequest, ProductSearchResponse, EGATProduct, MatchingResult } from '@/types'

class ShopeeBackendClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SHOPEE_BACKEND_URL || 'https://api.adalindawongsa.com'
    this.apiKey = process.env.NEXT_PUBLIC_SHOPEE_API_KEY || process.env.SHOPEE_API_KEY || ''
    
    // Debug logging (remove in production)
    if (typeof window !== 'undefined') {
      console.log('🔑 Shopee Backend Client initialized:', {
        baseUrl: this.baseUrl,
        hasApiKey: !!this.apiKey,
        apiKeyLength: this.apiKey.length
      })
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // ค้นหาสินค้า Shopee ที่ตรงกับข้อมูล EGAT
  async searchProducts(request: ProductSearchRequest): Promise<ProductSearchResponse> {
    return this.makeRequest<ProductSearchResponse>('/api/products/search', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // ค้นหาสินค้าด้วย Query Parameters (ตาม Swagger) - รองรับ Dynamic Search
  async searchProductsByQuery(params: {
    q?: string | string[];
    search_in?: string | string[];
    search_mode?: 'AND' | 'OR';
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: ShopeeProduct[]; total: number }> {
    const queryParams = new URLSearchParams()
    
    // Handle q parameter (support array)
    if (params.q) {
      if (Array.isArray(params.q)) {
        queryParams.append('q', params.q.join(','))
      } else {
        queryParams.append('q', params.q)
      }
    }
    
    // Handle search_in parameter (support array)
    if (params.search_in) {
      if (Array.isArray(params.search_in)) {
        queryParams.append('search_in', params.search_in.join(','))
      } else {
        queryParams.append('search_in', params.search_in)
      }
    }
    
    // Handle search_mode parameter
    if (params.search_mode) {
      queryParams.append('search_mode', params.search_mode)
    }
    
    if (params.category) queryParams.append('category', params.category)
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())
    
    console.log('🔍 API Request URL:', `${this.baseUrl}/products?${queryParams.toString()}`)
    console.log('🔑 Request Headers:', {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'NOT_SET'
    })
    
    return this.makeRequest<{ products: ShopeeProduct[]; total: number }>(`/products?${queryParams.toString()}`)
  }

  // ดูรายละเอียดสินค้า
  async getProductDetails(itemId: number): Promise<ShopeeProduct> {
    return this.makeRequest<ShopeeProduct>(`/api/products/${itemId}`)
  }

  // สถิติสินค้า
  async getProductStats(): Promise<any> {
    return this.makeRequest<any>('/api/stats')
  }

  // ดึงข้อมูล EGAT Products จาก Supabase
  async getEGATProducts(params?: {
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: EGATProduct[]; total: number }> {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    
    return this.makeRequest<{ products: EGATProduct[]; total: number }>(`/egat-products?${queryParams.toString()}`)
  }

  // สร้าง Product ใหม่ใน Supabase
  async createProduct(productData: {
    egat_product: EGATProduct;
    shopee_product: ShopeeProduct;
    confidence_score: number;
    affiliate_url?: string;
    status?: 'active' | 'draft' | 'inactive';
    is_featured?: boolean;
  }): Promise<{ success: boolean; product_id?: string; error?: string }> {
    return this.makeRequest<{ success: boolean; product_id?: string; error?: string }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  // ใช้สำหรับ Product Matching ใน Admin Interface
  async findMatchingProducts(egatProduct: EGATProduct): Promise<MatchingResult[]> {
    try {
      // ลองใช้ API แบบ Query Parameters ก่อน
      const searchQueries = [
        `${egatProduct.brand} ${egatProduct.model}`,
        egatProduct.name,
        egatProduct.model,
        egatProduct.brand
      ].filter(Boolean)

      const allResults: ShopeeProduct[] = []

      // ค้นหาด้วยคำค้นหาหลายแบบ
      for (const query of searchQueries) {
        try {
          const response = await this.searchProductsByQuery({
            q: query,
            search_in: 'name,brand,model',
            category: egatProduct.category,
            limit: 5
          })
          allResults.push(...response.products)
        } catch (error) {
          console.warn(`Search failed for query: ${query}`, error)
        }
      }

      // ลบสินค้าที่ซ้ำกัน
      const uniqueProducts = allResults.filter((product, index, self) => 
        index === self.findIndex(p => p.item_id === product.item_id)
      )

      // แปลงเป็น MatchingResult และเรียงตาม confidence score
      const matchingResults = uniqueProducts.map(product => ({
        shopee_product: product,
        confidence_score: this.calculateConfidenceScore(egatProduct, product),
        match_reasons: this.generateMatchReasons(egatProduct, product),
        short_link: '', // จะสร้างใน ShortLinkGenerator
      }))

      // เรียงตาม confidence score จากมากไปน้อย
      return matchingResults
        .sort((a, b) => b.confidence_score - a.confidence_score)
        .slice(0, 10) // เอาแค่ 10 อันดับแรก

    } catch (error) {
      console.warn('Query-based search failed, falling back to POST search', error)
      
      // Fallback เป็น POST method เดิม
      const searchTerms = [
        egatProduct.name,
        egatProduct.brand,
        egatProduct.model,
        `${egatProduct.brand} ${egatProduct.model}`,
      ].filter(Boolean)

      const request: ProductSearchRequest = {
        search_terms: searchTerms,
        category: egatProduct.category,
        brand: egatProduct.brand,
        price_range: {
          min: egatProduct.recommended_price * 0.5,
          max: egatProduct.recommended_price * 1.5,
        },
        limit: 10,
      }

      const response = await this.searchProducts(request)
      
      // แปลงเป็น MatchingResult
      return response.products.map(product => ({
        shopee_product: product,
        confidence_score: this.calculateConfidenceScore(egatProduct, product),
        match_reasons: this.generateMatchReasons(egatProduct, product),
        short_link: '', // จะสร้างใน ShortLinkGenerator
      }))
    }
  }

  // คำนวณ Confidence Score
  private calculateConfidenceScore(egat: EGATProduct, shopee: ShopeeProduct): number {
    let score = 0
    let factors = 0

    // ตรวจสอบชื่อแบรนด์
    if (egat.brand.toLowerCase() === shopee.brand.toLowerCase()) {
      score += 0.4
    } else if (shopee.name.toLowerCase().includes(egat.brand.toLowerCase())) {
      score += 0.2
    }
    factors++

    // ตรวจสอบชื่อรุ่น
    if (egat.model.toLowerCase() === shopee.model.toLowerCase()) {
      score += 0.3
    } else if (shopee.name.toLowerCase().includes(egat.model.toLowerCase())) {
      score += 0.15
    }
    factors++

    // ตรวจสอบราคา
    const priceDiff = Math.abs(egat.recommended_price - shopee.price) / egat.recommended_price
    if (priceDiff <= 0.1) {
      score += 0.2
    } else if (priceDiff <= 0.3) {
      score += 0.1
    }
    factors++

    // ตรวจสอบหมวดหมู่
    if (egat.category.toLowerCase() === shopee.category.toLowerCase()) {
      score += 0.1
    }
    factors++

    return Math.min(score, 1.0)
  }

  // สร้างเหตุผลการจับคู่
  private generateMatchReasons(egat: EGATProduct, shopee: ShopeeProduct): string[] {
    const reasons: string[] = []

    if (egat.brand.toLowerCase() === shopee.brand.toLowerCase()) {
      reasons.push('แบรนด์ตรงกัน')
    }

    if (egat.model.toLowerCase() === shopee.model.toLowerCase()) {
      reasons.push('รุ่นตรงกัน')
    }

    const priceDiff = Math.abs(egat.recommended_price - shopee.price) / egat.recommended_price
    if (priceDiff <= 0.1) {
      reasons.push('ราคาใกล้เคียง')
    }

    if (egat.category.toLowerCase() === shopee.category.toLowerCase()) {
      reasons.push('หมวดหมู่ตรงกัน')
    }

    if (shopee.rating >= 4.0) {
      reasons.push('คะแนนรีวิวสูง')
    }

    if (shopee.review_count >= 100) {
      reasons.push('มีรีวิวจำนวนมาก')
    }

    return reasons
  }
}

export const shopeeBackendClient = new ShopeeBackendClient()

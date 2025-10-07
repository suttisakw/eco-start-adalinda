// lib/shopeeAffiliateApi.ts

interface ShopeeApiConfig {
  partnerId: string
  partnerKey: string
  shopId: string
  baseUrl: string
}

interface ConversionReportRequest {
  start_time: number
  end_time: number
  page?: number
  page_size?: number
  click_id?: string
  conversion_type?: string
}

interface ValidationReportRequest {
  start_time: number
  end_time: number
  page?: number
  page_size?: number
  click_id?: string
}

interface ShortLinkRequest {
  url: string
  sub_id?: string
  custom_values?: Record<string, string>
}

interface ShortLinkResponse {
  code: number
  message: string
  data: {
    short_link: string
    original_url: string
    sub_id: string
    click_id: string
    created_at: number
    expires_at?: number
  }
}

interface ConversionReportResponse {
  code: number
  message: string
  data: {
    conversion_list: Array<{
      click_id: string
      conversion_id: string
      conversion_time: number
      conversion_type: string
      commission_rate: number
      commission_amount: number
      order_amount: number
      order_id: string
      shop_id: string
      product_id: string
      product_name: string
      category_id: string
      status: string
    }>
    total_count: number
    page: number
    page_size: number
  }
}

interface ValidationReportResponse {
  code: number
  message: string
  data: {
    validation_list: Array<{
      click_id: string
      validation_time: number
      validation_status: string
      order_amount: number
      order_id: string
      shop_id: string
      product_id: string
      product_name: string
      category_id: string
      reason?: string
    }>
    total_count: number
    page: number
    page_size: number
  }
}

class ShopeeAffiliateApi {
  private config: ShopeeApiConfig

  constructor() {
    this.config = {
      partnerId: process.env.NEXT_PUBLIC_SHOPEE_PARTNER_ID || '',
      partnerKey: process.env.NEXT_PUBLIC_SHOPEE_PARTNER_KEY || '',
      shopId: process.env.NEXT_PUBLIC_SHOPEE_SHOP_ID || '',
      
      // ตรวจสอบว่ามี API credentials หรือไม่
      ...((!process.env.NEXT_PUBLIC_SHOPEE_PARTNER_ID || !process.env.NEXT_PUBLIC_SHOPEE_PARTNER_KEY) && {
        warning: 'Shopee API credentials not found. Please set NEXT_PUBLIC_SHOPEE_PARTNER_ID and NEXT_PUBLIC_SHOPEE_PARTNER_KEY'
      }),
      baseUrl: 'https://affiliate.shopee.co.th/open_api'
    }
  }

  private generateSignature(params: Record<string, any>, timestamp: number): string {
    // สร้าง signature สำหรับ Shopee API authentication
    // ตามเอกสาร Shopee Affiliate API
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    const stringToSign = `${this.config.partnerId}${timestamp}${sortedParams}`
    
    // ใช้ crypto library สำหรับสร้าง HMAC-SHA256 signature
    // ใน production ควรใช้ server-side implementation
    return btoa(stringToSign) // Placeholder - ใช้ proper HMAC-SHA256
  }

  private async makeRequest<T>(
    endpoint: string, 
    params: Record<string, any>
  ): Promise<T> {
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = this.generateSignature(params, timestamp)

    const requestParams = {
      ...params,
      partner_id: this.config.partnerId,
      timestamp: timestamp.toString(),
      sign: signature
    }

    const queryString = new URLSearchParams(requestParams).toString()
    const url = `${this.config.baseUrl}${endpoint}?${queryString}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EcoV2-Frontend/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Shopee API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.code !== 0) {
        throw new Error(`Shopee API Error: ${data.message}`)
      }

      return data
    } catch (error) {
      console.error('Shopee API Request Error:', error)
      throw error
    }
  }

  async getConversionReport(request: ConversionReportRequest): Promise<ConversionReportResponse> {
    return this.makeRequest<ConversionReportResponse>('/list', {
      type: 'conversion_report',
      ...request
    })
  }

  async getValidationReport(request: ValidationReportRequest): Promise<ValidationReportResponse> {
    return this.makeRequest<ValidationReportResponse>('/list', {
      type: 'validation_report',
      ...request
    })
  }

  async createShortLink(request: ShortLinkRequest): Promise<ShortLinkResponse> {
    return this.makeRequest<ShortLinkResponse>('/list', {
      type: 'short_link',
      ...request
    })
  }

  // Helper methods สำหรับแปลงข้อมูล Shopee เป็นรูปแบบที่ใช้ในระบบ
  transformConversionData(shopeeData: ConversionReportResponse) {
    const conversions = shopeeData.data.conversion_list
    const summary = {
      total_conversions: conversions.length,
      total_revenue: conversions.reduce((sum, conv) => sum + conv.order_amount, 0),
      total_commission: conversions.reduce((sum, conv) => sum + conv.commission_amount, 0),
      avg_order_value: conversions.length > 0 
        ? conversions.reduce((sum, conv) => sum + conv.order_amount, 0) / conversions.length 
        : 0
    }

    // จัดกลุ่มตามหมวดหมู่
    const categoryStats = conversions.reduce((acc, conv) => {
      const category = conv.category_id
      if (!acc[category]) {
        acc[category] = {
          category,
          conversions: 0,
          revenue: 0,
          commission: 0
        }
      }
      acc[category].conversions++
      acc[category].revenue += conv.order_amount
      acc[category].commission += conv.commission_amount
      return acc
    }, {} as Record<string, any>)

    // จัดกลุ่มตามสินค้า
    const productStats = conversions.reduce((acc, conv) => {
      const productId = conv.product_id
      if (!acc[productId]) {
        acc[productId] = {
          id: productId,
          name: conv.product_name,
          conversions: 0,
          revenue: 0,
          commission: 0
        }
      }
      acc[productId].conversions++
      acc[productId].revenue += conv.order_amount
      acc[productId].commission += conv.commission_amount
      return acc
    }, {} as Record<string, any>)

    return {
      summary,
      categoryStats: Object.values(categoryStats),
      productStats: Object.values(productStats),
      rawConversions: conversions
    }
  }

  transformValidationData(shopeeData: ValidationReportResponse) {
    const validations = shopeeData.data.validation_list
    const summary = {
      total_validations: validations.length,
      approved_validations: validations.filter(v => v.validation_status === 'approved').length,
      rejected_validations: validations.filter(v => v.validation_status === 'rejected').length,
      pending_validations: validations.filter(v => v.validation_status === 'pending').length
    }

    return {
      summary,
      rawValidations: validations
    }
  }
}

export const shopeeAffiliateApi = new ShopeeAffiliateApi()

// Types สำหรับ export
export type {
  ConversionReportRequest,
  ValidationReportRequest,
  ShortLinkRequest,
  ShortLinkResponse,
  ConversionReportResponse,
  ValidationReportResponse
}

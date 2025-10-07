import { ShortLinkParams, ParsedLinkData } from '@/types'
import { shopeeAffiliateApi, ShortLinkRequest, ShortLinkResponse } from './shopeeAffiliateApi'

interface ShortLinkResult {
  success: boolean
  shortLink?: string
  clickId?: string
  error?: string
}

class ShopeeShortLinkGenerator {
  private baseUrl = 'https://s.shopee.co.th/an_redir'
  private affiliateId: string
  private useApi: boolean

  constructor() {
    this.affiliateId = process.env.NEXT_PUBLIC_SHOPEE_AFFILIATE_ID || ''
    this.useApi = process.env.NEXT_PUBLIC_SHOPEE_USE_API === 'true'
  }

  // สร้าง Short Link ตามมาตรฐาน Shopee (Legacy method)
  generateShortLink(shopeeUrl: string, params: ShortLinkParams): string {
    const encodedUrl = encodeURIComponent(shopeeUrl)
    const subId = this.generateSubId(params)
    
    return `${this.baseUrl}?origin_link=${encodedUrl}&affiliate_id=${this.affiliateId}&sub_id=${subId}`
  }

  // สร้าง Short Link ผ่าน Shopee API (แนะนำ)
  async generateShortLinkViaApi(shopeeUrl: string, params: ShortLinkParams): Promise<ShortLinkResult> {
    try {
      if (!this.useApi) {
        // Fallback to legacy method if API is disabled
        const shortLink = this.generateShortLink(shopeeUrl, params)
        return {
          success: true,
          shortLink,
          clickId: this.generateNetworkClickId()
        }
      }

      const request: ShortLinkRequest = {
        url: shopeeUrl,
        sub_id: this.generateSubId(params),
        custom_values: params.customValues
      }

      const response: ShortLinkResponse = await shopeeAffiliateApi.createShortLink(request)
      
      if (response.code === 0) {
        return {
          success: true,
          shortLink: response.data.short_link,
          clickId: response.data.click_id
        }
      } else {
        return {
          success: false,
          error: response.message || 'Failed to create short link'
        }
      }
    } catch (error: any) {
      console.error('Error creating short link via API:', error)
      
      // Fallback to legacy method on error
      const shortLink = this.generateShortLink(shopeeUrl, params)
      return {
        success: true,
        shortLink,
        clickId: this.generateNetworkClickId(),
        error: 'API failed, using fallback method'
      }
    }
  }

  // สร้าง Short Link สำหรับสินค้า
  generateProductShortLink(productId: string, shopeeUrl: string): string {
    const params: ShortLinkParams = {
      affiliateId: this.affiliateId,
      subId: `product_${productId}_${Date.now()}`,
      customValues: {
        networkClickId: this.generateNetworkClickId(),
        referralSource: 'product-page',
        customValue1: 'energy-efficient',
        customValue2: 'egat-verified',
      }
    }

    return this.generateShortLink(shopeeUrl, params)
  }

  // สร้าง Short Link สำหรับสินค้าผ่าน API (แนะนำ)
  async generateProductShortLinkViaApi(productId: string, shopeeUrl: string): Promise<ShortLinkResult> {
    const params: ShortLinkParams = {
      affiliateId: this.affiliateId,
      subId: `product_${productId}_${Date.now()}`,
      customValues: {
        networkClickId: this.generateNetworkClickId(),
        referralSource: 'product-page',
        customValue1: 'energy-efficient',
        customValue2: 'egat-verified',
      }
    }

    return this.generateShortLinkViaApi(shopeeUrl, params)
  }

  // สร้าง Short Link สำหรับหน้าแรก
  generateFeaturedShortLink(productId: string, shopeeUrl: string): string {
    const params: ShortLinkParams = {
      affiliateId: this.affiliateId,
      subId: `featured_${productId}_${Date.now()}`,
      customValues: {
        networkClickId: this.generateNetworkClickId(),
        referralSource: 'homepage',
        customValue1: 'featured',
        customValue2: 'energy-efficient',
      }
    }

    return this.generateShortLink(shopeeUrl, params)
  }

  // สร้าง Short Link สำหรับหน้าแรกผ่าน API (แนะนำ)
  async generateFeaturedShortLinkViaApi(productId: string, shopeeUrl: string): Promise<ShortLinkResult> {
    const params: ShortLinkParams = {
      affiliateId: this.affiliateId,
      subId: `featured_${productId}_${Date.now()}`,
      customValues: {
        networkClickId: this.generateNetworkClickId(),
        referralSource: 'homepage',
        customValue1: 'featured',
        customValue2: 'energy-efficient',
      }
    }

    return this.generateShortLinkViaApi(shopeeUrl, params)
  }

  // สร้าง Short Link สำหรับผลการค้นหา
  generateSearchShortLink(productId: string, shopeeUrl: string, searchQuery: string): string {
    const params: ShortLinkParams = {
      affiliateId: this.affiliateId,
      subId: `search_${productId}_${Date.now()}`,
      customValues: {
        networkClickId: this.generateNetworkClickId(),
        referralSource: 'search',
        customValue1: 'search',
        customValue2: searchQuery.substring(0, 20),
      }
    }

    return this.generateShortLink(shopeeUrl, params)
  }

  // สร้าง Short Link สำหรับผลการค้นหาผ่าน API (แนะนำ)
  async generateSearchShortLinkViaApi(productId: string, shopeeUrl: string, searchQuery: string): Promise<ShortLinkResult> {
    const params: ShortLinkParams = {
      affiliateId: this.affiliateId,
      subId: `search_${productId}_${Date.now()}`,
      customValues: {
        networkClickId: this.generateNetworkClickId(),
        referralSource: 'search',
        customValue1: 'search',
        customValue2: searchQuery.substring(0, 20),
      }
    }

    return this.generateShortLinkViaApi(shopeeUrl, params)
  }

  // สร้าง Short Link สำหรับเครื่องมือเปรียบเทียบ
  generateCompareShortLink(productId: string, shopeeUrl: string): string {
    const params: ShortLinkParams = {
      affiliateId: this.affiliateId,
      subId: `compare_${productId}_${Date.now()}`,
      customValues: {
        networkClickId: this.generateNetworkClickId(),
        referralSource: 'compare',
        customValue1: 'comparison',
        customValue2: 'energy-efficient',
      }
    }

    return this.generateShortLink(shopeeUrl, params)
  }

  // สร้าง Short Link สำหรับเครื่องมือเปรียบเทียบผ่าน API (แนะนำ)
  async generateCompareShortLinkViaApi(productId: string, shopeeUrl: string): Promise<ShortLinkResult> {
    const params: ShortLinkParams = {
      affiliateId: this.affiliateId,
      subId: `compare_${productId}_${Date.now()}`,
      customValues: {
        networkClickId: this.generateNetworkClickId(),
        referralSource: 'compare',
        customValue1: 'comparison',
        customValue2: 'energy-efficient',
      }
    }

    return this.generateShortLinkViaApi(shopeeUrl, params)
  }

  // ตรวจสอบ Short Link
  validateShortLink(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.hostname === 's.shopee.co.th' && 
             parsed.pathname === '/an_redir' &&
             parsed.searchParams.has('origin_link') &&
             parsed.searchParams.has('affiliate_id') &&
             parsed.searchParams.has('sub_id')
    } catch {
      return false
    }
  }

  // แยกข้อมูลจาก Short Link
  parseShortLink(url: string): ParsedLinkData | null {
    try {
      const parsed = new URL(url)
      
      if (!this.validateShortLink(url)) {
        return null
      }

      const originalUrl = decodeURIComponent(parsed.searchParams.get('origin_link') || '')
      const affiliateId = parsed.searchParams.get('affiliate_id') || ''
      const subId = parsed.searchParams.get('sub_id') || ''

      // แยก custom values จาก sub_id
      const customValues: Record<string, string> = {}
      if (subId.includes('_')) {
        const parts = subId.split('_')
        if (parts.length >= 3) {
          customValues.referralSource = parts[0]
          customValues.customValue1 = parts[1] || ''
          customValues.customValue2 = parts[2] || ''
        }
      }

      return {
        originalUrl,
        affiliateId,
        subId,
        customValues,
      }
    } catch {
      return null
    }
  }

  // สร้าง Sub ID ตามรูปแบบ Shopee
  private generateSubId(params: ShortLinkParams): string {
    const { subId, customValues } = params
    let result = subId

    if (customValues) {
      const parts = [
        customValues.networkClickId || this.generateNetworkClickId(),
        customValues.referralSource || 'direct',
        customValues.customValue1 || '',
        customValues.customValue2 || '',
      ].filter(Boolean)

      if (parts.length > 0) {
        result = `${subId}-${parts.join('-')}`
      }
    }

    return result
  }

  // สร้าง Network Click ID
  private generateNetworkClickId(): string {
    return `nc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // สร้าง Short Link พร้อม UTM Parameters
  generateShortLinkWithUTM(
    shopeeUrl: string, 
    params: ShortLinkParams,
    utmParams: {
      source?: string;
      medium?: string;
      campaign?: string;
      content?: string;
      term?: string;
    } = {}
  ): string {
    const baseShortLink = this.generateShortLink(shopeeUrl, params)
    
    // เพิ่ม UTM parameters
    const utmUrl = new URL(shopeeUrl)
    if (utmParams.source) utmUrl.searchParams.set('utm_source', utmParams.source)
    if (utmParams.medium) utmUrl.searchParams.set('utm_medium', utmParams.medium)
    if (utmParams.campaign) utmUrl.searchParams.set('utm_campaign', utmParams.campaign)
    if (utmParams.content) utmUrl.searchParams.set('utm_content', utmParams.content)
    if (utmParams.term) utmUrl.searchParams.set('utm_term', utmParams.term)

    // สร้าง Short Link ใหม่ด้วย UTM parameters
    return this.generateShortLink(utmUrl.toString(), params)
  }
}

export const shopeeShortLinkGenerator = new ShopeeShortLinkGenerator()

// Export types
export type { ShortLinkResult }

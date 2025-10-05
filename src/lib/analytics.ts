// Analytics tracking utilities

export interface ClickEvent {
  productId: string
  productSlug: string
  source: 'facebook' | 'twitter' | 'whatsapp' | 'line' | 'direct'
  affiliateUrl?: string
  shopeeUrl?: string
  timestamp: string
  userAgent?: string
  referrer?: string
}

export class AnalyticsTracker {
  private static instance: AnalyticsTracker
  private events: ClickEvent[] = []

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker()
    }
    return AnalyticsTracker.instance
  }

  // Track click event
  async trackClick(event: Omit<ClickEvent, 'timestamp'>): Promise<void> {
    const fullEvent: ClickEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    }

    // Store in memory (in production, you might want to send to analytics service)
    this.events.push(fullEvent)

    // Log for debugging
    console.log('Analytics Event:', fullEvent)

    // In production, you might want to send to:
    // - Google Analytics
    // - Facebook Pixel
    // - Custom analytics service
    // - Database
  }

  // Get events (for debugging)
  getEvents(): ClickEvent[] {
    return [...this.events]
  }

  // Clear events (for testing)
  clearEvents(): void {
    this.events = []
  }
}

// Utility functions
export const trackFacebookClick = async (productSlug: string, productId: string, affiliateUrl?: string, shopeeUrl?: string) => {
  const tracker = AnalyticsTracker.getInstance()
  
  await tracker.trackClick({
    productId,
    productSlug,
    source: 'facebook',
    affiliateUrl,
    shopeeUrl,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    referrer: typeof window !== 'undefined' ? document.referrer : undefined,
  })
}

export const trackSocialShare = async (productSlug: string, productId: string, source: ClickEvent['source']) => {
  const tracker = AnalyticsTracker.getInstance()
  
  await tracker.trackClick({
    productId,
    productSlug,
    source,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    referrer: typeof window !== 'undefined' ? document.referrer : undefined,
  })
}

// Facebook Pixel integration (if you have Facebook Pixel)
export const trackFacebookPixel = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, parameters)
  }
}

// Google Analytics integration (if you have GA)
export const trackGoogleAnalytics = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters)
  }
}

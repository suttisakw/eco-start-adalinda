'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Zap, 
  Clock, 
  Database,
  Wifi,
  RefreshCw
} from 'lucide-react'

interface PerformanceMetrics {
  loadTime: number
  domContentLoaded: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  memoryUsage?: number
  connectionType?: string
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const collectMetrics = () => {
    if (typeof window === 'undefined') return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart
    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
    
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')
    const firstContentfulPaint = fcp ? fcp.startTime : 0

    // Get LCP from PerformanceObserver if available
    let largestContentfulPaint = 0
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        largestContentfulPaint = lastEntry.startTime
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP observer not supported')
    }

    // Memory usage (if available)
    const memoryUsage = (performance as any).memory?.usedJSHeapSize

    // Connection info (if available)
    const connection = (navigator as any).connection
    const connectionType = connection?.effectiveType || 'unknown'

    const newMetrics: PerformanceMetrics = {
      loadTime: Math.round(loadTime),
      domContentLoaded: Math.round(domContentLoaded),
      firstContentfulPaint: Math.round(firstContentfulPaint),
      largestContentfulPaint: Math.round(largestContentfulPaint),
      cumulativeLayoutShift: 0, // Would need CLS observer
      firstInputDelay: 0, // Would need FID observer
      memoryUsage: memoryUsage ? Math.round(memoryUsage / 1024 / 1024) : undefined,
      connectionType
    }

    setMetrics(newMetrics)
  }

  useEffect(() => {
    // Collect metrics after page load
    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 1000)
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectMetrics, 1000)
      })
    }
  }, [])

  const getScoreColor = (value: number, thresholds: { good: number; needs: number }) => {
    if (value <= thresholds.good) return 'bg-green-100 text-green-800'
    if (value <= thresholds.needs) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getScoreText = (value: number, thresholds: { good: number; needs: number }) => {
    if (value <= thresholds.good) return 'ดี'
    if (value <= thresholds.needs) return 'ปานกลาง'
    return 'ต้องปรับปรุง'
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        size="sm"
        variant="outline"
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Performance Monitor
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={collectMetrics}
              size="sm"
              variant="ghost"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="ghost"
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics ? (
          <>
            {/* Load Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-2 text-gray-500" />
                <span className="text-xs">Load Time</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono">{metrics.loadTime}ms</span>
                <Badge 
                  className={`text-xs ${getScoreColor(metrics.loadTime, { good: 1000, needs: 3000 })}`}
                  variant="secondary"
                >
                  {getScoreText(metrics.loadTime, { good: 1000, needs: 3000 })}
                </Badge>
              </div>
            </div>

            {/* First Contentful Paint */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-3 w-3 mr-2 text-gray-500" />
                <span className="text-xs">FCP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono">{metrics.firstContentfulPaint}ms</span>
                <Badge 
                  className={`text-xs ${getScoreColor(metrics.firstContentfulPaint, { good: 1800, needs: 3000 })}`}
                  variant="secondary"
                >
                  {getScoreText(metrics.firstContentfulPaint, { good: 1800, needs: 3000 })}
                </Badge>
              </div>
            </div>

            {/* DOM Content Loaded */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-3 w-3 mr-2 text-gray-500" />
                <span className="text-xs">DOM Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono">{metrics.domContentLoaded}ms</span>
                <Badge 
                  className={`text-xs ${getScoreColor(metrics.domContentLoaded, { good: 800, needs: 1600 })}`}
                  variant="secondary"
                >
                  {getScoreText(metrics.domContentLoaded, { good: 800, needs: 1600 })}
                </Badge>
              </div>
            </div>

            {/* Memory Usage */}
            {metrics.memoryUsage && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="h-3 w-3 mr-2 text-gray-500" />
                  <span className="text-xs">Memory</span>
                </div>
                <span className="text-xs font-mono">{metrics.memoryUsage}MB</span>
              </div>
            )}

            {/* Connection Type */}
            {metrics.connectionType && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wifi className="h-3 w-3 mr-2 text-gray-500" />
                  <span className="text-xs">Connection</span>
                </div>
                <span className="text-xs">{metrics.connectionType}</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">กำลังวิเคราะห์...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

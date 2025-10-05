'use client'

import { useState, useEffect } from 'react'
import { AnalyticsTracker } from '@/lib/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AnalyticsDebugger() {
  const [events, setEvents] = useState<any[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true)
    }
  }, [])

  const refreshEvents = () => {
    const tracker = AnalyticsTracker.getInstance()
    setEvents(tracker.getEvents())
  }

  const clearEvents = () => {
    const tracker = AnalyticsTracker.getInstance()
    tracker.clearEvents()
    setEvents([])
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-gray-900 text-white border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Analytics Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshEvents}
              className="text-xs"
            >
              Refresh
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={clearEvents}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
          
          <div className="text-xs text-gray-300">
            Events: {events.length}
          </div>
          
          <div className="max-h-40 overflow-y-auto space-y-1">
            {events.map((event, index) => (
              <div key={index} className="text-xs bg-gray-800 p-2 rounded">
                <div className="font-medium">{event.source}</div>
                <div className="text-gray-400">{event.productSlug}</div>
                <div className="text-gray-500 text-xs">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

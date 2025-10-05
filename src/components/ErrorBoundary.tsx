'use client'

import React, { Component, ErrorInfo, ReactNode, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to external service if needed
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Here you can integrate with error tracking services like Sentry, LogRocket, etc.
    try {
      // Example: Sentry.captureException(error, { extra: errorInfo })
      console.error('Error logged to service:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>

              {/* Error Message */}
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                เกิดข้อผิดพลาด
              </h2>
              <p className="text-gray-600 mb-6">
                ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="destructive" className="mb-6 text-left">
                  <AlertDescription>
                    <details>
                      <summary className="cursor-pointer font-medium">
                        รายละเอียดข้อผิดพลาด (Development)
                      </summary>
                      <div className="mt-2 text-xs">
                        <p><strong>Error:</strong> {this.state.error.message}</p>
                        {this.state.error.stack && (
                          <pre className="mt-2 whitespace-pre-wrap overflow-auto">
                            {this.state.error.stack}
                          </pre>
                        )}
                      </div>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  ลองใหม่
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  กลับหน้าหลัก
                </Button>
              </div>

              {/* Additional Help */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  หากปัญหายังคงเกิดขึ้น กรุณาติดต่อผู้ดูแลระบบ
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for functional components to trigger error boundary
export function useErrorHandler() {
  return useCallback((error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    // Re-throw the error to trigger the error boundary
    throw error
  }, [])
}
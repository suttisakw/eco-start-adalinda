'use client'

import { useCallback } from 'react'

interface ErrorHandlerOptions {
  showToast?: boolean
  logToConsole?: boolean
  fallbackMessage?: string
}

/**
 * Custom hook for handling errors with consistent user experience
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { 
    showToast = true, 
    logToConsole = true, 
    fallbackMessage = 'เกิดข้อผิดพลาดที่ไม่คาดคิด' 
  } = options

  const handleError = useCallback((
    error: Error | string | unknown,
    context?: string
  ) => {
    // Normalize error to string
    let errorMessage: string
    let errorObject: Error | null = null

    if (typeof error === 'string') {
      errorMessage = error
    } else if (error instanceof Error) {
      errorMessage = error.message
      errorObject = error
    } else {
      errorMessage = fallbackMessage
    }

    // Log to console if enabled
    if (logToConsole) {
      console.error(`Error${context ? ` in ${context}` : ''}:`, errorMessage, errorObject)
    }

    // Show toast notification if enabled
    if (showToast) {
      // Here you can integrate with a toast library like react-hot-toast
      // toast.error(errorMessage)
      console.warn('Toast notification would show:', errorMessage)
    }

    return {
      message: errorMessage,
      error: errorObject,
      context
    }
  }, [showToast, logToConsole, fallbackMessage])

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, context)
      return null
    }
  }, [handleError])

  return {
    handleError,
    handleAsyncError
  }
}

/**
 * Hook for handling network errors
 */
export function useNetworkErrorHandler() {
  const { handleError } = useErrorHandler({
    fallbackMessage: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
  })

  return {
    handleNetworkError: (error: Error | string) => handleError(error, 'Network'),
    handleTimeoutError: (error: Error | string) => handleError(error, 'Timeout'),
    handleServerError: (error: Error | string) => handleError(error, 'Server')
  }
}

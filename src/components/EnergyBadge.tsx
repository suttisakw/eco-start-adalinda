'use client'

import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'
import { formatEnergyRating, getEnergyRatingColor } from '@/lib/utils'

interface EnergyBadgeProps {
  rating: 'A' | 'B' | 'C' | 'D' | 'E'
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'secondary' | 'destructive'
}

export default function EnergyBadge({ 
  rating, 
  showIcon = true, 
  size = 'md',
  variant = 'outline'
}: EnergyBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const ratingColors = {
    'A': 'text-green-600 bg-green-100 border-green-600',
    'B': 'text-blue-600 bg-blue-100 border-blue-600',
    'C': 'text-yellow-600 bg-yellow-100 border-yellow-600',
    'D': 'text-orange-600 bg-orange-100 border-orange-600',
    'E': 'text-red-600 bg-red-100 border-red-600'
  }

  return (
    <Badge 
      variant={variant}
      className={`${sizeClasses[size]} ${ratingColors[rating]} font-medium`}
    >
      {showIcon && (
        <Zap className={`${iconSizes[size]} mr-1`} />
      )}
      {formatEnergyRating(rating)}
    </Badge>
  )
}

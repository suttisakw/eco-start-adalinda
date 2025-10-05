'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Zap, 
  DollarSign, 
  ExternalLink,
  TrendingUp,
  Shield,
  Heart,
  Package
} from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, formatEnergyRating, getEnergyRatingColor, calculatePaybackPeriod } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  showEGATInfo?: boolean
  showConfidenceScore?: boolean
  className?: string
}

export default function ProductCard({ 
  product, 
  showEGATInfo = true, 
  showConfidenceScore = false,
  className = ''
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  const paybackPeriod = product.annual_savings_baht 
    ? calculatePaybackPeriod(product.price, product.annual_savings_baht)
    : 0

  return (
    <Card className={`group hover:shadow-large transition-all duration-300 border-0 shadow-soft overflow-hidden ${className}`}>
      <Link href={`/product/${product.slug}`}>
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            {!imageError && product.image_urls?.[0] ? (
              <Image
                src={product.image_urls[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <Badge 
                variant="outline" 
                className={`${getEnergyRatingColor(product.energy_rating)} border-0`}
              >
                {formatEnergyRating(product.energy_rating)}
              </Badge>
              
              {product.is_featured && (
                <Badge variant="default" className="bg-orange-500">
                  <Star className="w-3 h-3 mr-1" />
                  แนะนำ
                </Badge>
              )}
              
              {product.is_flash_sale && (
                <Badge variant="destructive">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Flash Sale
                </Badge>
              )}
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            >
              <Heart 
                className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
              />
            </button>

            {/* Discount Badge */}
            {product.discount_percentage > 0 && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="destructive" className="bg-red-500">
                  -{product.discount_percentage}%
                </Badge>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-3">
            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>

            {/* Brand */}
            <p className="text-sm text-gray-600">{product.brand}</p>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.review_count.toLocaleString()})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* EGAT Energy Info */}
            {showEGATInfo && product.annual_savings_baht && (
              <div className="bg-gradient-to-r from-primary-50 to-green-50 p-3 rounded-lg space-y-2 border border-primary-100">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-800">
                    ข้อมูลประหยัดไฟ (EGAT)
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">ประหยัดไฟฟ้า:</span>
                    <div className="font-medium text-primary-700">
                      {product.energy_consumption_kwh} kWh/ปี
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">ประหยัดเงิน:</span>
                    <div className="font-medium text-primary-700">
                      {formatPrice(product.annual_savings_baht)}/ปี
                    </div>
                  </div>
                </div>

                {paybackPeriod > 0 && (
                  <div className="text-xs text-gray-600">
                    คืนทุนใน {paybackPeriod} ปี
                  </div>
                )}
              </div>
            )}

            {/* Confidence Score */}
            {showConfidenceScore && product.confidence_score && (
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  ความน่าเชื่อถือ: 
                </span>
                <Badge 
                  variant={product.confidence_score > 0.8 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {Math.round(product.confidence_score * 100)}%
                </Badge>
              </div>
            )}

            {/* Action Button */}
            <Button 
              className="w-full bg-primary-600 hover:bg-primary-700 shadow-soft hover:shadow-medium transition-all duration-300"
              onClick={(e) => {
                e.preventDefault()
                if (product.affiliate_url) {
                  window.open(product.affiliate_url, '_blank')
                } else {
                  window.open(product.shopee_url, '_blank')
                }
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              ดูใน Shopee
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

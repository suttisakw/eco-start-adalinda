'use client'

import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { EGATProduct, ShopeeProduct } from '@/types'
import { shopeeBackendClient } from '@/lib/shopeeBackendClient'
import { shopeeShortLinkGenerator } from '@/lib/shopeeShortLink'
import Step1EgatProductSelection from '@/components/admin/Step1EgatProductSelection'
import Step2ShopeeMatching from '@/components/admin/Step2ShopeeMatching'
import Step3ProductReview from '@/components/admin/Step3ProductReview'
import Step4ProductCustomization from '@/components/admin/Step4ProductCustomization'
import Step5ProductReview from '@/components/admin/Step5ProductReview'
import { ProductService } from '@/lib/productService'

export default function CreateProductPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Selected products from each step
  const [selectedEgatProduct, setSelectedEgatProduct] = useState<EGATProduct | null>(null)
  const [selectedShopeeProduct, setSelectedShopeeProduct] = useState<ShopeeProduct | null>(null)
  const [confidenceScore, setConfidenceScore] = useState(0)
  const [productPreview, setProductPreview] = useState<any>(null)
  const [customizedProduct, setCustomizedProduct] = useState<any>(null)

  // Step handlers
  const handleEgatProductSelect = (product: EGATProduct) => {
    setSelectedEgatProduct(product)
    setError('')
    setStep(2)
  }

  const handleShopeeProductSelect = (product: ShopeeProduct, confidence: number) => {
    setSelectedShopeeProduct(product)
    setConfidenceScore(confidence)
    
    // Create product preview
    const modelFromRawData = selectedEgatProduct?.specifications?.รุ่น || selectedEgatProduct?.specifications?.model || selectedEgatProduct?.model || ''
    const preview = {
      name: `${selectedEgatProduct?.brand} ${modelFromRawData}`.trim(),
      price: product.price,
      energy_rating: selectedEgatProduct?.energy_rating,
      annual_savings_baht: selectedEgatProduct?.annual_savings_baht || 0,
      rating: product.rating,
      review_count: product.review_count,
      specifications: {
        ...selectedEgatProduct?.specifications,
        shopee_rating: product.rating,
        shopee_reviews: product.review_count,
        shopee_price: product.price,
        discount_percentage: product.discount_percentage
      }
    }
    
    setProductPreview(preview)
    setError('')
    setStep(4) // Go to Step 4 (Customization) instead of Step 3
  }

  const handleBackToStep1 = () => {
    setStep(1)
    setSelectedShopeeProduct(null)
    setConfidenceScore(0)
    setProductPreview(null)
    setError('')
  }

  const handleBackToStep2 = () => {
    setStep(2)
    setSelectedShopeeProduct(null)
    setConfidenceScore(0)
    setProductPreview(null)
    setCustomizedProduct(null)
    setError('')
  }

  const handleBackToStep3 = () => {
    setStep(3)
    setCustomizedProduct(null)
    setError('')
  }

  const handleBackToStep4 = () => {
    setStep(4)
    setError('')
  }

  const handleProductCustomize = (customized: any) => {
    setCustomizedProduct(customized)
    setError('')
    setStep(5) // Go to Step 5 (Final Review)
  }

  const handleCreateProduct = async () => {
    if (!selectedEgatProduct || !selectedShopeeProduct || !customizedProduct) {
      setError('กรุณาเลือกสินค้าและปรับแต่งข้อมูลให้ครบถ้วน')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Generate affiliate URL
      const affiliateUrl = ProductService.generateAffiliateUrl(
        selectedShopeeProduct.shopee_url,
        selectedEgatProduct.id,
        selectedShopeeProduct.item_id
      )

      // Create product using ProductService
      const product = await ProductService.createProduct({
        name: customizedProduct.name,
        slug: customizedProduct.slug,
        description: customizedProduct.description,
        shopee_product_id: selectedShopeeProduct.item_id,
        shopee_url: selectedShopeeProduct.shopee_url,
        affiliate_url: affiliateUrl,
        price: customizedProduct.price,
        original_price: customizedProduct.original_price,
        discount_percentage: customizedProduct.discount_percentage,
        rating: selectedShopeeProduct.rating,
        review_count: selectedShopeeProduct.review_count,
        energy_rating: selectedEgatProduct.energy_rating,
        energy_consumption_kwh: selectedEgatProduct.energy_consumption,
        annual_savings_baht: selectedEgatProduct.annual_savings_baht,
        image_urls: customizedProduct.image_urls,
        status: 'draft',
        is_featured: customizedProduct.is_featured,
        is_flash_sale: customizedProduct.is_flash_sale,
        flash_sale_end_time: customizedProduct.flash_sale_end_time,
        meta_title: customizedProduct.meta_title,
        meta_description: customizedProduct.meta_description,
        egat_product_data: selectedEgatProduct,
        shopee_product_data: selectedShopeeProduct,
        specifications: {
          ...selectedEgatProduct.specifications,
          ...selectedShopeeProduct.specifications
        },
        egat_id: selectedEgatProduct.id,
        confidence_score: confidenceScore,
        data_source: 'egat_shopee_matched'
      })

      setSuccess(`สร้างสินค้าสำเร็จ! Product ID: ${product.id}`)
      
      // Reset form
      setStep(1)
      setSelectedEgatProduct(null)
      setSelectedShopeeProduct(null)
      setConfidenceScore(0)
      setProductPreview(null)
      setCustomizedProduct(null)
      
    } catch (error: any) {
      console.error('Error creating product:', error)
      setError('ไม่สามารถสร้างสินค้าได้: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">สร้างสินค้าใหม่</h1>
          <p className="text-gray-600">
            เลือกสินค้า EGAT และจับคู่กับสินค้า Shopee เพื่อสร้างสินค้าใหม่
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 overflow-x-auto">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    step === stepNumber
                      ? 'bg-blue-600 text-white'
                      : step > stepNumber
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > stepNumber ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className="ml-2 text-xs min-w-0">
                  <div className={`font-medium whitespace-nowrap ${step >= stepNumber ? 'text-gray-900' : 'text-gray-500'}`}>
                    {stepNumber === 1 && 'เลือก EGAT'}
                    {stepNumber === 2 && 'จับคู่ Shopee'}
                    {stepNumber === 3 && 'รีวิว'}
                    {stepNumber === 4 && 'ปรับแต่ง'}
                    {stepNumber === 5 && 'สร้าง'}
                  </div>
                </div>
                {stepNumber < 5 && (
                  <div className={`w-8 h-0.5 ml-2 ${step > stepNumber ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="space-y-6">
          {step === 1 && (
            <Step1EgatProductSelection
              onProductSelect={handleEgatProductSelect}
              loading={loading}
            />
          )}

          {step === 2 && selectedEgatProduct && (
            <Step2ShopeeMatching
              selectedEgatProduct={selectedEgatProduct}
              onProductSelect={handleShopeeProductSelect}
              onBack={handleBackToStep1}
              loading={loading}
            />
          )}

          {step === 3 && selectedEgatProduct && selectedShopeeProduct && productPreview && (
            <Step3ProductReview
              selectedEgatProduct={selectedEgatProduct}
              selectedShopeeProduct={selectedShopeeProduct}
              confidenceScore={confidenceScore}
              productPreview={productPreview}
              onCreateProduct={() => setStep(4)}
              onBack={handleBackToStep2}
              loading={loading}
            />
          )}

          {step === 4 && selectedEgatProduct && selectedShopeeProduct && (
            <Step4ProductCustomization
              selectedEgatProduct={selectedEgatProduct}
              selectedShopeeProduct={selectedShopeeProduct}
              confidenceScore={confidenceScore}
              onProductCustomize={handleProductCustomize}
              onBack={handleBackToStep2}
              loading={loading}
            />
          )}

          {step === 5 && selectedEgatProduct && selectedShopeeProduct && customizedProduct && (
            <Step5ProductReview
              customizedProduct={customizedProduct}
              selectedEgatProduct={selectedEgatProduct}
              selectedShopeeProduct={selectedShopeeProduct}
              confidenceScore={confidenceScore}
              onCreateProduct={handleCreateProduct}
              onBack={handleBackToStep4}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
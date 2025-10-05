-- Create products table for storing combined EGAT + Shopee product data
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Product Information
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  
  -- Shopee Integration
  shopee_product_id BIGINT,
  shopee_url TEXT,
  affiliate_url TEXT,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2) DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  
  -- Ratings and Reviews
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Energy Efficiency (EGAT Data)
  energy_rating VARCHAR(10),
  energy_consumption_kwh DECIMAL(10,2),
  annual_savings_baht DECIMAL(10,2),
  
  -- Images
  image_urls JSONB DEFAULT '[]'::jsonb,
  
  -- Product Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_flash_sale BOOLEAN DEFAULT FALSE,
  flash_sale_end_time TIMESTAMPTZ,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Raw Data Storage (for flexibility)
  egat_product_data JSONB,
  shopee_product_data JSONB,
  specifications JSONB DEFAULT '{}'::jsonb,
  
  -- Matching Information
  egat_id VARCHAR(50),
  confidence_score DECIMAL(3,2),
  data_source VARCHAR(50) DEFAULT 'egat_shopee_matched',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_energy_rating ON products(energy_rating);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_flash_sale ON products(is_flash_sale);
CREATE INDEX IF NOT EXISTS idx_products_shopee_product_id ON products(shopee_product_id);
CREATE INDEX IF NOT EXISTS idx_products_egat_id ON products(egat_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE products IS 'Combined product data from EGAT and Shopee with customizations';
COMMENT ON COLUMN products.shopee_product_id IS 'Shopee product ID for tracking';
COMMENT ON COLUMN products.affiliate_url IS 'Generated affiliate link for Shopee';
COMMENT ON COLUMN products.energy_rating IS 'Energy efficiency rating from EGAT (A, B, C, D, E)';
COMMENT ON COLUMN products.annual_savings_baht IS 'Annual electricity cost savings in THB';
COMMENT ON COLUMN products.image_urls IS 'Array of product image URLs';
COMMENT ON COLUMN products.egat_product_data IS 'Raw EGAT product data as JSON';
COMMENT ON COLUMN products.shopee_product_data IS 'Raw Shopee product data as JSON';
COMMENT ON COLUMN products.confidence_score IS 'Matching confidence score (0.0-1.0)';
COMMENT ON COLUMN products.data_source IS 'Source of data: egat, shopee, egat_shopee_matched, manual';

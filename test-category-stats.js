// Test script to check category stats
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCategoryStats() {
  try {
    console.log('Testing egat_category_stats view...')
    
    const { data, error } = await supabase
      .from('egat_category_stats')
      .select('category, total_products')
      .order('total_products', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error:', error)
      return
    }

    console.log('Category stats:', data)
  } catch (error) {
    console.error('Error:', error)
  }
}

testCategoryStats()

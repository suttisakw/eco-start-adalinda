import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'eco-v2-frontend'
    }
  }
})

// Server-side Supabase client
export const createServerClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Admin authentication functions
export const signInAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOutAdmin = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentAdmin = async () => {
  // First get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { user: null, error: authError }
  }

  // Then get the profile data from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    // If profile doesn't exist, create a default profile
    console.warn('Profile not found in database, creating default profile:', profileError)
    
    try {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          first_name: user.user_metadata?.first_name || 'Admin',
          last_name: user.user_metadata?.last_name || 'User',
          role: 'admin' // Default to admin for now
        })
        .select()
        .single()

      if (insertError) {
        console.error('Failed to create profile:', insertError)
        // Return user without profile if we can't create one
        return { user, error: insertError }
      }

      // Merge auth user with new profile data
      const userWithProfile = {
        ...user,
        ...newProfile
      }

      return { user: userWithProfile, error: null }
    } catch (error) {
      console.error('Error creating profile:', error)
      // Return user without profile if we can't create one
      return { user, error }
    }
  }

  // Merge auth user with existing profile data
  const userWithProfile = {
    ...user,
    ...profile
  }

  return { user: userWithProfile, error: null }
}

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// Verify admin email (legacy - for fallback)
export const verifyAdminEmail = async (email: string) => {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  return email === adminEmail
}

// Cache for admin role verification
const adminRoleCache = new Map<string, { isAdmin: boolean; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * ตรวจสอบ admin role พร้อม caching
 * @param userId - User ID ที่ต้องการตรวจสอบ
 * @param useCache - ใช้ cache หรือไม่ (default: true)
 * @returns Promise<boolean> - true ถ้าเป็น admin
 */
export const verifyAdminRole = async (userId: string, useCache: boolean = true) => {
  try {
    // ตรวจสอบ cache ก่อน (ถ้าเปิดใช้งาน)
    if (useCache) {
      const cached = adminRoleCache.get(userId)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('🔐 Using cached admin role:', { userId, isAdmin: cached.isAdmin })
        return cached.isAdmin
      }
    }

    console.log('🔐 Checking admin role for user:', userId)
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.warn('🔐 Profile not found or error:', error)
      // Cache negative result
      if (useCache) {
        adminRoleCache.set(userId, { isAdmin: false, timestamp: Date.now() })
      }
      return false
    }

    const isAdmin = profile?.role === 'admin'
    console.log('🔐 User role check result:', { role: profile?.role, isAdmin })
    
    // Cache result
    if (useCache) {
      adminRoleCache.set(userId, { isAdmin, timestamp: Date.now() })
    }
    
    return isAdmin
  } catch (error) {
    console.error('🔐 Error checking admin role:', error)
    // Cache negative result on error
    if (useCache) {
      adminRoleCache.set(userId, { isAdmin: false, timestamp: Date.now() })
    }
    return false
  }
}

/**
 * ล้าง cache ของ admin role
 * @param userId - User ID ที่ต้องการล้าง cache (ถ้าไม่ระบุจะล้างทั้งหมด)
 */
export const clearAdminRoleCache = (userId?: string) => {
  try {
    if (userId) {
      adminRoleCache.delete(userId)
      console.log('🔐 Cleared admin role cache for user:', userId)
    } else {
      adminRoleCache.clear()
      console.log('🔐 Cleared all admin role cache')
    }
  } catch (error) {
    console.error('🔐 Error clearing admin role cache:', error)
  }
}

/**
 * ตรวจสอบ admin role แบบไม่ใช้ cache (สำหรับการอัพเดททันที)
 * @param userId - User ID ที่ต้องการตรวจสอบ
 * @returns Promise<boolean> - true ถ้าเป็น admin
 */
export const verifyAdminRoleFresh = async (userId: string) => {
  return verifyAdminRole(userId, false)
}

/**
 * Refresh session and validate admin role
 * @returns Promise<{ success: boolean; error?: string }>
 */
export const refreshSessionAndValidate = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('Session refresh error:', error)
      return { success: false, error: error.message }
    }

    if (!data.session?.user) {
      return { success: false, error: 'No valid session found' }
    }

    // Verify admin role after refresh
    const isAdmin = await verifyAdminRole(data.session.user.id)
    if (!isAdmin) {
      return { success: false, error: 'User is not admin' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error refreshing session:', error)
    return { success: false, error: error.message || 'Session refresh failed' }
  }
}

/**
 * Enhanced session validation with automatic refresh
 * @returns Promise<{ isValid: boolean; needsRefresh: boolean; error?: string }>
 */
export const validateSessionWithRefresh = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return { isValid: false, needsRefresh: false, error: error.message }
    }

    if (!session) {
      return { isValid: false, needsRefresh: false, error: 'No session found' }
    }

    // Check if session is expired or will expire soon (within 5 minutes)
    const expiresAt = session.expires_at
    if (!expiresAt) {
      return { isValid: false, needsRefresh: true, error: 'Session has no expiration time' }
    }
    
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = expiresAt - now

    if (timeUntilExpiry < 300) { // 5 minutes
      console.log('Session expires soon, refreshing...')
      const refreshResult = await refreshSessionAndValidate()
      
      if (!refreshResult.success) {
        return { isValid: false, needsRefresh: true, error: refreshResult.error }
      }
      
      return { isValid: true, needsRefresh: true }
    }

    // Verify admin role
    const isAdmin = await verifyAdminRole(session.user.id)
    if (!isAdmin) {
      return { isValid: false, needsRefresh: false, error: 'User is not admin' }
    }

    return { isValid: true, needsRefresh: false }
  } catch (error: any) {
    console.error('Session validation error:', error)
    return { isValid: false, needsRefresh: false, error: error.message || 'Session validation failed' }
  }
}

/**
 * Debug and fix user profile
 * @param userId - User ID to debug
 * @returns Promise<{ success: boolean; message: string; data?: any }>
 */
/**
 * Debug login process step by step
 * @returns Promise<{ success: boolean; message: string; data?: any }>
 */
export const debugLoginProcess = async (email: string, password: string) => {
  try {
    console.log('🔍 Starting debug login process for:', email)
    
    // Step 1: Try to sign in
    console.log('📝 Step 1: Attempting sign in...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return {
        success: false,
        message: `Sign in failed: ${error.message}`,
        data: { step: 1, error }
      }
    }
    
    console.log('✅ Step 1: Sign in successful, user ID:', data.user?.id)
    
    // Step 2: Check if user exists
    console.log('📝 Step 2: Checking user data...')
    if (!data.user) {
      return {
        success: false,
        message: 'No user data returned from sign in',
        data: { step: 2, error: 'No user data' }
      }
    }
    
    console.log('✅ Step 2: User data exists')
    
    // Step 3: Check profile in database
    console.log('📝 Step 3: Checking profile in database...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single()
    
    if (profileError) {
      console.log('⚠️ Step 3: Profile error:', profileError)
      return {
        success: false,
        message: `Profile check failed: ${profileError.message}`,
        data: { step: 3, error: profileError, user: data.user }
      }
    }
    
    console.log('✅ Step 3: Profile found:', profile?.email, 'Role:', profile?.role)
    
    // Step 4: Check admin role
    console.log('📝 Step 4: Checking admin role...')
    const isAdmin = profile?.role === 'admin'
    
    if (!isAdmin) {
      return {
        success: false,
        message: `User is not admin. Current role: ${profile?.role || 'null'}`,
        data: { step: 4, profile, isAdmin: false }
      }
    }
    
    console.log('✅ Step 4: Admin role confirmed')
    
    return {
      success: true,
      message: 'Login process debug completed successfully',
      data: { 
        step: 4, 
        user: data.user, 
        profile, 
        isAdmin: true,
        session: data.session 
      }
    }
    
  } catch (error: any) {
    console.error('❌ Debug login process error:', error)
    return {
      success: false,
      message: `Unexpected error: ${error.message}`,
      data: { error }
    }
  }
}

export const debugAndFixProfile = async (userId?: string) => {
  try {
    // Get current user if no userId provided
    let targetUserId = userId
    if (!targetUserId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { success: false, message: 'No authenticated user found' }
      }
      targetUserId = user.id
    }

    console.log('🔍 Debugging profile for user:', targetUserId)

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create one
      console.log('📝 Creating profile for user:', targetUserId)
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: targetUserId,
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin'
        })
        .select()
        .single()

      if (insertError) {
        return { 
          success: false, 
          message: 'Failed to create profile: ' + insertError.message,
          data: { error: insertError }
        }
      }

      return { 
        success: true, 
        message: 'Profile created successfully',
        data: { profile: newProfile, action: 'created' }
      }
    } else if (profileError) {
      return { 
        success: false, 
        message: 'Error checking profile: ' + profileError.message,
        data: { error: profileError }
      }
    }

    // Profile exists, check if it has admin role
    if (profile.role !== 'admin') {
      console.log('🔧 Updating profile role to admin for user:', targetUserId)
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('user_id', targetUserId)
        .select()
        .single()

      if (updateError) {
        return { 
          success: false, 
          message: 'Failed to update profile role: ' + updateError.message,
          data: { error: updateError }
        }
      }

      return { 
        success: true, 
        message: 'Profile role updated to admin',
        data: { profile: updatedProfile, action: 'updated' }
      }
    }

    return { 
      success: true, 
      message: 'Profile is valid and has admin role',
      data: { profile, action: 'verified' }
    }

  } catch (error: any) {
    console.error('❌ Error in debugAndFixProfile:', error)
    return { 
      success: false, 
      message: 'Unexpected error: ' + error.message,
      data: { error }
    }
  }
}

// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// 🧭 Middleware หลัก
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = req.nextUrl

  // Debug logging
  console.log('🔍 Middleware Debug:', {
    pathname,
    hasSession: !!session,
    sessionUser: session?.user?.email || 'No user',
    timestamp: new Date().toISOString()
  })

  // ✅ หน้า public ที่ไม่ต้องเช็ก (ป้องกัน redirect loop)
  const publicPaths = ['/login', '/', '/search', '/category', '/product', '/about', '/contact', '/favorites', '/compare']

  // ✅ กลุ่ม path ที่ต้องล็อกอินก่อนเข้า
  const protectedPaths = ['/dashboard', '/settings', '/profile']

  // ✅ กลุ่ม path ที่เฉพาะ admin (รวมทุก sub-path)
  const adminPaths = ['/admin']

  // เช็ค admin paths ก่อน
  if (pathname.startsWith('/admin')) {
    console.log('🔐 Admin path detected:', pathname)
    
    // ถ้าไม่มี session → redirect ไปหน้า login
    if (!session) {
      console.log('❌ No session, redirecting to login')
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      
      // เพิ่ม cache control เพื่อป้องกัน caching ของ redirect
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      return response
    }
    
    console.log('✅ Session found, checking admin role for user:', session.user.email)
    
    // ถ้ามี session แต่ไม่ใช่ admin → redirect ไปหน้า unauthorized
    try {
      console.log('ถ้ามี session แต่ไม่ใช่ admin → redirect ไปหน้า unauthorized')
      const { data: user, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()

      console.log('👤 User profile check result:', { user, error })

      if (error || !user || user.role !== 'admin') {
        console.log('❌ User is not admin, redirecting to unauthorized')
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/unauthorized'
        return NextResponse.redirect(redirectUrl)
      }
      
      console.log('✅ User is admin, allowing access')
    } catch (error) {
      console.error('❌ Error checking admin role:', error)
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
    
    // ถ้าเป็น admin ให้ผ่าน
    return res
  }

  // ถ้า path นี้เป็น public → ปล่อยผ่าน
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return res
  }

  // ถ้าไม่มี session และเป็น protected path → redirect ไปหน้า /login
  if (!session && protectedPaths.some((p) => pathname.startsWith(p))) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// 🧩 กำหนดให้ middleware ทำงานเฉพาะ path ที่ต้องการ
export const config = {
  matcher: [
    // ✅ ตรวจทุกหน้า ยกเว้น API, static files, และ favicon
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}

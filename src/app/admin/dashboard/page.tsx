'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      // ลองโหลดจาก localStorage ก่อน (remember me)
      const local = localStorage.getItem('supabaseSession')
      const session = local
        ? JSON.parse(local)
        : JSON.parse(sessionStorage.getItem('supabaseSession') || 'null')

      if (session?.access_token) {
        // บอก supabase ให้ใช้ session นี้ต่อ
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        })
      }

      // ตรวจสอบว่ามี user ไหม
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
      setLoading(false)
    }

    restoreSession()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('supabaseSession')
    sessionStorage.removeItem('supabaseSession')
    router.push('/login')
  }

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </main>
  )
}

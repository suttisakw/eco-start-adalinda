'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const router = useRouter()
  const supabaseClient = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ตรวจสอบ session เมื่อ component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (session) {
        const redirectTo = new URLSearchParams(window.location.search).get('redirectTo') || '/admin'
        router.push(redirectTo)
      }
    }
    
    checkSession()
  }, [router, supabaseClient])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      // ใช้ Supabase client component เพื่อ sync session กับ middleware
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMsg(error.message)
        return
      }

      if (data.session) {
        // ถ้า remember = true → เก็บ session ใน localStorage
        // ถ้า false → ใช้ session แค่ตอนเปิดแท็บ (sessionStorage)
        if (remember) {
          localStorage.setItem('supabaseSession', JSON.stringify(data.session))
        } else {
          sessionStorage.setItem('supabaseSession', JSON.stringify(data.session))
        }

        // รอให้ session sync กับ middleware
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // ใช้ router.push หลังจาก session sync แล้ว
        const redirectTo = new URLSearchParams(window.location.search).get('redirectTo') || '/admin'
        router.push(redirectTo)
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'เกิดข้อผิดพลาดในการล็อกอิน')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md w-80"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <label className="flex items-center gap-2 mb-4 text-sm">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember me
        </label>

        {errorMsg && <p className="text-red-500 mb-3">{errorMsg}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 rounded font-medium transition-colors ${
            isLoading 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'กำลังล็อกอิน...' : 'Login'}
        </button>
      </form>
    </main>
  )
}

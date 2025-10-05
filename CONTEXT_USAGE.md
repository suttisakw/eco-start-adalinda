# การใช้งาน Auth Context และ Hooks

## 🔐 Auth Context

Auth Context ช่วยจัดการ state ของ authentication ทั้งแอป โดยมีฟีเจอร์หลักดังนี้:

### Features
- ✅ **Centralized Auth State** - จัดการ user, session, loading state ในที่เดียว
- ✅ **Auto Profile Fetching** - ดึงข้อมูล profile อัตโนมัติหลัง login
- ✅ **Admin Verification** - ตรวจสอบสิทธิ์ admin อัตโนมัติ
- ✅ **Session Management** - จัดการ session และ refresh
- ✅ **Error Handling** - จัดการ error ที่เกิดขึ้น

## 🎯 การใช้งาน useAuth Hook

### Basic Usage
```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAdmin, loading, login, logout } = useAuth()

  if (loading) return <div>Loading...</div>
  
  if (!user) {
    return <div>Please login</div>
  }

  return (
    <div>
      <p>Welcome: {user.email}</p>
      {isAdmin && <p>You have admin access</p>}
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Login Form
```tsx
import { useAuth } from '@/contexts/AuthContext'

function LoginForm() {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login(email, password)
    
    if (result.success) {
      // Login successful - Context will handle state updates
      router.push('/admin')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

## 🛡️ Auth Guard Hooks

### useAuthGuard - ป้องกันหน้าทั่วไป
```tsx
import { useAuthGuard } from '@/hooks/useAuthGuard'

function ProtectedPage() {
  const { user, loading, isAuthenticated } = useAuthGuard('/login')

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return null // Will redirect

  return <div>Protected content</div>
}
```

### useAdminGuard - ป้องกันหน้า Admin
```tsx
import { useAdminGuard } from '@/hooks/useAuthGuard'

function AdminPage() {
  const { user, loading, hasAdminAccess } = useAdminGuard()

  if (loading) return <div>Loading...</div>
  if (!hasAdminAccess) return null // Will redirect

  return <div>Admin only content</div>
}
```

### useGuestGuard - Redirect ผู้ที่ login แล้ว
```tsx
import { useGuestGuard } from '@/hooks/useAuthGuard'

function LoginPage() {
  const { loading, isGuest } = useGuestGuard('/admin')

  if (loading) return <div>Loading...</div>
  if (!isGuest) return null // Will redirect

  return <div>Login form</div>
}
```

## 📱 Component Examples

### Header Component with Auth
```tsx
import { useAuth } from '@/contexts/AuthContext'

function Header() {
  const { user, isAdmin, logout } = useAuth()

  return (
    <header>
      <nav>
        <Link href="/">Home</Link>
        {isAdmin && <Link href="/admin">Admin</Link>}
        
        {user ? (
          <div>
            <span>Welcome, {user.email}</span>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </nav>
    </header>
  )
}
```

### Admin Layout with Context
```tsx
import { useAuth } from '@/contexts/AuthContext'
import { useAdminGuard } from '@/hooks/useAuthGuard'

function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { loading, hasAdminAccess } = useAdminGuard()

  if (loading) return <div>Loading...</div>
  if (!hasAdminAccess) return null

  return (
    <div className="admin-layout">
      <aside>
        <p>Admin: {user?.email}</p>
        <button onClick={logout}>Logout</button>
      </aside>
      <main>{children}</main>
    </div>
  )
}
```

## 🔄 State Management

### Auth Context State
```tsx
interface AuthContextType {
  user: User | null              // ข้อมูล user จาก Supabase
  session: Session | null        // Session จาก Supabase
  loading: boolean               // สถานะ loading
  isAdmin: boolean               // สิทธิ์ admin
  login: (email, password) => Promise<{success, error?}>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}
```

### Loading States
- **Initial Load**: ตรวจสอบ session ที่มีอยู่
- **Login Process**: ระหว่างการ login
- **Profile Fetch**: ดึงข้อมูล profile หลัง login
- **Logout Process**: ระหว่างการ logout

## 🚨 Error Handling

### Login Errors
```tsx
const result = await login(email, password)

if (!result.success) {
  switch (result.error) {
    case 'คุณไม่มีสิทธิ์เข้าถึงระบบ Admin':
      // Handle admin permission error
      break
    case 'อีเมลหรือรหัสผ่านไม่ถูกต้อง':
      // Handle invalid credentials
      break
    case 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ':
      // Handle unconfirmed email
      break
    default:
      // Handle other errors
  }
}
```

## 🔧 Debug และ Troubleshooting

### Console Logs
Context จะแสดง debug logs ใน console:
```
Initializing auth state...
Current session: {...}
Admin status: true
User profile: {...}
Context: Login successful, updating state...
```

### Common Issues
1. **Context not found**: ตรวจสอบว่า component อยู่ใน `<AuthProvider>`
2. **Infinite redirects**: ตรวจสอบ logic ใน useEffect
3. **Profile not loading**: ตรวจสอบ Supabase permissions
4. **Admin verification fails**: ตรวจสอบ `NEXT_PUBLIC_ADMIN_EMAIL`

## 📋 Best Practices

### 1. ใช้ Hooks แทน Context โดยตรง
```tsx
// ✅ Good
const { user, isAdmin } = useAuth()

// ❌ Avoid
const context = useContext(AuthContext)
```

### 2. ใช้ Guard Hooks สำหรับ Protection
```tsx
// ✅ Good
function AdminPage() {
  const { hasAdminAccess } = useAdminGuard()
  if (!hasAdminAccess) return null
  return <AdminContent />
}

// ❌ Avoid manual checks everywhere
function AdminPage() {
  const { user, isAdmin } = useAuth()
  if (!user || !isAdmin) {
    router.push('/login')
    return null
  }
  return <AdminContent />
}
```

### 3. Handle Loading States
```tsx
// ✅ Good
const { user, loading } = useAuth()

if (loading) return <LoadingSpinner />
if (!user) return <LoginPrompt />
return <UserContent />
```

### 4. Error Boundaries
```tsx
// ใช้ Error Boundary สำหรับจัดการ errors
<ErrorBoundary>
  <AuthProvider>
    <App />
  </AuthProvider>
</ErrorBoundary>
```

## 🎯 Migration Guide

หากมี components เก่าที่ใช้ Supabase โดยตรง:

### Before (Old Way)
```tsx
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
    setLoading(false)
  }
  getUser()
}, [])
```

### After (With Context)
```tsx
const { user, loading } = useAuth()
```

ง่ายขึ้นมาก! 🎉

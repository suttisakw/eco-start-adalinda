# การตั้งค่าโปรเจกต์ Energy Efficient Frontend

## 🚀 การติดตั้งและตั้งค่า

### 1. ติดตั้ง Dependencies

```bash
yarn install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root และเพิ่มค่าต่อไปนี้:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Shopee Backend API (Optional)
NEXT_PUBLIC_SHOPEE_BACKEND_URL=https://api.adalindawongsa.com
NEXT_PUBLIC_SHOPEE_API_KEY=your_shopee_api_key
NEXT_PUBLIC_SHOPEE_AFFILIATE_ID=your_affiliate_id
```

### 3. ตั้งค่า Supabase

1. สร้างโปรเจกต์ใหม่ใน [Supabase](https://supabase.com)
2. ไปที่ Settings > API และคัดลอก:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. สร้าง Admin User

1. ไปที่ Supabase Dashboard > Authentication > Users
2. สร้างผู้ใช้ใหม่ด้วยอีเมลที่ตั้งไว้ใน `NEXT_PUBLIC_ADMIN_EMAIL`
3. ยืนยันอีเมล (หรือ mark as confirmed ใน dashboard)

### 5. รันโปรเจกต์

```bash
yarn dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

## 🔐 การเข้าสู่ระบบ Admin

1. ไปที่ `/login`
2. ใส่อีเมลและรหัสผ่านที่สร้างใน Supabase
3. ระบบจะตรวจสอบว่าอีเมลตรงกับ `NEXT_PUBLIC_ADMIN_EMAIL` หรือไม่
4. หากถูกต้อง จะ redirect ไปหน้า `/admin`

## 📁 โครงสร้างโปรเจกต์

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # หน้า Admin (Protected)
│   ├── login/             # หน้า Login
│   ├── search/            # หน้าค้นหา
│   └── page.tsx           # หน้าแรก
├── components/            # React Components
│   ├── ui/               # UI Components
│   ├── CategorySlider.tsx # Category Slider
│   ├── ProductCard.tsx   # Product Card
│   └── SearchBar.tsx     # Search Bar
├── lib/                  # Utilities
│   ├── supabase.ts      # Supabase Client
│   └── utils.ts         # Helper Functions
└── types/               # TypeScript Types
```

## 🛡️ ระบบความปลอดภัย

- **Middleware**: ป้องกันการเข้าถึงหน้า admin โดยไม่ได้รับอนุญาต
- **ProtectedRoute**: Component สำหรับป้องกันหน้าที่ต้องการ authentication
- **Admin Email Verification**: ตรวจสอบว่าผู้ใช้เป็น admin จริงหรือไม่

## 🎨 Features ที่พร้อมใช้งาน

### ✅ หน้าแรก (Homepage)
- Hero Section พร้อม animations
- Category Slider สำหรับเลือกหมวดหมู่
- Featured Products
- Search Bar ที่สวยงาม

### ✅ ระบบค้นหา
- Search Bar พร้อม Category Slider
- Filters สำหรับกรองสินค้า
- Responsive design

### ✅ ระบบ Admin
- Login Page ที่สวยงาม
- Admin Dashboard
- Protected Routes
- Logout functionality

### ✅ UI Components
- Modern design system
- Responsive components
- Animations และ transitions
- Dark mode support (partial)

## 🔧 การพัฒนาต่อ

### สิ่งที่ควรทำต่อ:
1. เชื่อมต่อกับ Supabase Database จริง
2. สร้าง API endpoints สำหรับจัดการสินค้า
3. เพิ่มระบบ upload รูปภาพ
4. เชื่อมต่อกับ Shopee API
5. เพิ่ม Analytics และ reporting

### การเพิ่ม Features:
1. Product management (CRUD)
2. Image upload
3. Bulk import จาก CSV
4. Email notifications
5. SEO optimization tools

## 🐛 การแก้ไขปัญหา

### ปัญหาที่อาจพบ:
1. **Login ไม่ได้**: ตรวจสอบ environment variables และ admin email
2. **Redirect loop**: ลบ cookies และ localStorage
3. **Supabase errors**: ตรวจสอบ API keys และ project URL

### การ Debug:
1. เปิด Developer Tools > Console
2. ตรวจสอบ Network tab สำหรับ API calls
3. ดู error messages ใน terminal

## 📞 การติดต่อ

หากมีปัญหาหรือข้อสงสัย สามารถสอบถามได้ตลอดเวลา!

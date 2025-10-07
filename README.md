# เลือกให้คุ้ม.com - Frontend

เว็บไซต์แนะนำเครื่องใช้ไฟฟ้าประหยัดไฟ เปรียบเทียบราคาและข้อมูลประหยัดพลังงานจาก EGAT

## 🚀 Features

### Core Features
- ✅ **EGAT Data Integration** - ดึงข้อมูลประหยัดไฟจาก EGAT
- ✅ **Shopee Product Feed** - เชื่อมต่อกับ Shopee Backend API
- ✅ **Admin Product Creation** - Interface สำหรับสร้างสินค้า
- ✅ **Product Matching Algorithm** - จับคู่สินค้าอัตโนมัติ
- ✅ **Confidence Scoring** - ระบบให้คะแนนความเหมาะสม
- ✅ **Short Link Generator** - สร้างลิงก์ตามมาตรฐาน Shopee
- ✅ **Affiliate Tracking** - ติดตามการคลิกและ conversion

### Admin Features
- ✅ **Supabase Authentication** - ระบบเข้าสู่ระบบที่ปลอดภัย
- ✅ **Protected Routes** - ป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต
- ✅ **Admin Dashboard** - หน้าจัดการหลัก
- ✅ **EGAT Product Browser** - เลือกสินค้าจาก EGAT
- ✅ **Shopee Product Search** - ค้นหาสินค้าใน Shopee
- ✅ **Product Matching Interface** - จับคู่สินค้า
- ✅ **Product Preview** - ดูตัวอย่างก่อนสร้าง
- ✅ **Analytics Dashboard** - วิเคราะห์ข้อมูล

### User Features
- ✅ **Energy Efficiency Display** - แสดงข้อมูลประหยัดไฟ
- ✅ **Confidence Score Display** - แสดงคะแนนความน่าเชื่อถือ
- ✅ **Enhanced Search** - ค้นหาตามเกณฑ์ประหยัดไฟ
- ✅ **Product Comparison** - เปรียบเทียบสินค้า
- ✅ **Short Link Integration** - ใช้ลิงก์ Affiliate ที่ถูกต้อง

### SEO Features
- ✅ **Dynamic SEO Generation** - สร้าง Meta Tags อัตโนมัติ
- ✅ **Product Schema Markup** - Structured Data สำหรับสินค้า
- ✅ **XML Sitemap** - Auto-generated sitemap
- ✅ **Open Graph Tags** - Social media sharing
- ✅ **Core Web Vitals** - Optimized performance
- ✅ **Mobile Optimization** - Responsive design

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.1.14
- **Database:** Supabase
- **Authentication:** Supabase Auth
- **Icons:** Lucide React
- **UI Components:** Custom components with Radix UI primitives

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin pages
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── products/      # Product management
│   │   │   └── layout.tsx     # Admin layout
│   │   ├── login/             # Login page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── robots.ts          # Robots.txt
│   │   └── sitemap.ts         # XML sitemap
│   ├── components/            # React components
│   │   ├── ui/               # UI components
│   │   ├── ProductCard.tsx   # Product card component
│   │   ├── SearchBar.tsx     # Search component
│   │   ├── EnergyBadge.tsx   # Energy rating badge
│   │   ├── ProtectedRoute.tsx # Auth protection
│   │   └── SEOOptimizer.tsx  # SEO component
│   ├── lib/                  # Utility libraries
│   │   ├── supabase.ts       # Supabase client
│   │   ├── utils.ts          # Utility functions
│   │   ├── shopeeBackendClient.ts # Shopee API client
│   │   ├── shopeeShortLink.ts # Short link generator
│   │   └── seo-generator.ts  # SEO generation
│   └── types/                # TypeScript types
│       └── index.ts          # Type definitions
├── public/                   # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- Yarn package manager
- Supabase account
- Shopee Backend API (running on https://api.adalindawongsa.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Admin Configuration
   NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
   
   # Site Configuration
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   
   # Shopee Backend API
   NEXT_PUBLIC_SHOPEE_BACKEND_URL=https://api.adalindawongsa.com
   NEXT_PUBLIC_SHOPEE_API_KEY=your_shopee_api_key
   
   # Affiliate Configuration
   NEXT_PUBLIC_SHOPEE_AFFILIATE_ID=your_affiliate_id
   ```

4. **Start development server**
   ```bash
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Enable Authentication
3. Create the required database tables (see database schema)
4. Set up Row Level Security (RLS) policies
5. Add your Supabase URL and anon key to environment variables

### Shopee Backend API

The frontend connects to a backend API that provides:
- EGAT product data
- Shopee product search
- Product matching algorithms
- Short link generation

Make sure the backend is running on `https://api.adalindawongsa.com` or update the `NEXT_PUBLIC_SHOPEE_BACKEND_URL` environment variable.

### Admin Access

Only the email specified in `NEXT_PUBLIC_ADMIN_EMAIL` can access the admin interface. Make sure to:
1. Create an admin user in Supabase Auth
2. Set the correct admin email in environment variables
3. The system will automatically verify admin access

## 📱 Pages & Routes

### Public Pages
- `/` - Homepage with featured products
- `/search` - Product search with filters
- `/product/[slug]` - Product detail page
- `/category/[slug]` - Category page
- `/compare` - Product comparison tool

### Admin Pages (Protected)
- `/admin` - Dashboard
- `/admin/products/create` - Create new product
- `/admin/products` - Manage products
- `/admin/analytics` - Analytics dashboard
- `/login` - Admin login

## 🎨 Components

### Core Components

- **ProductCard** - Display product information with EGAT data
- **SearchBar** - Advanced search with filters
- **EnergyBadge** - Energy rating display
- **ProtectedRoute** - Authentication wrapper
- **SEOOptimizer** - SEO meta tags and structured data

### UI Components

Built with Tailwind CSS and custom styling:
- Button variants
- Card layouts
- Form inputs
- Badges and alerts
- Loading states

## 🔍 SEO Features

### Automatic SEO Generation
- Dynamic meta titles and descriptions
- Open Graph tags for social sharing
- Twitter Card support
- Product schema markup
- XML sitemap generation
- Robots.txt configuration

### Performance Optimization
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Responsive design
- Core Web Vitals optimization

## 📊 Analytics

The admin dashboard provides:
- Product performance metrics
- Click tracking and conversion rates
- Category performance analysis
- Energy rating statistics
- Revenue tracking

## 🔐 Security

### Authentication
- Supabase Auth integration
- Admin-only access control
- Session management
- Automatic logout

### Data Protection
- Environment variable configuration
- Row Level Security (RLS)
- Input validation
- XSS protection

## 🚀 Deployment

### Build for Production
```bash
yarn build
yarn start
```

### Environment Variables for Production
Make sure to set all required environment variables in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
NEXT_PUBLIC_SHOPEE_BACKEND_URL=https://api.adalindawongsa.com
NEXT_PUBLIC_SHOPEE_API_KEY=your_production_api_key
NEXT_PUBLIC_SHOPEE_AFFILIATE_ID=your_affiliate_id
```

### Deployment Platforms
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **DigitalOcean App Platform**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🔄 Updates

### Version 0.1.0
- Initial release
- Core functionality implemented
- Admin interface complete
- SEO optimization
- Mobile responsive design

---

**ระบบพร้อมสำหรับการใช้งาน! 🚀**

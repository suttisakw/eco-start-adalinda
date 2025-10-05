# การตั้งค่า Facebook Link Preview

## สิ่งที่ได้ทำแล้ว

### 1. ปรับปรุง SEOGenerator
- สร้าง title และ description ที่เหมาะสำหรับ Facebook preview
- เพิ่มข้อมูลราคา, คะแนน, และข้อมูลประหยัดไฟใน description
- ปรับปรุง keywords ให้ครอบคลุมมากขึ้น

### 2. อัพเดท SEOOptimizer Component
- เพิ่ม Open Graph meta tags สำหรับ Facebook
- เพิ่ม product-specific meta tags (price, rating, brand, category)
- เพิ่ม Twitter Cards meta tags
- เพิ่ม meta tags สำหรับ WhatsApp sharing

### 3. เปลี่ยนหน้า Product Detail เป็น Server Component
- ใช้ `generateMetadata` function เพื่อสร้าง metadata แบบ dynamic
- แยก client-side logic ไปไว้ใน `ProductDetailClient.tsx`
- เพิ่ม Open Graph และ Twitter metadata ใน metadata object

## Meta Tags ที่เพิ่มสำหรับ Facebook

```html
<!-- Basic Open Graph -->
<meta property="og:title" content="[Product Name] | [Brand] เบอร์ [Rating] ประหยัดไฟ" />
<meta property="og:description" content="[Description with price, rating, savings]" />
<meta property="og:type" content="website" />
<meta property="og:url" content="[Product URL]" />
<meta property="og:image" content="[Product Image]" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="[Product Name]" />
<meta property="og:site_name" content="ประหยัดไฟเบอร์ 5" />
<meta property="og:locale" content="th_TH" />

<!-- Product-specific Open Graph -->
<meta property="og:price:amount" content="[Price]" />
<meta property="og:price:currency" content="THB" />
<meta property="og:price:original_amount" content="[Original Price]" />
<meta property="og:rating" content="[Rating]" />
<meta property="og:rating_scale" content="5" />

<!-- Product Meta Tags -->
<meta property="product:brand" content="[Brand]" />
<meta property="product:availability" content="in stock" />
<meta property="product:condition" content="new" />
<meta property="product:price:amount" content="[Price]" />
<meta property="product:price:currency" content="THB" />
<meta property="product:category" content="[Category]" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="[Title]" />
<meta name="twitter:description" content="[Description]" />
<meta name="twitter:image" content="[Image]" />
<meta name="twitter:image:alt" content="[Product Name]" />
<meta name="twitter:site" content="@energyefficient" />
<meta name="twitter:creator" content="@energyefficient" />

<!-- Additional Meta Tags -->
<meta name="format-detection" content="telephone=no" />
<meta property="fb:app_id" content="[Facebook App ID]" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:secure_url" content="[Image URL]" />
```

## วิธีการทดสอบ

### 1. ใช้ Facebook Sharing Debugger
1. ไปที่ https://developers.facebook.com/tools/debug/
2. ใส่ URL ของหน้า product detail
3. กด "Debug" เพื่อดู preview
4. กด "Scrape Again" หากต้องการ refresh cache

### 2. ใช้ Twitter Card Validator
1. ไปที่ https://cards-dev.twitter.com/validator
2. ใส่ URL ของหน้า product detail
3. ตรวจสอบ Twitter Card preview

### 3. ใช้ Open Graph Preview Tools
- https://www.opengraph.xyz/
- https://socialsharepreview.com/

## Environment Variables ที่ต้องตั้งค่า

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your-facebook-pixel-id
```

## การ Redirect ไปยัง Affiliate Link

### วิธีการทำงาน
1. เมื่อมีการแชร์ลิงก์ใน Facebook, Facebook จะใช้ `og:url` เป็นลิงก์ที่แสดงใน preview
2. เราได้ตั้งค่า `og:url` ให้ชี้ไปยัง `/product/[slug]/redirect?source=facebook`
3. เมื่อผู้ใช้คลิกจาก Facebook, จะถูก redirect ไปยังหน้า redirect
4. หน้า redirect จะตรวจสอบว่า source เป็น Facebook หรือไม่
5. ถ้าใช่ จะ track การคลิกและ redirect ไปยัง affiliate link

### ไฟล์ที่เกี่ยวข้อง
- `src/app/product/[slug]/redirect/page.tsx` - หน้า redirect
- `src/lib/analytics.ts` - ระบบ tracking
- `src/app/layout.tsx` - Facebook Pixel integration

### การติดตาม Analytics
- Facebook Pixel events
- Custom analytics tracking
- Click source detection (Facebook, Twitter, etc.)

## ตัวอย่าง Facebook Preview ที่คาดหวัง

```
[Product Image]
[Product Name] | [Brand] เบอร์ [Rating] ประหยัดไฟ
[Description with price, rating, savings info]
[Domain: your-domain.com]
```

## การแก้ไขปัญหา

### หาก Facebook ไม่แสดง preview
1. ตรวจสอบว่า meta tags ถูกสร้างถูกต้อง
2. ใช้ Facebook Sharing Debugger เพื่อดู error
3. ตรวจสอบว่า image URL เป็น absolute URL
4. ตรวจสอบว่า image มีขนาดอย่างน้อย 1200x630 pixels

### หาก image ไม่แสดง
1. ตรวจสอบว่า image URL เป็น HTTPS
2. ตรวจสอบว่า image สามารถเข้าถึงได้จากภายนอก
3. ใช้ absolute URL แทน relative URL

### หากข้อมูลไม่ครบถ้วน
1. ตรวจสอบว่า product data มีข้อมูลครบถ้วน
2. ตรวจสอบว่า SEOGenerator สร้าง description ได้ถูกต้อง
3. ตรวจสอบว่า meta tags ถูกส่งไปยัง Facebook

## การอัพเดทต่อไป

1. เพิ่ม Facebook App ID ใน environment variables
2. ทดสอบกับ Facebook Sharing Debugger
3. ปรับปรุง description ให้เหมาะสมกับ Facebook
4. เพิ่ม structured data (JSON-LD) สำหรับ search engines
5. ทดสอบการแชร์ในแพลตฟอร์มอื่นๆ (Line, WhatsApp, etc.)

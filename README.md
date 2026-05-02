# Pastport — Platform Portfolio มีเสียงสำหรับนักเรียน TCAS

ระบบ portfolio ที่มีเสียงพูดของเจ้าของ port สำหรับนักเรียนที่กำลังเข้ามหาวิทยาลัยในประเทศไทย

## ขั้นตอนการติดตั้ง

### 1. ติดตั้ง dependencies
```bash
npm install
```

### 2. ตั้งค่า Supabase
1. ไปที่ [supabase.com](https://supabase.com) และสร้างโปรเจกต์ใหม่
2. ไปที่ **SQL Editor** แล้วรัน `supabase/schema.sql` ทั้งหมด
3. ไปที่ **Settings > API** คัดลอก `URL` และ `anon key`
4. ไปที่ **Settings > API > Service role** คัดลอก `service_role key`

### 3. ตั้งค่า Environment Variables
คัดลอก `.env.local.example` เป็น `.env.local` และใส่ค่า:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. รัน Development Server
```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## โครงสร้างระบบ

| Portal | URL | บทบาท |
|--------|-----|--------|
| **นักเรียน** | `/home` | ค้นหาและดู portfolio |
| **Admin** | `/admin` | จัดการระบบทั้งหมด |
| **Affiliate** | `/affiliate` | ส่งและจัดการ portfolio |

### URL สำคัญ

**Auth:**
- `/login` — เข้าสู่ระบบ (ทุก role)
- `/register/student` — สมัครนักเรียน
- `/register/affiliate` — สมัคร Affiliate
- `/register/admin` — สมัคร Admin (ต้องใช้ Secret Key)

**นักเรียน:**
- `/home` — หน้าค้นหา portfolio พร้อม AI recommendations
- `/portfolio/[id]` — ดู PDF พร้อมเสียงและ pin annotations

**Admin:**
- `/admin` — Dashboard + KPI charts
- `/admin/review` — พิจารณา portfolio ตามมาตรฐาน Q1
- `/admin/ads` — จัดการ Banner Ads (สูงสุด 40)
- `/admin/users` — จัดการผู้ใช้
- `/admin/notifications` — ส่งแจ้งเตือน
- `/admin/settings` — ตั้งค่า KPI rates

**Affiliate:**
- `/affiliate` — Dashboard + KPI earnings
- `/affiliate/submit` — ส่ง portfolio (3 steps)
- `/affiliate/portfolios/[id]/edit` — เพิ่มเสียง + pin

---

## ฟีเจอร์หลัก

### 📄 PDF Viewer พร้อมเสียง
- เล่นเสียงอัตโนมัติเมื่อเลื่อนไปถึงแต่ละหน้า
- IntersectionObserver ตรวจจับหน้าที่กำลังดู
- แสดง progress bar เสียง

### 📍 Pin Annotations
- กด pin บนหน้า PDF → popup เสียงอธิบาย / note text / ลิงก์
- pin_type: `audio` | `note` | `both`
- ตำแหน่ง x/y เป็น percentage (responsive)

### 🤖 AI Recommendations
- Collaborative filtering จาก viewing history
- สำหรับ guest: แสดง popular portfolios
- สำหรับ logged-in: recommend ตาม faculty/tag preference

### 📊 KPI & Payments
- Admin ตั้งค่า rate: บาท/view, บาท/ดูครบ, บาท/like
- คำนวณค่าจ่ายรายเดือนให้ Affiliate อัตโนมัติ
- Affiliate เห็นรายได้คาดการณ์ใน dashboard

### 🔍 Q1 Review Standard
- 4 criteria: relevance, originality, quality, presentation (25 คะแนน/ข้อ)
- ≥70 คะแนน = ผ่านมาตรฐาน Q1
- ≥50 คะแนน = อนุมัติได้
- <50 คะแนน = ไม่ผ่าน

---

## Database Schema

ไฟล์: `supabase/schema.sql`

Tables: `profiles`, `portfolios`, `portfolio_pages`, `portfolio_pins`, `banner_ads`, `portfolio_views`, `notifications`, `review_checklists`, `kpi_settings`, `affiliate_payments`

Storage bucket: `portfolio-files` (PDF, audio, cover images)

---

## Tech Stack

- **Next.js 16** (App Router + Turbopack)
- **Supabase** (Auth + Database + Storage)
- **Tailwind CSS v4** + Radix UI
- **react-pdf** + pdfjs-dist
- **Recharts** (charts)
- **react-hook-form** + Zod (forms)

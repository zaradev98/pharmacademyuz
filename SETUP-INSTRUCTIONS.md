# QR Sertifikat Tizimini O'rnatish

## 1. Supabase Database Setup

### Birinchi qadam: Asosiy ma'lumotlar bazasini yaratish

Supabase Dashboard'ga kiring va SQL Editor'ni oching. Keyin `database-setup.sql` faylini ishga tushiring.

### Ikkinchi qadam: Database'ni yangilash

`update-database.sql` faylini SQL Editor'da ishga tushiring. Bu quyidagilarni amalga oshiradi:

- ✅ `process` jadvalidagi `user_id` ni nullable qiladi
- ✅ Barcha foydalanuvchilar barchani ko'rishi mumkin qilib policies'ni o'zgartiradi
- ✅ Storage policies'ni yangilaydi
- ✅ Qidiruv uchun indexlar qo'shadi

## 2. Environment Variables

`.env` faylini yarating va quyidagilarni kiriting:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 3. Supabase Storage Setup

### Bucket yaratish

1. Supabase Dashboard > Storage ga o'ting
2. "Create a new bucket" tugmasini bosing
3. Bucket nomi: `qrcodes`
4. **Public** sifatida belgilang
5. "Create bucket" tugmasini bosing

Yoki SQL orqali:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('qrcodes', 'qrcodes', true)
ON CONFLICT (id) DO NOTHING;
```

## 4. Rasm Fayli

Sertifikat foni uchun `rasm.jpg` faylini `public` papkasiga joylashtiring.

```
qr-app/
├── public/
│   └── rasm.jpg    <-- Sertifikat foni
├── src/
└── ...
```

## 5. Loyihani ishga tushirish

```bash
# Dependencies o'rnatish
npm install

# Development server
npm run dev

# Production build
npm run build
```

## 6. Kirish ma'lumotlari

### Default Superadmin

- **Username:** `pharmacademyuz01`
- **Password:** `900411134`

## Tizim haqida

**Muhim:** Bu tizim **faqat xodimlar uchun**. Sertifikat oluvchilar saytga kirmaydi, ularga PNG fayl beriladi.

### Kirish

Faqat 3 ta role kirishi mumkin:
- **Superadmin** - Barcha huquqlar
- **Admin** - User yaratish
- **User** - Faqat sertifikat yaratish

### Sertifikat yaratish jarayoni

1. Login qilish (majburiy)
2. Dashboard'ga kirish
3. Floating tugmani bosish (+)
4. Ma'lumotlarni to'ldirish:
   - F.I.SH (majburiy)
   - Sertifikat raqami (majburiy)
   - Boshqa maydonlar (ixtiyoriy)
5. "QR Kod Yaratish" tugmasini bosish
6. QR kod va sertifikat avtomatik yaratiladi

### Sertifikatni yuklab olish

1. Tarix jadvalidan kerakli yozuvni tanlang
2. Modal oynada 3 ta variant:
   - **Sertifikat yuklab olish** - To'liq sertifikatni PNG formatida
   - **QR kod yuklab olish** - Faqat QR kod rasmini
   - **O'chirish** - Sertifikatni o'chirish

### Qidiruv

Tarix jadvalida qidiruv qilish mumkin:
- F.I.SH bo'yicha
- Sertifikat raqami bo'yicha

## Muhim xususiyatlar

✅ **Login majburiy** - Faqat xodimlar kiradi
✅ **User_id ixtiyoriy** - Faqat kim yaratganini bilish uchun saqlanadi
✅ **Barcha sertifikatlar umumiy** - Barcha xodimlar ko'rishi va yuklab olishi mumkin
✅ **PNG formatda yuklab olish** - html2canvas orqali
✅ **QR kod ichida to'liq ma'lumot** - Sertifikat tekshirish uchun
✅ **Sertifikat oluvchilar saytga kirmaydi** - Ularga faqat PNG fayl beriladi

## Texnologiyalar

- **Frontend:** React 19 + Vite
- **Backend:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **QR Code:** qrcode library
- **HTML to PNG:** html2canvas
- **Authentication:** bcryptjs (ixtiyoriy)

## Xavfsizlik

- ✅ Row Level Security (RLS) yoqilgan
- ✅ Public bucket - hamma ko'rishi mumkin
- ✅ Storage policies - hamma yuklashi va o'chirishi mumkin
- ✅ Parollar bcrypt bilan xeshlanadi

## Deployment

### Vercel

```bash
# Vercel CLI o'rnatish
npm i -g vercel

# Deploy qilish
vercel
```

Environment variables'ni Vercel Dashboard'da qo'shing:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Netlify

```bash
# Netlify CLI o'rnatish
npm i -g netlify-cli

# Deploy qilish
netlify deploy --prod
```

## Muammolarni bartaraf qilish

### User_id xatoligi

Agar "user_id violates not-null constraint" xatosi ko'rsatilsa:

```sql
ALTER TABLE process ALTER COLUMN user_id DROP NOT NULL;
```

### Storage xatosi

Agar storage'ga yuklab bo'lmasa, bucket public ekanligini tekshiring:

```sql
UPDATE storage.buckets
SET public = true
WHERE id = 'qrcodes';
```

### Policies xatosi

Agar ma'lumotlarni ko'rib bo'lmasa, policies'ni tekshiring:

```sql
-- Barcha policies'ni ko'rish
SELECT * FROM pg_policies WHERE tablename = 'process';
```

## Qo'shimcha

Agar savollar bo'lsa yoki yordam kerak bo'lsa, loyiha README.md faylini o'qing.

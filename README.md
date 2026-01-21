# QR Code Generator - React + Supabase

Bu loyiha React (Vite) va Supabase yordamida QR kod yaratish ilovasidir.

## Xususiyatlar

- ✅ Foydalanuvchi ro'yxatdan o'tish va kirish (bcrypt bilan hashlab)
- ✅ QR kod yaratish va PNG/JPG formatda saqlash
- ✅ QR kodlarni Supabase Storage ga yuklash
- ✅ QR kodlar tarixini ko'rish
- ✅ Profilda login va parolni tahrirlash
- ✅ Supabase database bilan integratsiya

## Texnologiyalar

- React 18
- Vite
- Supabase (Database + Storage)
- QRCode library
- bcryptjs (parollarni hashlash)
- React Router DOM

## O'rnatish

### 1. Repository ni clone qiling

```bash
cd qr-app
npm install
```

### 2. Supabase loyihasi yaratish

1. https://supabase.com ga o'ting
2. Yangi loyiha yarating
3. Loyiha URL va Anon Key ni oling

### 3. Environment variables sozlash

`.env` fayl yarating va quyidagilarni kiriting:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Supabase Database sozlash

1. Supabase Dashboard > SQL Editor ga o'ting
2. `supabase-setup.sql` faylidagi barcha SQL kodlarni nusxalang
3. SQL Editor da ishga tushiring

### 5. Supabase Storage sozlash

1. Supabase Dashboard > Storage ga o'ting
2. "Create a new bucket" tugmasini bosing
3. Bucket nomini `qrcodes` deb kiriting
4. "Public bucket" ni tanlang va yarating

### 6. Ilovani ishga tushirish

```bash
npm run dev
```

Brauzerda `http://localhost:5173` manzilida ochiladi.

## Database Struktura

### Users jadvali

```sql
- id (UUID, primary key)
- username (VARCHAR, unique)
- password_hash (TEXT)
- full_name (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Process jadvali

```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- qr_text (TEXT)
- qr_image_url (TEXT)
- file_path (TEXT)
- title (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Loyihaning Strukturasi

```
qr-app/
├── src/
│   ├── components/
│   │   ├── Login.jsx           # Kirish sahifasi
│   │   ├── Register.jsx        # Ro'yxatdan o'tish
│   │   ├── Dashboard.jsx       # QR kod yaratish
│   │   ├── Profile.jsx         # Profil tahrirlash
│   │   ├── ProtectedRoute.jsx  # Route himoyasi
│   │   ├── Auth.css            # Auth sahifalar CSS
│   │   ├── Dashboard.css       # Dashboard CSS
│   │   └── Profile.css         # Profile CSS
│   ├── AuthContext.jsx         # Auth context
│   ├── supabaseClient.js       # Supabase konfiguratsiya
│   ├── App.jsx                 # Asosiy App
│   ├── App.css                 # Global CSS
│   └── main.jsx                # Entry point
├── supabase-setup.sql          # Database setup
├── .env.example                # Environment variables namunasi
└── package.json
```

## Foydalanish

### 1. Ro'yxatdan o'tish
- `/register` sahifasiga o'ting
- To'liq ismingiz, foydalanuvchi nomi va parolni kiriting
- "Ro'yxatdan o'tish" tugmasini bosing

### 2. Kirish
- `/login` sahifasiga o'ting
- Foydalanuvchi nomi va parolni kiriting
- "Kirish" tugmasini bosing

### 3. QR Kod Yaratish
- Dashboard da QR kod uchun matn kiriting (URL, matn, va h.k.)
- Sarlavha va tavsif qo'shing (ixtiyoriy)
- "QR Kod Yaratish" tugmasini bosing
- QR kod PNG formatda Supabase Storage ga yuklanadi

### 4. Profil Tahrirlash
- Profil sahifasiga o'ting
- Ismingiz yoki username ni o'zgartiring
- Parolni o'zgartirish uchun joriy va yangi parolni kiriting
- "Saqlash" tugmasini bosing

## Xavfsizlik

- Parollar bcrypt yordamida hashlanadi (salt rounds: 10)
- Row Level Security (RLS) yoqilgan
- Har bir foydalanuvchi faqat o'z ma'lumotlarini ko'radi va tahrirlaydi

## Production uchun Tayyorlash

```bash
npm run build
```

Build fayllar `dist/` papkasida hosil bo'ladi.

## Muammolarni bartaraf etish

### Supabase ulanish xatosi
- `.env` faylidagi URL va Key ni tekshiring
- Supabase loyihangiz faol ekanligini tekshiring

### Storage xatosi
- `qrcodes` bucket yaratilganligini tekshiring
- Bucket public ekanligini tekshiring
- Storage policies to'g'ri sozlanganligini tekshiring

### Database xatosi
- SQL setup to'liq bajarilganligini tekshiring
- RLS policies to'g'ri sozlanganligini tekshiring

## Qo'shimcha Ma'lumot

- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- QRCode Library: https://www.npmjs.com/package/qrcode

## Litsenziya

MIT

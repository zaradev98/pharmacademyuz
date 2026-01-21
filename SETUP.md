# QR Code Generator - O'rnatish Ko'rsatmasi

## Loyiha haqida

Bu loyiha role-based access control (RBAC) tizimi bilan QR kod generatori ilovasidir.

### Asosiy imkoniyatlar:
- **Rollar**: superadmin, admin, user
- **Ranglar**: #006670 (asosiy), #E4E4E4 (fon)
- **Registratsiya yo'q**: Faqat mavjud foydalanuvchilar kirishi mumkin
- **User management**: Admin va superadminlar yangi foydalanuvchilar yaratishi mumkin
- **QR kod yaratish va saqlash**: Foydalanuvchilar QR kod yaratib, tarixini ko'rishi mumkin

### Ruxsatlar:
- **superadmin**: Hamma narsani qila oladi (user, admin, superadmin yaratish)
- **admin**: Faqat user yaratish
- **user**: Faqat QR kod yaratish va ko'rish

## O'rnatish

### 1. Dependencies o'rnatish
```bash
npm install
```

### 2. Supabase sozlash

#### 2.1 Supabase loyihasini yarating
1. [supabase.com](https://supabase.com) ga kiring
2. Yangi loyiha yarating
3. Project Settings > API dan URL va anon key ni oling

#### 2.2 .env faylini to'ldiring
`.env` fayli loyihada mavjud. Quyidagi qiymatlarni o'zgartiring:

```env
VITE_SUPABASE_URL=sizning_supabase_url
VITE_SUPABASE_ANON_KEY=sizning_anon_key
```

#### 2.3 Database setup
1. Supabase Dashboard > SQL Editor ga o'ting
2. `supabase-setup.sql` faylining barcha mazmunini ko'chirib oling
3. SQL Editorga joylashtiring va "RUN" tugmasini bosing

Bu quyidagilarni yaratadi:
- `roles` jadval (superadmin, admin, user)
- `users` jadval (role_id bilan)
- `process` jadval (QR kodlar tarixi)
- Mock superadmin user:
  - **Login**: pharmacademyuz01
  - **Parol**: 900411134

#### 2.4 Storage bucket yaratish
1. Supabase Dashboard > Storage ga o'ting
2. "Create bucket" tugmasini bosing
3. Bucket nomini `qrcodes` deb kiriting
4. Public bucket sifatida belgilang

## Ishga tushirish

### Development mode
```bash
npm run dev
```

Ilova http://localhost:5173 da ochiladi

### Production build
```bash
npm run build
npm run preview
```

## Birinchi kirish

1. Ilovaga kiring: http://localhost:5173
2. Login sahifasida quyidagi ma'lumotlarni kiriting:
   - **Login**: pharmacademyuz01
   - **Parol**: 900411134
3. Siz superadmin sifatida kirasiz

## Yangi foydalanuvchi yaratish

1. Superadmin yoki admin sifatida kiring
2. Dashboard-dagi "Foydalanuvchilar" tugmasini bosing
3. "+ Yangi foydalanuvchi" tugmasini bosing
4. To'liq ism va roleni kiriting
5. Login va parol avtomatik generatsiya qilinadi
6. Ko'rsatilgan login va parolni nusxalang va yangi foydalanuvchiga bering

## Texnologiyalar

- **Frontend**: React 19 + Vite
- **Backend/DB**: Supabase (PostgreSQL)
- **Auth**: bcryptjs (password hashing)
- **QR Code**: qrcode library
- **Styling**: Custom CSS

## Fayl tuzilishi

```
qr-app/
├── src/
│   ├── components/
│   │   ├── Login.jsx              # Login page
│   │   ├── Dashboard.jsx          # QR generator dashboard
│   │   ├── Profile.jsx            # User profile
│   │   ├── UserManagement.jsx     # Admin panel
│   │   ├── ProtectedRoute.jsx     # Route guard
│   │   └── *.css                  # Component styles
│   ├── utils/
│   │   └── credentialGenerator.js # Username/password generator
│   ├── AuthContext.jsx            # Authentication context
│   ├── supabaseClient.js          # Supabase config
│   └── App.jsx                    # Main app
├── supabase-setup.sql             # Database schema
├── .env                           # Environment variables
└── package.json
```

## Muammolarni hal qilish

### "Invalid supabaseUrl" xatosi
- `.env` faylidagi `VITE_SUPABASE_URL` to'g'ri formatda ekanligini tekshiring
- Dev serverni restart qiling: `Ctrl+C` va `npm run dev`

### "Role topilmadi" xatosi
- `supabase-setup.sql` faylini to'liq ishga tushirganingizni tekshiring
- SQL Editordan `SELECT * FROM roles` query bilan rollarni tekshiring

### Storage xatosi
- Supabase Dashboard > Storage da `qrcodes` bucket mavjudligini tekshiring
- Bucket public ekanligini tasdiqlang

## Xavfsizlik

- Parollar bcrypt bilan hashlanadi (10 rounds)
- Row Level Security (RLS) yoqilgan
- `.env` faylini `.gitignore` da qoldiring
- Production uchun yangi Supabase loyihasi yarating

## Qo'shimcha

Savollar yoki muammolar bo'lsa, loyiha maintainer bilan bog'laning.

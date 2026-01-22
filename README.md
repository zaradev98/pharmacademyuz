# QR Sertifikat Yaratish Tizimi

Farmatsevtika akademiyasi uchun QR kodli sertifikatlar yaratish tizimi.

## 📋 Tizim haqida

Bu tizim **faqat xodimlar uchun**. Sertifikat oluvchilar saytga kirmaydi, ularga PNG formatda tayyor sertifikat beriladi.

### Kim foydalanadi?

1. **Superadmin** - Barcha huquqlar, user yaratish
2. **Admin** - Faqat oddiy userlar yaratish
3. **User (Xodim)** - Faqat sertifikat yaratish

### Sertifikat oluvchilar

- ❌ Saytga kirmaydi
- ❌ Login/parol yo'q
- ✅ Tayyor PNG sertifikatni oladi
- ✅ QR kod orqali tekshirish mumkin

## 🚀 Tez boshlash

### 1. O'rnatish

```bash
npm install
```

### 2. Environment setup

`.env` faylini yarating:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database setup

Supabase SQL Editor'da:

1. `database-setup.sql` ni ishga tushiring
2. `update-database.sql` ni ishga tushiring

### 4. Storage setup

Supabase Dashboard > Storage:
- Bucket nomi: `qrcodes`
- Public: ✅ Ha

### 5. Rasm fayli

`public/rasm.jpg` - sertifikat foni (sizning shablon rasmingiz)

### 6. Ishga tushirish

```bash
npm run dev
```

## 🔐 Kirish ma'lumotlari

**Default Superadmin:**
- Username: `pharmacademyuz01`
- Password: `900411134`

## 📱 Qanday ishlaydi?

### Xodim tomonidan

1. Login qilish
2. Dashboard'da "+" tugmasini bosish
3. Ma'lumotlarni to'ldirish:
   - F.I.SH
   - Pasport ma'lumotlari
   - Sertifikat raqami
   - Qayd raqami
   - Diplom raqami
   - Yo'nalish nomi
   - Amal qilish muddati
   - Tekshirish telefoni
4. "QR Kod Yaratish" tugmasini bosish
5. Sertifikatni yuklab olish (PNG)
6. PNG faylni sertifikat oluvchiga berish

### Sertifikat oluvchi tomonidan

1. PNG faylni oladi
2. Chop etadi yoki saqlaydi
3. QR kodni skan qilganda barcha ma'lumotlarni ko'radi

## 🎯 Funksiyalar

### Dashboard

- ✅ Sertifikat yaratish
- ✅ Tarix ko'rish (barcha sertifikatlar)
- ✅ Qidiruv (F.I.SH, sertifikat raqami)
- ✅ Sertifikat yuklab olish (PNG)
- ✅ QR kod yuklab olish (PNG)
- ✅ O'chirish

### Sertifikat

- ✅ To'liq ma'lumotlar
- ✅ QR kod ichida
- ✅ Professional dizayn
- ✅ Yuqori sifat (3543x2380px)
- ✅ Times New Roman font
- ✅ PNG format

### User Management (Superadmin/Admin)

- ✅ Yangi user yaratish
- ✅ User ma'lumotlarini ko'rish
- ✅ Active/Inactive qilish
- ✅ Role-based access

## 🏗️ Texnologiyalar

- **Frontend:** React 19 + Vite
- **Backend:** Supabase (PostgreSQL + Storage)
- **Auth:** Custom auth with bcrypt
- **QR Code:** qrcode library
- **HTML to PNG:** html2canvas
- **Routing:** React Router v7

## 📁 Loyiha strukturasi

```
qr-app/
├── public/
│   └── rasm.jpg              # Sertifikat foni
├── src/
│   ├── components/
│   │   ├── Certificate.jsx   # Sertifikat komponenti
│   │   ├── Dashboard.jsx     # Asosiy sahifa
│   │   ├── Login.jsx         # Login sahifasi
│   │   ├── Profile.jsx       # Profil
│   │   ├── UserManagement.jsx # User boshqaruv
│   │   └── ProtectedRoute.jsx # Route himoyasi
│   ├── AuthContext.jsx       # Auth holati
│   ├── supabaseClient.js     # Supabase client
│   └── App.jsx               # Asosiy App
├── database-setup.sql        # Database yaratish
├── update-database.sql       # Database yangilash
└── SETUP-INSTRUCTIONS.md     # To'liq yo'riqnoma
```

## 🔒 Xavfsizlik

- ✅ Barcha sahifalar login majburiy
- ✅ Row Level Security (RLS)
- ✅ Parollar bcrypt bilan hash
- ✅ Role-based access control
- ✅ Protected routes

## 🐛 Muammolarni bartaraf qilish

### User_id xatoligi

```sql
ALTER TABLE process ALTER COLUMN user_id DROP NOT NULL;
```

### Storage xatosi

```sql
UPDATE storage.buckets SET public = true WHERE id = 'qrcodes';
```

### Login ishlamayapti

localStorage'ni tozalash:
```javascript
localStorage.clear()
```

## 📦 Deployment

### Vercel

```bash
vercel
```

Environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Netlify

```bash
netlify deploy --prod
```

## 📝 To-do

- [ ] Sertifikat shablonlarini qo'shish
- [ ] Email orqali yuborish
- [ ] Bulk sertifikat yaratish
- [ ] Statistika dashboard
- [ ] Export Excel/PDF

## 👥 Role Permissions

| Funksiya | Superadmin | Admin | User |
|----------|-----------|-------|------|
| Sertifikat yaratish | ✅ | ✅ | ✅ |
| Sertifikat ko'rish | ✅ | ✅ | ✅ |
| Sertifikat o'chirish | ✅ | ✅ | ✅ |
| User yaratish | ✅ | ✅ (faqat user) | ❌ |
| User boshqarish | ✅ | ✅ | ❌ |
| Profil tahrirlash | ✅ | ✅ | ✅ |

## 📞 Support

Muammo bo'lsa yoki savol bo'lsa:
1. Issues yaratish
2. README.md ni o'qish
3. SETUP-INSTRUCTIONS.md ni ko'rish

## 📄 License

MIT

---

**Eslatma:** Bu tizim faqat ichki foydalanish uchun. Sertifikat oluvchilar saytga kirmaydi.

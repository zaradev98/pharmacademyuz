# Sertifikat QR Kod Generatori

Bu loyiha sertifikatlar uchun QR kod yaratish tizimi. Barcha kerakli ma'lumotlar formatlangan holda QR kodga yoziladi va bazaga saqlanadi.

## QR Kod Formatiga misol

```
1. F.I.SH: MAMANAZAROV SAYDULLA TURAYEVICH
2. PASPORT MA'LUMOTLARI: AD5690631
3. SERTIFIKAT RAQAMI: GPP/3-000050
4. QAYD RAQAMI: 00050
5. DIPLOM RAQAMI: K № 0993176
6. YO'NALISH NOMI: ZARUR DORIXONA AMALIYOTI (GPP) STANDARTINI JORIY QILISHDA DORIXONALAR FAOLIYATINI TASHKIL QILISH ASOSLARI
7. MUDDATI: 15.12.2025 - 20.12.2025
8. SERTIFIKAT HAQIQIYLIGINI TEKSHIRISH UCHUN QUYIDAGI RAQAMGA MUROJAAT QILISHINGIZ MUMKIN: +998883033416
```

## Formadagi maydonlar

### Majburiy maydonlar (*)
1. **F.I.SH** - To'liq ism (avtomatik KATTA harflarga o'tkaziladi)
2. **Sertifikat raqami** - Sertifikatning noyob raqami

### Ixtiyoriy maydonlar
3. **Pasport ma'lumotlari** - Pasport seriyasi va raqami
4. **Qayd raqami** - Ro'yxatga olish raqami
5. **Diplom raqami** - Diplom seriyasi va raqami
6. **Yo'nalish nomi** - Ta'lim yo'nalishi yoki sertifikat turi (avtomatik KATTA harflarga o'tkaziladi)
7. **Amal qilish muddati** - Sertifikat boshlanish va tugash sanasi (DD.MM.YYYY formatida ko'rsatiladi)
8. **Tekshirish telefon raqami** - Sertifikatni tekshirish uchun kontakt

## Xususiyatlar

- ✅ Barcha asosiy maydonlar tartib raqami bilan
- ✅ F.I.SH va Yo'nalish nomi avtomatik KATTA harflarga o'tadi
- ✅ Sanalar avtomatik DD.MM.YYYY formatiga o'tkaziladi
- ✅ Faqat to'ldirilgan maydonlar QR kodga yoziladi
- ✅ QR kod 400x400 px o'lchamda
- ✅ Barcha ma'lumotlar bazaga saqlanadi
- ✅ QR kod Supabase Storage'da saqlanadi
- ✅ Tarixni ko'rish imkoniyati

## Database strukturasi

QR kod ma'lumotlari `process` jadvalida saqlanadi:
- `id` - Noyob identifikator
- `user_id` - QR kod yaratgan foydalanuvchi
- `qr_text` - QR kod ichidagi to'liq matn
- `qr_image_url` - QR kod rasm URL
- `title` - Sertifikat egasi (F.I.SH)
- `description` - Qisqacha tavsif (Sertifikat raqami)
- `file_path` - Faylning storage'dagi yo'li
- `created_at` - Yaratilgan vaqt

## Foydalanish

1. Login qiling (superadmin/admin/user)
2. Dashboard'da sertifikat ma'lumotlarini kiriting
3. "QR Kod Yaratish" tugmasini bosing
4. Yaratilgan QR kodlar jadval shaklida ko'rinadi
5. "Yuklab olish" tugmasi orqali QR kodni kompyuterga yoki telefonga yuklab oling
6. QR kodni skanerlash orqali barcha ma'lumotlarni ko'rish mumkin

## QR Kod Tarixini Ko'rish

- Barcha QR kodlar jadval shaklida ko'rsatiladi
- Har bir QR kod uchun quyidagi ma'lumotlar ko'rinadi:
  - QR kod rasmi (preview)
  - F.I.SH
  - Sertifikat raqami
  - Yaratilgan vaqt
  - Yuklab olish tugmasi
- Jadvalni scroll qilish orqali ko'proq QR kodlarni ko'rish mumkin
- Mobile qurilmalarda responsive dizayn qo'llab-quvvatlanadi

## Qo'shimcha imkoniyatlar

### Admin/Superadmin uchun
- Yangi foydalanuvchilar yaratish
- Barcha foydalanuvchilarni ko'rish
- User aktivligini boshqarish

### User uchun
- Faqat QR kod yaratish va tarixni ko'rish

## Texnik detalllar

- **QR kod hajmi**: 400x400 px (yuqori sifat)
- **QR kod rangi**: Qora/Oq (standart)
- **Fayl formati**: PNG
- **Encoding**: UTF-8 (kirill alifbosi qo'llab-quvvatlanadi)
- **Storage**: Supabase Storage (public bucket)

## Muhim eslatma

Sertifikat ma'lumotlari maxfiy bo'lishi mumkin, shuning uchun:
- Faqat autentifikatsiyalangan foydalanuvchilar kirishi mumkin
- Har bir foydalanuvchi faqat o'z QR kodlarini ko'radi
- Row Level Security (RLS) yoqilgan
- Parollar bcrypt bilan hashlanadi

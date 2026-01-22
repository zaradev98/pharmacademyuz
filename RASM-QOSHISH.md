# Sertifikat Background Rasmini Qo'shish

## Muammo

Sertifikat yaratilganda background rasm ko'rinmayapti.

## Yechim

### 1. Rasm faylini tayyorlash

Sertifikat background rasmi quyidagi xususiyatlarga ega bo'lishi kerak:

- **Fayl nomi:** `rasm.jpg`
- **O'lcham:** 3543 x 2380 pixels (yoki shu nisbatda)
- **Format:** JPG yoki PNG
- **Sifat:** Yuqori sifatli (chop etish uchun)

### 2. Rasm faylini joylashtirish

Rasmi `public` papkasiga qo'ying:

```
qr-app/
├── public/
│   └── rasm.jpg    <-- SHU YERGA QO'YING
├── src/
└── ...
```

### 3. Rasm path'ini tekshirish

Certificate.jsx da rasm path'i to'g'ri:

```jsx
<img className="rasm" src="/rasm.jpg" alt="Certificate Background" />
```

`/rasm.jpg` degani `public/rasm.jpg` demak.

### 4. Browser'ni yangilash

Rasm qo'yilgandan keyin:

1. Development server'ni qayta ishga tushiring:
   ```bash
   npm run dev
   ```

2. Browser'ni to'liq yangilang (Ctrl+Shift+R yoki Cmd+Shift+R)

## Agar rasm bo'lmasa

Agar hozir rasm yo'q bo'lsa, placeholder rasm yarating:

### Variant 1: Online tool

1. https://placeholder.com ga o'ting
2. `3543x2380` o'lchamli rasm yarating
3. Yuklab olib `rasm.jpg` deb nomlang
4. `public` papkasiga qo'ying

### Variant 2: Figma/Photoshop

1. Yangi file yarating: 3543 x 2380 px
2. Sertifikat dizaynini yarating
3. Export qiling (JPG, 100% quality)
4. `public/rasm.jpg` ga saqlang

## Matnlar Ko'rinmayapti?

Agar matnlar (raqamlar, ismlar) ko'rinmasa:

### Tekshirish

1. Browser DevTools'ni oching (F12)
2. Certificate elementlarini inspect qiling
3. CSS styles'ni tekshiring

### Muammo: Matn oq, background ham oq

Agar matn ko'rinmasa, CSS'da `color` qo'shing:

```css
.cert .gpp {
  /* ... */
  background-color: #fff;
  color: #000; /* <-- QO'SHING */
}
```

### Muammo: Background transparent

CSS'da `background-color: rgba(255, 255, 255, 0.9)` o'rniga:

```css
background-color: #ffffff; /* To'liq oq */
```

## Test Qilish

1. Sertifikat yaratish
2. "Sertifikat yuklab olish" tugmasini bosish
3. PNG faylni ochish va tekshirish:
   - Background rasm ko'rinishi kerak
   - Barcha matnlar o'qilishi kerak
   - QR kod aniq ko'rinishi kerak

## Qo'shimcha

Agar rasm juda katta bo'lsa (masalan, 10MB+):

1. Rasmni siqing (compress):
   - https://tinypng.com
   - Yoki Photoshop'da "Save for Web"

2. Optimal sifat: 80-90% JPG quality

3. Web uchun optimizatsiya qiling

## Yordam

Agar muammo davom etsa:

1. Browser Console'ni tekshiring (F12 > Console)
2. Network tab'da `/rasm.jpg` yuklanayotganini tekshiring
3. Agar 404 xatosi bo'lsa - rasm noto'g'ri joyda
4. Agar rasm yuklanyapti lekin ko'rinmasa - CSS masalasi

---

**Eslatma:** Rasm fayli `.gitignore`ga qo'shilmagan bo'lishi kerak, aks holda git'ga commit qilish mumkin emas.

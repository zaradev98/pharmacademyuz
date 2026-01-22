# Vercel Deployment Guide for qr-app

1. **Vercelga kirish**
   - https://vercel.com/ saytiga kiring va GitHub, GitLab yoki Bitbucket akkauntingiz bilan tizimga kiring.

2. **Yangi Project qo'shish**
   - "Add New Project" tugmasini bosing.
   - GitHub (yoki boshqa) repozitoriyadan `qr-app` loyihasini tanlang.

3. **Sozlamalar**
   - Framework: `Other` yoki `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install` (default)

4. **Muhit o'zgaruvchilarini qo'shish (agar kerak bo'lsa)**
   - Supabase yoki boshqa API kalitlarini "Environment Variables" bo'limiga kiriting.

5. **Deploy**
   - "Deploy" tugmasini bosing va kuting.
   - Deploy tugagach, Vercel sizga tayyor link beradi.

**Qo'shimcha:**
- `vercel.json` fayli routing va build uchun tayyorlandi.
- `dist` papkasi build natijasida hosil bo'ladi.

Agar maxsus backend kerak bo'lsa, uni alohida Vercel serverless function sifatida joylashtiring.

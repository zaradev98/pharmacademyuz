-- ==========================================
-- DATABASE O'ZGARTIRISHLARI
-- ==========================================
-- Bu faylni Supabase SQL Editor da ishga tushiring

-- 0. Process jadvalini yaratish (agar mavjud bo'lmasa)
CREATE TABLE IF NOT EXISTS public.process (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  qr_text text not null,
  qr_image_url text not null,
  file_path text not null,
  title character varying(255) null default 'QR Code'::character varying,
  description text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  search_vector tsvector null,
  certificate_image_url text null,
  certificate_file_path text null,
  constraint process_pkey primary key (id),
  constraint process_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_process_user_id ON public.process USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_process_created_at ON public.process USING btree (created_at DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_process_title ON public.process USING btree (title) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_process_description ON public.process USING btree (description) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_process_search ON public.process USING gin (search_vector) TABLESPACE pg_default;

-- 1. Process jadvaliga yangi ustunlar qo'shish (agar mavjud bo'lmasa)
-- ALTER TABLE process ADD COLUMN IF NOT EXISTS certificate_image_url TEXT;
-- ALTER TABLE process ADD COLUMN IF NOT EXISTS certificate_file_path TEXT;

-- 2. Process jadvalidagi user_id ni nullable qilish
ALTER TABLE process ALTER COLUMN user_id DROP NOT NULL;

-- 2. user_id uchun default qiymat qo'yish (ixtiyoriy)
-- Agar user login qilmagan bo'lsa, NULL saqlanadi

-- 3. Policies ni yangilash - barcha foydalanuvchilar barchani ko'rishi mumkin
DROP POLICY IF EXISTS "Users can view own process" ON process;
DROP POLICY IF EXISTS "Users can insert own process" ON process;
DROP POLICY IF EXISTS "Users can update own process" ON process;
DROP POLICY IF EXISTS "Users can delete own process" ON process;

-- Yangi policies - hamma ko'rishi, yaratishi va o'chirishi mumkin
CREATE POLICY "Anyone can view process" ON process
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert process" ON process
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update process" ON process
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete process" ON process
    FOR DELETE USING (true);

-- 4. Storage policies ni yangilash
DROP POLICY IF EXISTS "Users can upload QR codes" ON storage.objects;
DROP POLICY IF EXISTS "QR codes are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own QR codes" ON storage.objects;

CREATE POLICY "Anyone can upload to qrcodes bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qrcodes');

CREATE POLICY "QR codes are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'qrcodes');

CREATE POLICY "Anyone can delete from qrcodes bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'qrcodes');

-- ==========================================
-- QOSHIMCHA: INDEX OPTIMIZATION
-- ==========================================

-- Qidiruv tezligini oshirish uchun
CREATE INDEX IF NOT EXISTS idx_process_title ON process(title);
CREATE INDEX IF NOT EXISTS idx_process_description ON process(description);

-- Full text search uchun (ixtiyoriy)
ALTER TABLE process ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_process_search ON process USING gin(search_vector);

-- Search vector ni avtomatik yangilash
CREATE OR REPLACE FUNCTION process_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.qr_text, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER process_search_update BEFORE INSERT OR UPDATE
    ON process FOR EACH ROW EXECUTE FUNCTION process_search_trigger();

-- Updated_at ni avtomatik yangilash funksiyasi
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_process_updated_at BEFORE UPDATE
    ON process FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

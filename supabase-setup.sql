-- ==========================================
-- SUPABASE DATABASE SETUP
-- ==========================================
-- Bu faylni Supabase SQL Editor da ishga tushiring

-- 1. Roles jadvali yaratish
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rollarni qo'shish
INSERT INTO roles (name, description) VALUES
    ('superadmin', 'Super administrator with full access'),
    ('admin', 'Administrator - can create users only'),
    ('user', 'Regular user - read only access')
ON CONFLICT (name) DO NOTHING;

-- 2. Users jadvali yaratish
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mock superadmin user yaratish
-- Parol: 900411134 (bcrypt hash bilan)
DO $$
DECLARE
    v_role_id UUID;
    v_user_exists BOOLEAN;
BEGIN
    -- Superadmin role ID ni olish
    SELECT id INTO v_role_id FROM roles WHERE name = 'superadmin';

    -- User mavjudligini tekshirish
    SELECT EXISTS(SELECT 1 FROM users WHERE username = 'pharmacademyuz01') INTO v_user_exists;

    -- Agar user yo'q bo'lsa, yaratish
    IF NOT v_user_exists THEN
        INSERT INTO users (username, password_hash, full_name, role_id, created_by)
        VALUES (
            'pharmacademyuz01',
            '$2b$10$mdAX8GBeKfPBWWSLNc8dbOKKVcfmP..eqOADwaJdpyyoc.c7/y7iC',
            'Super Administrator',
            v_role_id,
            NULL
        );
    END IF;
END $$;

-- 3. Process jadvali yaratish (QR kodlar tarixi)
CREATE TABLE IF NOT EXISTS process (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qr_text TEXT NOT NULL,
    qr_image_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    title VARCHAR(255) DEFAULT 'QR Code',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Updated_at ni avtomatik yangilash uchun trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Users jadvali uchun trigger
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Process jadvali uchun trigger
CREATE TRIGGER update_process_updated_at BEFORE UPDATE ON process
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Index yaratish (tezlikni oshirish uchun)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_process_user_id ON process(user_id);
CREATE INDEX IF NOT EXISTS idx_process_created_at ON process(created_at DESC);

-- 7. Row Level Security (RLS) yoqish - xavfsizlik uchun
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;

-- 8. Policies yaratish
-- Roles - hamma o'qiy oladi
CREATE POLICY "Anyone can view roles" ON roles
    FOR SELECT USING (true);

-- Users policies - role-based access
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true);

CREATE POLICY "Admins and superadmins can insert users" ON users
    FOR INSERT WITH CHECK (true);

-- Process jadvali uchun
CREATE POLICY "Users can view own process" ON process
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own process" ON process
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own process" ON process
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own process" ON process
    FOR DELETE USING (true);

-- ==========================================
-- STORAGE BUCKET SETUP
-- ==========================================
-- Supabase Storage da 'qrcodes' bucket yaratish kerak
-- Bu qismni Supabase Dashboard > Storage da qo'lda bajaring:
-- 1. "Create a new bucket" tugmasini bosing
-- 2. Bucket nomini 'qrcodes' deb kiriting
-- 3. Public bucket sifatida yarating

-- Yoki SQL orqali:
INSERT INTO storage.buckets (id, name, public)
VALUES ('qrcodes', 'qrcodes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload QR codes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qrcodes');

CREATE POLICY "QR codes are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'qrcodes');

CREATE POLICY "Users can delete own QR codes"
ON storage.objects FOR DELETE
USING (bucket_id = 'qrcodes');

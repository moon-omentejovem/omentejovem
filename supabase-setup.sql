-- =====================================================
-- Omentejovem CMS Database Setup
-- Execute this SQL in your Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Series table
CREATE TABLE IF NOT EXISTS public.series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artworks table
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description JSONB,
  token_id TEXT,
  mint_date DATE,
  mint_link TEXT,
  type TEXT NOT NULL CHECK (type IN ('single', 'edition')),
  editions_total INTEGER,
  image_url TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_one_of_one BOOLEAN DEFAULT FALSE,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Series-Artworks junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.series_artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, artwork_id)
);

-- Artifacts table
CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  highlight_video_url TEXT,
  link_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- About page table (singleton)
CREATE TABLE IF NOT EXISTS public.about_page (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_artworks_slug ON public.artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artworks_featured ON public.artworks(is_featured);
CREATE INDEX IF NOT EXISTS idx_artworks_one_of_one ON public.artworks(is_one_of_one);
CREATE INDEX IF NOT EXISTS idx_artworks_type ON public.artworks(type);
CREATE INDEX IF NOT EXISTS idx_artworks_posted_at ON public.artworks(posted_at);
CREATE INDEX IF NOT EXISTS idx_series_slug ON public.series(slug);
CREATE INDEX IF NOT EXISTS idx_series_artworks_series ON public.series_artworks(series_id);
CREATE INDEX IF NOT EXISTS idx_series_artworks_artwork ON public.series_artworks(artwork_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_artworks_updated_at ON public.artworks;
CREATE TRIGGER update_artworks_updated_at
  BEFORE UPDATE ON public.artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_series_updated_at ON public.series;
CREATE TRIGGER update_series_updated_at
  BEFORE UPDATE ON public.series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_artifacts_updated_at ON public.artifacts;
CREATE TRIGGER update_artifacts_updated_at
  BEFORE UPDATE ON public.artifacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_about_page_updated_at ON public.about_page;
CREATE TRIGGER update_about_page_updated_at
  BEFORE UPDATE ON public.about_page
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_page ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER ROLES SYSTEM
-- =====================================================

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES (ADMIN-ONLY WRITE ACCESS)
-- =====================================================

-- Public read access for all tables
-- Admin-only write access for all content management

-- Artworks policies
DROP POLICY IF EXISTS "Public artworks are viewable by everyone" ON public.artworks;
CREATE POLICY "Public artworks are viewable by everyone"
  ON public.artworks FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage artworks" ON public.artworks;
CREATE POLICY "Admins can manage artworks"
  ON public.artworks FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Series policies
DROP POLICY IF EXISTS "Public series are viewable by everyone" ON public.series;
CREATE POLICY "Public series are viewable by everyone"
  ON public.series FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage series" ON public.series;
CREATE POLICY "Admins can manage series"
  ON public.series FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Series-Artworks junction policies
DROP POLICY IF EXISTS "Public series_artworks are viewable by everyone" ON public.series_artworks;
CREATE POLICY "Public series_artworks are viewable by everyone"
  ON public.series_artworks FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage series_artworks" ON public.series_artworks;
CREATE POLICY "Admins can manage series_artworks"
  ON public.series_artworks FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Artifacts policies
DROP POLICY IF EXISTS "Public artifacts are viewable by everyone" ON public.artifacts;
CREATE POLICY "Public artifacts are viewable by everyone"
  ON public.artifacts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage artifacts" ON public.artifacts;
CREATE POLICY "Admins can manage artifacts"
  ON public.artifacts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- About page policies
DROP POLICY IF EXISTS "Public about_page is viewable by everyone" ON public.about_page;
CREATE POLICY "Public about_page is viewable by everyone"
  ON public.about_page FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage about_page" ON public.about_page;
CREATE POLICY "Admins can manage about_page"
  ON public.about_page FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to media files
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Public can view media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Allow authenticated users to manage media files
DROP POLICY IF EXISTS "Authenticated users can manage media" ON storage.objects;
CREATE POLICY "Authenticated users can manage media"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
  );

-- Create storage bucket for image cache
INSERT INTO storage.buckets (id, name, public)
VALUES ('cached-images', 'cached-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to cached images
DROP POLICY IF EXISTS "Public can view cached images" ON storage.objects;
CREATE POLICY "Public can view cached images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cached-images');

-- Allow authenticated users to manage cached images
DROP POLICY IF EXISTS "Authenticated users can manage cached images" ON storage.objects;
CREATE POLICY "Authenticated users can manage cached images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'cached-images'
    AND auth.role() = 'authenticated'
  );

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample about page if none exists
INSERT INTO public.about_page (content)
SELECT jsonb_build_object(
  'type', 'doc',
  'content', jsonb_build_array(
    jsonb_build_object(
      'type', 'heading',
      'attrs', jsonb_build_object('level', 1),
      'content', jsonb_build_array(
        jsonb_build_object('type', 'text', 'text', 'About Omentejovem')
      )
    ),
    jsonb_build_object(
      'type', 'paragraph',
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'text',
          'text', 'Welcome to Omentejovem, a digital art collection exploring the intersection of technology, nature, and human creativity.'
        )
      )
    )
  )
)
WHERE NOT EXISTS (SELECT 1 FROM public.about_page);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify everything was created correctly:

-- Check tables
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('artworks', 'series', 'series_artworks', 'artifacts', 'about_page')
ORDER BY tablename;

-- Check RLS status
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('artworks', 'series', 'series_artworks', 'artifacts', 'about_page')
ORDER BY tablename;

-- Check policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- ADMIN USER SETUP
-- =====================================================

-- IMPORTANTE: Substitua 'seu-email@exemplo.com' pelo seu email real
-- Execute este comando APÓS criar seu usuário via Supabase Auth

-- Opção 1: Definir usuário admin por email (RECOMENDADO)
-- Descomente e substitua o email abaixo:

/*
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'seu-email@exemplo.com'  -- SUBSTITUA pelo seu email
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
*/

-- Opção 2: Definir TODOS os usuários atuais como admin (APENAS PARA DESENVOLVIMENTO)
-- Descomente apenas se quiser que todos os usuários sejam admin:

/*
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
*/

-- =====================================================
-- VERIFICAÇÃO DO SISTEMA DE ROLES
-- =====================================================

-- Execute estas queries para verificar se tudo está funcionando:

-- 1. Verificar se a tabela user_roles foi criada
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_roles' AND table_schema = 'public';

-- 2. Verificar usuários e seus roles
SELECT
  u.email,
  u.created_at as user_created,
  ur.role,
  ur.created_at as role_created
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;

-- 3. Testar função is_admin() (deve retornar true para admins)
SELECT public.is_admin() as is_current_user_admin;

-- 4. Verificar políticas RLS
SELECT
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('artworks', 'series', 'artifacts', 'about_page', 'user_roles')
ORDER BY tablename, policyname;

-- Success message
SELECT 'Sistema de roles configurado com sucesso! 🎉' as status;

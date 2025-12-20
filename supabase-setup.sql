-- =====================================================
-- Omentejovem CMS Database Setup
-- Executar no projeto Supabase de destino
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Séries
CREATE TABLE IF NOT EXISTS public.series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  imageurl TEXT,
  imageoptimizedurl TEXT,
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artworks
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description JSONB,
  token_id TEXT,
  mint_date DATE,
  mint_link TEXT,
  external_platforms JSONB,
  type TEXT NOT NULL CHECK (type IN ('single', 'edition')),
  editions_total INTEGER,
  imageurl TEXT,
  imageoptimizedurl TEXT,
  video_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_one_of_one BOOLEAN DEFAULT FALSE,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  display_order INTEGER,
  blockchain TEXT,
  collection_slug TEXT,
  contract_address TEXT,
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published'))
);

-- Relacionamento N:N entre séries e artworks
CREATE TABLE IF NOT EXISTS public.series_artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, artwork_id)
);

-- Artifacts
CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  highlight_video_url TEXT,
  link_url TEXT,
  imageurl TEXT,
  imageoptimizedurl TEXT,
  filename TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- About page (singleton)
CREATE TABLE IF NOT EXISTS public.about_page (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content JSONB NOT NULL,
  imageurl TEXT,
  filename TEXT,
  exhibitions JSONB,
  press JSONB,
  socials JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER ROLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_series_slug ON public.series(slug);
CREATE INDEX IF NOT EXISTS idx_artworks_slug ON public.artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artworks_posted_at ON public.artworks(posted_at);
CREATE INDEX IF NOT EXISTS idx_artworks_display_order ON public.artworks(display_order);
CREATE INDEX IF NOT EXISTS idx_artworks_featured ON public.artworks(is_featured);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON public.artworks(status);
CREATE INDEX IF NOT EXISTS idx_series_artworks_series ON public.series_artworks(series_id);
CREATE INDEX IF NOT EXISTS idx_series_artworks_artwork ON public.series_artworks(artwork_id);

-- =====================================================
-- TRIGGERS updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_artworks_updated_at ON public.artworks;
CREATE TRIGGER trg_artworks_updated_at
  BEFORE UPDATE ON public.artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_series_updated_at ON public.series;
CREATE TRIGGER trg_series_updated_at
  BEFORE UPDATE ON public.series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_artifacts_updated_at ON public.artifacts;
CREATE TRIGGER trg_artifacts_updated_at
  BEFORE UPDATE ON public.artifacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_about_page_updated_at ON public.about_page;
CREATE TRIGGER trg_about_page_updated_at
  BEFORE UPDATE ON public.about_page
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER trg_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de leitura pública
CREATE POLICY IF NOT EXISTS "Series são públicas" ON public.series
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Artworks são públicos" ON public.artworks
  FOR SELECT USING (status = 'published' OR is_admin());

CREATE POLICY IF NOT EXISTS "Relações série-artwork são públicas" ON public.series_artworks
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Artifacts são públicos" ON public.artifacts
  FOR SELECT USING (status = 'published' OR is_admin());

CREATE POLICY IF NOT EXISTS "About é pública" ON public.about_page
  FOR SELECT USING (true);

-- Políticas de escrita restritas a admins
CREATE POLICY IF NOT EXISTS "Admins gerenciam séries" ON public.series
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY IF NOT EXISTS "Admins gerenciam artworks" ON public.artworks
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY IF NOT EXISTS "Admins gerenciam relações" ON public.series_artworks
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY IF NOT EXISTS "Admins gerenciam artifacts" ON public.artifacts
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY IF NOT EXISTS "Admins gerenciam about" ON public.about_page
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY IF NOT EXISTS "Admins gerenciam roles" ON public.user_roles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('cached-images', 'cached-images', true)
ON CONFLICT (id) DO NOTHING;

-- Permissões de leitura pública
DROP POLICY IF EXISTS "Public pode ler media" ON storage.objects;
CREATE POLICY "Public pode ler media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Public pode ler cached images" ON storage.objects;
CREATE POLICY "Public pode ler cached images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cached-images');

-- Escrita para usuários autenticados
DROP POLICY IF EXISTS "Authenticated gerencia media" ON storage.objects;
CREATE POLICY "Authenticated gerencia media"
  ON storage.objects FOR ALL
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated gerencia cached" ON storage.objects;
CREATE POLICY "Authenticated gerencia cached"
  ON storage.objects FOR ALL
  USING (bucket_id = 'cached-images' AND auth.role() = 'authenticated');

-- =====================================================
-- DADOS OPCIONAIS (ABOUT PAGE BASE)
-- =====================================================

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
          'text', 'Atualize este conteúdo pelo painel admin.'
        )
      )
    )
  )
)
WHERE NOT EXISTS (SELECT 1 FROM public.about_page);

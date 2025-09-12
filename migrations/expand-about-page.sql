-- Migration: Expand about_page table with social media, exhibitions, and press fields
-- This expands the existing about_page table to include all fields needed for complete About page management

-- Drop the existing about_page table to recreate with new structure
DROP TABLE IF EXISTS public.about_page CASCADE;

-- Create expanded about_page table
CREATE TABLE public.about_page (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Basic content
  title TEXT NOT NULL DEFAULT 'Thales Machado',
  subtitle TEXT NOT NULL DEFAULT 'omentejovem',
  subtitle_description TEXT,
  bio_content JSONB, -- Rich text content from Tiptap
  
  -- Social media links
  social_twitter TEXT,
  social_instagram TEXT, 
  social_aotm TEXT,
  social_superrare TEXT,
  social_foundation TEXT,
  social_opensea TEXT,
  social_objkt TEXT,
  
  -- Contact information
  email TEXT,
  
  -- Press articles - array of objects with title and link
  press JSONB DEFAULT '[]'::jsonb,
  
  -- Exhibitions - array of objects with title and link  
  exhibitions JSONB DEFAULT '[]'::jsonb,
  
  -- Featured images for the bio section
  featured_images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs with captions
  
  -- Meta fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_about_page_updated_at ON public.about_page;
CREATE TRIGGER handle_about_page_updated_at
  BEFORE UPDATE ON public.about_page
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.about_page ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public about_page is viewable by everyone" ON public.about_page;
CREATE POLICY "Public about_page is viewable by everyone"
  ON public.about_page FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage about_page" ON public.about_page;
CREATE POLICY "Admins can manage about_page"
  ON public.about_page FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Insert default about page record
INSERT INTO public.about_page (
  id,
  title,
  subtitle,
  subtitle_description,
  bio_content,
  social_twitter,
  social_instagram,
  social_aotm,
  social_superrare,
  social_foundation,
  social_opensea,
  social_objkt,
  email,
  press,
  exhibitions,
  featured_images
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Thales Machado',
  'omentejovem',
  '"Late Night Love" is an artwork created by him in late 2021, in which he strongly identified with the moon and decided to make it part of his identity.',
  '{"type":"doc","content":[]}',
  'https://twitter.com/omentejovem',
  'https://instagram.com/omentejovem', 
  'https://aotm.gallery/artist/omentejovem',
  'https://superrare.com/omentejovem',
  'https://foundation.app/@omentejovem',
  'https://opensea.io/omentejovem',
  'https://objkt.com/@omentejovem',
  'contact@omentejovem.com',
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  subtitle_description = EXCLUDED.subtitle_description,
  social_twitter = EXCLUDED.social_twitter,
  social_instagram = EXCLUDED.social_instagram,
  social_aotm = EXCLUDED.social_aotm,
  social_superrare = EXCLUDED.social_superrare,
  social_foundation = EXCLUDED.social_foundation,
  social_opensea = EXCLUDED.social_opensea,
  social_objkt = EXCLUDED.social_objkt,
  email = EXCLUDED.email,
  updated_at = now();

COMMENT ON TABLE public.about_page IS 'About page content management - singleton table';

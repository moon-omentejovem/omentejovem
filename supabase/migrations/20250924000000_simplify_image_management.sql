-- Migration: Simplify Image Management System
-- This migration simplifies the image system to use slug-based paths only
-- Images will be stored as {slug}.webp and {slug}-raw.jpg in Supabase Storage
-- Paths will be generated dynamically from slugs, eliminating redundant database fields

BEGIN;


-- Step 2: Add new function to generate image paths from slug
CREATE OR REPLACE FUNCTION get_image_path(slug_value TEXT, image_type TEXT DEFAULT 'optimized')
RETURNS TEXT AS $$
BEGIN
  IF image_type = 'raw' THEN
    RETURN 'artworks/raw/' || slug_value || '-raw.jpg';
  ELSE
    RETURN 'artworks/optimized/' || slug_value || '.webp';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Add function to generate series cover image path
CREATE OR REPLACE FUNCTION get_series_image_path(slug_value TEXT, image_type TEXT DEFAULT 'optimized')
RETURNS TEXT AS $$
BEGIN
  IF image_type = 'raw' THEN
    RETURN 'series/raw/' || slug_value || '-raw.jpg';
  ELSE
    RETURN 'series/optimized/' || slug_value || '.webp';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 4: Add function to generate artifact image path
CREATE OR REPLACE FUNCTION get_artifact_image_path(id_value UUID, image_type TEXT DEFAULT 'optimized')
RETURNS TEXT AS $$
BEGIN
  IF image_type = 'raw' THEN
    RETURN 'artifacts/raw/' || id_value || '-raw.jpg';
  ELSE
    RETURN 'artifacts/optimized/' || id_value || '.webp';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- As views não devem conflitar nomes de colunas, então não selecione colunas antigas duplicadas
CREATE OR REPLACE VIEW artworks_with_images AS
SELECT
  a.id,
  a.slug,
  get_image_path(a.slug, 'optimized') as optimized_image_path,
  get_image_path(a.slug, 'raw') as raw_image_path
FROM artworks a;

CREATE OR REPLACE VIEW series_with_images AS
SELECT
  s.id,
  s.slug,
  get_series_image_path(s.slug, 'optimized') as optimized_image_path,
  get_series_image_path(s.slug, 'raw') as raw_image_path
FROM series s;

CREATE OR REPLACE VIEW artifacts_with_images AS
SELECT
  ar.id,
  ar.slug,
  get_artifact_image_path(ar.id, 'optimized') as optimized_image_path,
  get_artifact_image_path(ar.id, 'raw') as raw_image_path
FROM artifacts ar;

-- Step 6: Grant permissions on the new views
GRANT SELECT ON artworks_with_images TO PUBLIC;
GRANT SELECT ON series_with_images TO PUBLIC;
GRANT SELECT ON artifacts_with_images TO PUBLIC;

-- Add indexes to ensure performance is maintained
CREATE INDEX IF NOT EXISTS idx_artworks_slug_performance ON artworks(slug);
CREATE INDEX IF NOT EXISTS idx_series_slug_performance ON series(slug);

COMMIT;
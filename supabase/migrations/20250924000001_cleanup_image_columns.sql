-- Migration: Cleanup Old Image Columns
-- This migration removes the old image path columns after successful migration to slug-based system
-- IMPORTANT: Only run this after confirming the slug-based system is working correctly

BEGIN;

-- Step 1: Drop old image columns from artworks table
-- These are no longer needed as paths are generated dynamically from slugs
ALTER TABLE artworks DROP COLUMN IF EXISTS image_path;
ALTER TABLE artworks DROP COLUMN IF EXISTS raw_image_path;
ALTER TABLE artworks DROP COLUMN IF EXISTS image_url;
ALTER TABLE artworks DROP COLUMN IF EXISTS raw_image_url;

-- Step 2: Drop old image columns from series table
ALTER TABLE series DROP COLUMN IF EXISTS cover_image_path;
ALTER TABLE series DROP COLUMN IF EXISTS cover_image_url;

-- Step 3: Drop old image columns from artifacts table
ALTER TABLE artifacts DROP COLUMN IF EXISTS image_path;
ALTER TABLE artifacts DROP COLUMN IF EXISTS image_url;

-- Step 4: Add comments to document the new approach
COMMENT ON COLUMN artworks.slug IS 'Slug used to generate image paths dynamically: artworks/optimized/{slug}.webp and artworks/raw/{slug}-raw.jpg';
COMMENT ON COLUMN series.slug IS 'Slug used to generate image paths dynamically: series/optimized/{slug}.webp and series/raw/{slug}-raw.jpg';
COMMENT ON TABLE artifacts IS 'Artifact images use ID-based paths: artifacts/optimized/{id}.webp and artifacts/raw/{id}-raw.jpg';


-- Views sem colunas antigas e sem duplicidade
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

-- Step 6: Create a setting for the Supabase URL (used in views)
-- This should be updated when deployed to production
SELECT set_config('app.supabase_url', 'https://your-project.supabase.co', false);

COMMIT;
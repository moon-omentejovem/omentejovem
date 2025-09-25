-- Enable ID-based image management
-- Adds filename columns and helper functions for new storage structure

BEGIN;

-- 1. Add filename columns (nullable during transition)
ALTER TABLE public.artworks
  ADD COLUMN IF NOT EXISTS image_filename text;

ALTER TABLE public.series
  ADD COLUMN IF NOT EXISTS image_filename text;

ALTER TABLE public.artifacts
  ADD COLUMN IF NOT EXISTS image_filename text;

-- 2. Backfill filename columns using existing slugs/titles as fallback
UPDATE public.artworks
SET image_filename = CONCAT(slug, '.jpg')
WHERE image_filename IS NULL;

UPDATE public.series
SET image_filename = CONCAT(slug, '.jpg')
WHERE image_filename IS NULL;

UPDATE public.artifacts
SET image_filename = CONCAT(
  LOWER(REGEXP_REPLACE(COALESCE(slug, title), '[^a-z0-9]+', '-', 'g')),
  '.jpg'
)
WHERE image_filename IS NULL;

-- 3. Helper function to sanitize identifiers
CREATE OR REPLACE FUNCTION sanitize_storage_segment(input text)
RETURNS text AS $$
DECLARE
  sanitized text;
BEGIN
  sanitized := LOWER(REGEXP_REPLACE(COALESCE(input, ''), '[^a-z0-9._-]+', '-', 'g'));
  sanitized := REGEXP_REPLACE(sanitized, '-{2,}', '-', 'g');
  sanitized := REGEXP_REPLACE(sanitized, '(^-|-$)', '', 'g');
  IF sanitized = '' THEN
    RETURN 'unknown';
  END IF;
  RETURN sanitized;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Helper to sanitize filenames (keeps extension for raw, uses .webp for optimized)
CREATE OR REPLACE FUNCTION build_image_paths(
  scaffold text,
  entity_id text,
  filename text
)
RETURNS TABLE (
  raw_path text,
  optimized_path text
) AS $$
DECLARE
  clean_scaffold text := sanitize_storage_segment(scaffold);
  clean_id text := sanitize_storage_segment(entity_id);
  clean_filename text := sanitize_storage_segment(filename);
  base_name text;
  extension text;
  dot_position integer;
BEGIN
  dot_position := POSITION('.' IN REVERSE(clean_filename));

  IF dot_position > 0 THEN
    base_name := LEFT(clean_filename, LENGTH(clean_filename) - dot_position);
    extension := RIGHT(clean_filename, dot_position - 1);
  ELSE
    base_name := clean_filename;
    extension := 'jpg';
  END IF;

  raw_path := clean_scaffold || '/' || clean_id || '/raw/' || base_name || '.' || extension;
  optimized_path := CASE
    WHEN clean_scaffold = 'editor' THEN NULL
    ELSE clean_scaffold || '/' || clean_id || '/optimized/' || base_name || '.webp'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Convenience wrappers per entity
CREATE OR REPLACE FUNCTION get_artwork_image_path(
  artwork_id uuid,
  filename text,
  image_type text DEFAULT 'optimized'
)
RETURNS text AS $$
DECLARE
  paths RECORD;
BEGIN
  SELECT * INTO paths FROM build_image_paths('artworks', artwork_id::text, filename);
  IF image_type = 'raw' THEN
    RETURN paths.raw_path;
  END IF;
  RETURN COALESCE(paths.optimized_path, paths.raw_path);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_series_image_path(
  series_id uuid,
  filename text,
  image_type text DEFAULT 'optimized'
)
RETURNS text AS $$
DECLARE
  paths RECORD;
BEGIN
  SELECT * INTO paths FROM build_image_paths('series', series_id::text, filename);
  IF image_type = 'raw' THEN
    RETURN paths.raw_path;
  END IF;
  RETURN COALESCE(paths.optimized_path, paths.raw_path);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_artifact_image_path(
  artifact_id uuid,
  filename text,
  image_type text DEFAULT 'optimized'
)
RETURNS text AS $$
DECLARE
  paths RECORD;
BEGIN
  SELECT * INTO paths FROM build_image_paths('artifacts', artifact_id::text, filename);
  IF image_type = 'raw' THEN
    RETURN paths.raw_path;
  END IF;
  RETURN COALESCE(paths.optimized_path, paths.raw_path);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Update helper views to use new columns
CREATE OR REPLACE VIEW artworks_with_images AS
SELECT
  a.id,
  a.slug,
  a.image_filename,
  get_artwork_image_path(a.id, a.image_filename, 'optimized') AS optimized_image_path,
  get_artwork_image_path(a.id, a.image_filename, 'raw') AS raw_image_path
FROM public.artworks a;

CREATE OR REPLACE VIEW series_with_images AS
SELECT
  s.id,
  s.slug,
  s.image_filename,
  get_series_image_path(s.id, s.image_filename, 'optimized') AS optimized_image_path,
  get_series_image_path(s.id, s.image_filename, 'raw') AS raw_image_path
FROM public.series s;

CREATE OR REPLACE VIEW artifacts_with_images AS
SELECT
  ar.id,
  ar.slug,
  ar.image_filename,
  get_artifact_image_path(ar.id, ar.image_filename, 'optimized') AS optimized_image_path,
  get_artifact_image_path(ar.id, ar.image_filename, 'raw') AS raw_image_path
FROM public.artifacts ar;

COMMIT;

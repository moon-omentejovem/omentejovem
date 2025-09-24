-- Migration: Drop deprecated image columns definitively
-- Remove all legacy image path/url columns from artworks, series, artifacts

BEGIN;

-- Artworks
ALTER TABLE artworks DROP COLUMN IF EXISTS image_url;
ALTER TABLE artworks DROP COLUMN IF EXISTS image_path;
ALTER TABLE artworks DROP COLUMN IF EXISTS raw_image_url;
ALTER TABLE artworks DROP COLUMN IF EXISTS raw_image_path;

-- Series
ALTER TABLE series DROP COLUMN IF EXISTS cover_image_url;
ALTER TABLE series DROP COLUMN IF EXISTS cover_image_path;

-- Artifacts
ALTER TABLE artifacts DROP COLUMN IF EXISTS image_url;
ALTER TABLE artifacts DROP COLUMN IF EXISTS image_path;

COMMIT;

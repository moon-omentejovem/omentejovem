-- Migration: Add image path fields alongside existing URL fields
-- This migration adds new path fields while keeping the old URL fields
-- The migration script will populate the new fields, then we can drop the old ones

BEGIN;

-- 1. Add new path columns to artworks table
ALTER TABLE artworks
  ADD COLUMN image_path TEXT;

ALTER TABLE artworks
  ADD COLUMN raw_image_path TEXT;

-- 2. Add new path column to artifacts table
ALTER TABLE artifacts
  ADD COLUMN image_path TEXT;

-- 3. Add new path column to series table
ALTER TABLE series
  ADD COLUMN cover_image_path TEXT;

-- Add column comments to document the new fields
COMMENT ON COLUMN artworks.image_path IS 'Storage path for optimized image (WebP format)';
COMMENT ON COLUMN artworks.raw_image_path IS 'Storage path for original uploaded image';
COMMENT ON COLUMN artifacts.image_path IS 'Storage path for artifact image';
COMMENT ON COLUMN series.cover_image_path IS 'Storage path for series cover image';

COMMIT;

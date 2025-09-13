-- Migration: Add raw_image_url field to artworks table
-- Purpose: Store original image URLs for high-resolution modal display
-- Date: 2025-09-13

-- Add raw_image_url column to artworks table
ALTER TABLE artworks
ADD COLUMN raw_image_url TEXT;

-- Update existing artworks to populate raw_image_url with current image_url
-- This ensures backward compatibility and provides a starting point
UPDATE artworks
SET raw_image_url = image_url
WHERE raw_image_url IS NULL;

-- Add comment to document the field purpose
COMMENT ON COLUMN artworks.raw_image_url IS 'Original high-resolution image URL stored in Supabase Storage for modal display';

-- Create index for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_artworks_raw_image_url ON artworks(raw_image_url);

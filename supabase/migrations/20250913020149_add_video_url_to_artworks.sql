-- Migration: Add video_url field to artworks table
-- Date: 2025-09-13
-- Description: Adds video_url column to store NFT animation/video URLs

-- Add video_url column to artworks table
ALTER TABLE artworks
ADD COLUMN video_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN artworks.video_url IS 'URL do vídeo/animação do NFT (migrado de animation_url do JSON legacy)';

-- Create index for performance (optional, if we'll query by video_url)
CREATE INDEX IF NOT EXISTS idx_artworks_video_url ON artworks(video_url) WHERE video_url IS NOT NULL;
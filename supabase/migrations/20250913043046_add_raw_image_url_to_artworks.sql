-- Add raw_image_url field to artworks table
-- This field will store the original high-resolution image URL from the 'raw' folder in Supabase Storage

ALTER TABLE artworks
ADD COLUMN raw_image_url TEXT;

-- Add comment to document the field purpose
COMMENT ON COLUMN artworks.raw_image_url IS 'URL da imagem original em alta resolução armazenada na pasta raw do bucket Supabase Storage';

-- Update RLS policies to include the new field (if needed)
-- The existing policies should automatically cover this new field

-- Add raw_image_url field to artworks table
-- This field will store the URL to the original high-resolution image in the 'raw' bucket folder

ALTER TABLE artworks
ADD COLUMN raw_image_url TEXT;

-- Add comment to document the field purpose
COMMENT ON COLUMN artworks.raw_image_url IS 'URL to the original high-resolution image stored in the raw bucket folder';

-- Update RLS policies to include the new field
-- The existing policies should automatically cover this field, but let's ensure read access for public
-- and write access for admins

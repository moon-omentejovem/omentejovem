-- Adiciona campo status para artworks
ALTER TABLE artworks ADD COLUMN status TEXT NOT NULL DEFAULT 'published';

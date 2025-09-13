-- Adiciona campo status para artifacts
ALTER TABLE artifacts ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
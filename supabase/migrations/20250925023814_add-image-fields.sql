-- Migration: Adiciona campos filename e imageUrl nas tabelas de imagens

ALTER TABLE artworks ADD COLUMN IF NOT EXISTS filename TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS imageUrl TEXT;

ALTER TABLE series ADD COLUMN IF NOT EXISTS filename TEXT;
ALTER TABLE series ADD COLUMN IF NOT EXISTS imageUrl TEXT;

ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS filename TEXT;
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS imageUrl TEXT;

ALTER TABLE about_page ADD COLUMN IF NOT EXISTS filename TEXT;
ALTER TABLE about_page ADD COLUMN IF NOT EXISTS imageUrl TEXT;

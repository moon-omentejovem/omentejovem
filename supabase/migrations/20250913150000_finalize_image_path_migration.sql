-- Finalizar migração dos campos de imagem: remover colunas antigas
-- Esta migration deve ser executada após a migração dos dados estar completa

-- Primeiro, remover as colunas antigas de URL dos artworks
ALTER TABLE artworks
DROP COLUMN IF EXISTS image_url,
DROP COLUMN IF EXISTS raw_image_url;

-- Remover as colunas antigas de URL dos artifacts
ALTER TABLE artifacts
DROP COLUMN IF EXISTS image_url;

-- Remover as colunas antigas de URL das series
ALTER TABLE series
DROP COLUMN IF EXISTS cover_image_url;

-- Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN artworks.image_path IS 'Caminho da imagem otimizada no bucket de storage';
COMMENT ON COLUMN artworks.raw_image_path IS 'Caminho da imagem original no bucket de storage';
COMMENT ON COLUMN artifacts.image_path IS 'Caminho da imagem do artefato no bucket de storage';
COMMENT ON COLUMN series.cover_image_path IS 'Caminho da imagem de capa da série no bucket de storage';

-- Adiciona campo display_order para ordenação de artworks
-- Similar ao WordPress: números menores têm prioridade, NULL aparece por último
ALTER TABLE artworks ADD COLUMN display_order INTEGER;

-- Cria índice para otimizar queries de ordenação
CREATE INDEX idx_artworks_display_order ON artworks(display_order) WHERE display_order IS NOT NULL;

-- Comentário para documentação
COMMENT ON COLUMN artworks.display_order IS 'Campo para controle manual da ordem de exibição. Números menores aparecem primeiro. NULL significa sem ordem definida (exibido por último)';

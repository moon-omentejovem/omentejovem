
-- Adiciona coluna imageoptimizedurl à tabela artworks
alter table public.artworks
add column imageoptimizedurl text;

comment on column public.artworks.imageoptimizedurl is 'URL da imagem otimizada para exibição padrão no frontend';

# Refatoração Global do Sistema de Imagens & Upload TipTap

## Objetivo

Unificar e modernizar toda a lógica de upload, path e resolução de imagens (artworks, séries, artifacts, editor/TipTap) usando um padrão único, centralizando helpers e removendo código legado/redundante.

## Padrão Único de Path

- Todas as imagens devem seguir:
  `{scaffold}/{id}/[raw|optimized]/{filename}.{ext}`
  - Exemplo artwork: `artworks/{SLUG}/raw/my_art.png`
  - Exemplo editor: `editor/{SLUG}/raw/my_image.png`
- Bucket: sempre `STORAGE_BUCKETS.MEDIA`.

## Centralização da Lógica

- Upload, geração de path e obtenção de URL pública devem ser feitos APENAS pelos helpers:
  - `src/utils/upload-helpers.ts` (upload)
  - `src/utils/storage.ts` (URL)
- Remover helpers/componentes legados e duplicados.
- Não usar funções específicas para cada tipo, apenas funções genéricas parametrizadas.

## Upload de Imagem no TipTap

- O upload local de imagens no `TiptapEditor` já está implementado:
  - Permite upload de arquivo local.
  - Faz upload para Supabase via helper centralizado, usando path: `editor/{SLUG}/raw/{filename}`.
  - Insere automaticamente no editor a URL pública gerada.
  - O SLUG do editor é o identificador do post/artigo/entidade.

## Mapeamento do Código Legado

### Funções/Helpers/Componentes a serem removidos/refatorados:

- `getImageUrlFromSlug`, `getImageUrlFromSlugCompat`, `generateImagePath`, `generateImagePathById` (src/utils/storage.ts)
- `uploadArtworkImage`, `uploadSeriesImage`, `uploadArtifactImage`, `uploadImageWithValidation` (src/utils/upload-helpers.ts, src/services/image-upload.service.ts)
- Imports e usos de helpers antigos em componentes (ex: HorizontalInCarousel, ArtInfo, ArtContent, AdminTable, AdminFormField, etc)
- Hooks e services que resolvem imagens por slug/scaffold/id de forma duplicada
- Qualquer lógica de path/slug/filename duplicada em componentes, hooks ou services

### Locais afetados (exemplos):

- src/components/ArtContent/\*
- src/components/admin/\*
- src/app/series/[slug]/page.tsx, src/app/newsletter/ServerImageBanner.tsx, src/app/portfolio/[slug]/page.tsx, etc
- src/services/series.service.ts, storage.service.ts
- src/utils/image-helpers.ts, image-compatibility.ts

## Pontos que Exigem Mais Implementação

- Refatorar todos os componentes para usar apenas os helpers centralizados (`uploadImage`, `getImageUrlFromId`)
- Garantir que todos os fluxos (admin, público, TipTap/editor) estejam usando o padrão `{scaffold}/{id}/[raw|optimized]/{filename}`
- Ajustar testes e exemplos de uso nos hooks e documentação
- Validar que não há mais fallback para estrutura antiga (Compat)

## Plano de Execução Prioritário

### 1. Remover helpers e funções legadas (CRÍTICO)

- Apagar funções antigas de upload e resolução de path/URL (`getImageUrlFromSlug`, `getImageUrlFromSlugCompat`, `generateImagePath`, `generateImagePathById`, `uploadArtworkImage`, `uploadSeriesImage`, `uploadArtifactImage`, `uploadImageWithValidation`).
- Remover helpers duplicados em utils/services.
- **Dependência:** Refatoração dos componentes depende da remoção desses helpers para evitar fallback.

### 2. Refatorar componentes e pages (ALTA PRIORIDADE)

- Atualizar todos os componentes para usar apenas os helpers centralizados (`uploadImage`, `getImageUrlFromId`).
- Corrigir imports e props de imagem.
- **Dependência:** Só iniciar após helpers legados removidos.

### 3. Refatorar hooks e services (ALTA PRIORIDADE)

- Atualizar hooks para não depender de slug/scaffold antigo.
- Garantir que services usem apenas helpers novos.
- **Dependência:** Pode ser feito em paralelo com componentes, mas depende dos helpers novos.

### 4. Limpeza e revisão final (MÉDIA PRIORIDADE)

- Remover código morto.
- Garantir que não há mais lógica duplicada.
- Rodar lint/build/testes.

### 5. Checklist de validação (OBRIGATÓRIO)

- Testar upload/exibição em todos os fluxos (artworks, séries, artifacts, editor).
- Validar admin e público.
- Atualizar documentação se necessário.

---

> Priorize a remoção dos helpers legados antes de qualquer refatoração em componentes/hooks. Só avance para as próximas etapas após garantir que não há fallback ou dependência do código antigo.

---

> Siga este plano para garantir a transição completa e segura para o novo padrão de imagens, sem deixar resíduos de código legado ou duplicado.

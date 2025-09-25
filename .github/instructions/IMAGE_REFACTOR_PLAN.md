# Plano de Ação — Refatoração Global do Sistema de Imagens

## 1. Mapeamento do Código Legado

### Funções/Helpers/Componentes a serem removidos/refatorados:

- `getImageUrlFromSlug`, `getImageUrlFromSlugCompat`, `generateImagePath`, `generateImagePathById` (src/utils/storage.ts)
- `uploadArtworkImage`, `uploadSeriesImage`, `uploadArtifactImage`, `uploadImageWithValidation` (src/utils/upload-helpers.ts, src/services/image-upload.service.ts)
- Imports e usos de helpers antigos em componentes (ex: HorizontalInCarousel, ArtInfo, ArtContent, AdminTable, AdminFormField, etc)
- Hooks e services que resolvem imagens por slug/scaffold/id de forma duplicada
- Qualquer lógica de path/slug/filename duplicada em componentes, hooks ou services

### Locais afetados (exemplos):

- src/components/ArtContent/*
- src/components/admin/*
- src/app/series/[slug]/page.tsx, src/app/newsletter/ServerImageBanner.tsx, src/app/portfolio/[slug]/page.tsx, etc
- src/services/series.service.ts, storage.service.ts
- src/utils/image-helpers.ts, image-compatibility.ts

## 2. Regras da Nova Estrutura de Storage

- **Padrão único de path:** `{scaffold}/{id}/[raw|optimized]/{filename}.{ext}`
  - O segmento `optimized` é **opcional** e só deve existir para recursos que necessitam de uma versão otimizada (artworks, series, artifacts).
  - Uploads sem otimização (ex.: TipTap, conteúdos auxiliares) utilizam apenas `raw`.
- **Bucket padrão:** `STORAGE_BUCKETS.MEDIA` para todos os arquivos.
- **Sanitização consistente:** todo `scaffold`, `id` e `filename` deve passar por helpers centralizados para remover caracteres inválidos e normalizar.

## 3. Pontos que Exigem Mais Implementação

- Refatorar todos os componentes para usar apenas os helpers centralizados (`uploadImage`, `getImageUrlFromId`).
- Garantir que todos os fluxos (admin, público, TipTap/editor) sigam o padrão `{scaffold}/{id}/[raw|optimized]/{filename}.{ext}` com otimização opcional.
- Atualizar scripts utilitários para executar migração do bucket, movendo arquivos antigos para a nova estrutura e removendo os paths legados após sucesso.
- Ajustar documentação e guias de migração para refletir o novo padrão e o fluxo de limpeza dos arquivos antigos.
- Validar que não há mais fallback para estrutura antiga (Compat).

## 4. Plano de Execução Prioritário

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

### 4. Migração do bucket e limpeza (ALTA PRIORIDADE)

- Executar script de migração para mover arquivos do padrão antigo `{scaffold}/{compression}/{filename}` para `{scaffold}/{id}/[raw|optimized]/{filename}`.
- Após cada upload bem-sucedido, remover o arquivo/pasta antiga para evitar duplicidade.
- Registrar logs detalhados e gerar relatórios para conferência.

### 5. Limpeza e revisão final (MÉDIA PRIORIDADE)

- Remover código morto.
- Garantir que não há mais lógica duplicada.
- Rodar lint/build/testes.

### 6. Checklist de validação (OBRIGATÓRIO)

- Testar upload/exibição em todos os fluxos (artworks, séries, artifacts, editor).
- Validar admin e público.
- Confirmar que os arquivos legados foram removidos do bucket após migração.
- Atualizar documentação se necessário.

---

> Priorize a remoção dos helpers legados antes de qualquer refatoração em componentes/hooks. Só avance para as próximas etapas após garantir que não há fallback ou dependência do código antigo.

---

> Siga este plano para garantir a transição completa e segura para o novo padrão de imagens, sem deixar resíduos de código legado ou duplicado.

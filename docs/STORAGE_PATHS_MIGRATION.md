# Migration: URLs para Storage Paths

Este documento descreve o processo completo de migração das URLs de imagem para paths do storage.

## ✅ Mudanças Implementadas

### 1. ImageUploadService Atualizado

- ✅ Removida geração de URLs públicas
- ✅ Agora retorna apenas paths do storage
- ✅ Interface `ImageUploadResult` atualizada para `optimizedPath` e `rawPath`

### 2. Migrations SQL

- ✅ **20250913140000_rename_image_urls_to_paths.sql**: Renomeia colunas
  - `image_url` → `image_path`
  - `raw_image_url` → `raw_image_path`
  - `cover_image_url` → `cover_image_path`
- ✅ **20250913150000_drop_old_image_url_columns.sql**: Remove colunas antigas (executar por último)

### 3. Utilitários de Storage

- ✅ **src/utils/storage.ts**: Helper para converter paths em URLs
  - `getPublicUrl()`: Converte path em URL pública
  - `getImageUrls()`: Converte paths para URLs otimizada e original
  - `getArtworkImageUrls()`: Helper com compatibilidade para campos antigos
  - `extractPathFromUrl()`: Extrai path de URL do Supabase

### 4. Componentes Admin Atualizados

- ✅ **AdminForm.tsx**: Agora salva paths em vez de URLs
- ✅ **AdminTable.tsx**: Usa helper para renderizar imagens
- ✅ **descriptors.ts**: Campos atualizados para `image_path`, `raw_image_path`, `cover_image_path`

### 5. Frontend Público Atualizado

- ✅ **ArtInfosNew.tsx**: Usa `getArtworkImageUrls()`
- ✅ **HorizontalInCarousel**: Componentes atualizados
- ✅ **ArtMainContent.tsx**: Carouseis usando helper de URLs

### 6. Script de Migração de Dados

- ✅ **scripts/migrate-urls-to-paths.js**: Converte URLs existentes para paths

## 🚀 Processo de Deploy

### Passo 1: Aplicar Migration de Renomeação

```bash
# Aplicar a migration que renomeia as colunas
npx supabase db push
```

### Passo 2: Executar Script de Migração de Dados

```bash
# Converter URLs existentes para paths
node scripts/migrate-urls-to-paths.js
```

### Passo 3: Regenerar Tipos do Supabase

```bash
# Regenerar tipos após mudanças no schema
npx supabase gen types typescript --local > src/types/supabase.ts
```

### Passo 4: Deploy do Código

```bash
# Deploy da aplicação com as mudanças
npm run build
# Deploy para produção
```

### Passo 5: Aplicar Migration Final (Opcional)

```bash
# Aplicar migration que remove colunas antigas
# CUIDADO: Isso é irreversível!
npx supabase db push
```

## 🔧 Funcionalidades

### Compatibilidade Durante Transição

O helper `getArtworkImageUrls()` oferece compatibilidade com campos antigos:

```typescript
// Funciona com campos novos e antigos
const imageUrls = getArtworkImageUrls(artwork)
// artwork.image_path || artwork.image_url
// artwork.raw_image_path || artwork.raw_image_url
```

### Storage Helper

```typescript
import { getPublicUrl, getImageUrls } from '@/utils/storage'

// Converter path para URL
const url = getPublicUrl('artworks/optimized/123-image.webp')

// Converter múltiplos paths
const { optimizedUrl, rawUrl } = getImageUrls(imagePath, rawImagePath)
```

### Admin Interface

- Upload de imagens agora salva paths diretamente
- Renderização de imagens usa helper automaticamente
- Formulários compatíveis com novos campos

## ⚠️ Pontos de Atenção

1. **Ordem das Migrations**: Aplicar primeiro a de renomeação, depois a de remoção
2. **Backup**: Fazer backup antes de executar o script de migração
3. **Verificação**: Testar uploads de novas imagens após deploy
4. **Compatibilidade**: Os helpers mantêm compatibilidade durante a transição

## 🧪 Testes

Após o deploy, verificar:

- [ ] Upload de novas imagens no admin
- [ ] Visualização de imagens existentes
- [ ] Carouseis funcionando
- [ ] URLs geradas corretamente

## 📚 Arquivos Modificados

### Novos Arquivos

- `src/utils/storage.ts`
- `scripts/migrate-urls-to-paths.js`
- `supabase/migrations/20250913140000_rename_image_urls_to_paths.sql`
- `supabase/migrations/20250913150000_drop_old_image_url_columns.sql`

### Arquivos Modificados

- `src/services/image-upload.service.ts`
- `src/types/descriptors.ts`
- `src/components/admin/AdminForm.tsx`
- `src/components/admin/AdminTable.tsx`
- `src/components/ArtContent/ArtInfosNew.tsx`
- `src/components/ArtContent/ArtMainContent.tsx`
- `src/components/ArtContent/HorizontalInCarousel/HorizontalInCarouselArtwork.tsx`
- `src/components/ArtContent/HorizontalInCarousel/HorizontalInCarousel.tsx`

## 🎯 Próximos Passos

1. Executar o processo de deploy acima
2. Monitorar funcionamento em produção
3. Após confirmação, aplicar migration final para limpar colunas antigas
4. Remover compatibilidade com campos antigos se necessário

# 🖼️ Simplified Image Management System

Este documento descreve o novo sistema de gerenciamento de imagens simplificado do Omentejovem CMS, que substitui o sistema anterior baseado em múltiplos campos de path/URL por um sistema baseado em slug.

## 🎯 Objetivo

**Problema anterior**: Sistema complexo com múltiplos campos para imagens:
- `image_url`, `image_path`, `raw_image_url`, `raw_image_path`
- Necessidade de salvar paths no banco de dados
- Inconsistências entre URLs e paths
- Dificuldade de manutenção

**Solução implementada**: Sistema simplificado baseado em slug:
- Imagens são nomeadas usando slug: `{slug}.webp` e `{slug}-raw.jpg`
- Paths são gerados dinamicamente a partir do slug
- Eliminação de campos redundantes no banco
- Fácil backup e organização de arquivos

## 📁 Estrutura de Armazenamento

```
supabase/storage/media/
├── artworks/
│   ├── optimized/
│   │   ├── artwork-slug-1.webp
│   │   ├── artwork-slug-2.webp
│   │   └── ...
│   └── raw/
│       ├── artwork-slug-1-raw.jpg
│       ├── artwork-slug-2-raw.jpg
│       └── ...
├── series/
│   ├── optimized/
│   │   ├── series-slug-1.webp
│   │   └── ...
│   └── raw/
│       ├── series-slug-1-raw.jpg
│       └── ...
└── artifacts/
    ├── optimized/
    │   ├── {uuid}.webp
    │   └── ...
    └── raw/
        ├── {uuid}-raw.jpg
        └── ...
```

## 🔄 Migração

### 1. **Preparação**

```bash
# 1. Verificar estado atual
node scripts/test-image-system.js

# 2. Gerar slugs faltantes (se necessário)
node scripts/test-image-system.js --generate-slugs
```

### 2. **Aplicar Migration Inicial**

```bash
# Aplicar migration que adiciona funções de geração de path
supabase db push
```

### 3. **Migrar Imagens Existentes**

```bash
# Mover imagens para novos paths baseados em slug
node scripts/migrate-to-slug-based-images.js
```

### 4. **Testar Sistema**

- Testar upload de novas imagens no admin
- Verificar se URLs são geradas corretamente
- Validar que imagens antigas ainda funcionam

### 5. **Cleanup (Opcional)**

Após confirmação que tudo funciona:

```bash
# Remover colunas antigas de path/URL
# ATENÇÃO: Esta ação é irreversível!
# Aplicar migration: 20250924000001_cleanup_image_columns.sql
```

## 🛠️ Como Usar

### Upload de Imagens

```typescript
import { ImageUploadService } from '@/services/image-upload.service'

// Novo método baseado em slug
const result = await ImageUploadService.uploadImageBySlug(
  file,
  'my-artwork-slug', // slug único
  supabase,
  'artworks' // tipo de recurso
)

// Resultado: 
// {
//   success: true,
//   slug: 'my-artwork-slug',
//   optimizedPath: 'artworks/optimized/my-artwork-slug.webp',
//   rawPath: 'artworks/raw/my-artwork-slug-raw.jpg'
// }
```

### Geração de URLs

```typescript
import { getImageUrlFromSlug } from '@/utils/storage'

// Gerar URL otimizada
const optimizedUrl = getImageUrlFromSlug('my-artwork-slug', 'artworks', 'optimized')

// Gerar URL raw
const rawUrl = getImageUrlFromSlug('my-artwork-slug', 'artworks', 'raw')
```

### No Frontend

```typescript
// Utils helper para artworks
import { getArtworkImageUrls } from '@/utils/storage'

const artwork = { slug: 'my-artwork-slug' }
const imageUrls = getArtworkImageUrls(artwork)
// {
//   optimized: 'https://project.supabase.co/storage/v1/object/public/media/artworks/optimized/my-artwork-slug.webp',
//   raw: 'https://project.supabase.co/storage/v1/object/public/media/artworks/raw/my-artwork-slug-raw.jpg'
// }
```

## 📋 Compatibilidade

### Durante a Transição

O sistema mantém compatibilidade com o método anterior:

```typescript
// Funciona tanto com slug quanto com paths antigos
function getArtworkImageUrls(artwork) {
  if (artwork.slug) {
    // Novo sistema: gerar URLs a partir do slug
    return {
      optimized: getImageUrlFromSlug(artwork.slug, 'artworks', 'optimized'),
      raw: getImageUrlFromSlug(artwork.slug, 'artworks', 'raw')
    }
  }

  // Fallback para sistema antigo
  return {
    optimized: artwork.image_url || getPublicUrl(artwork.image_path),
    raw: artwork.raw_image_url || getPublicUrl(artwork.raw_image_path)
  }
}
```

### Método Legado (Ainda Funciona)

```typescript
// Método antigo ainda disponível durante transição
const result = await ImageUploadService.uploadImageWithValidation(
  file,
  supabase,
  'artworks'
)
```

## 🗃️ Banco de Dados

### Funções SQL Criadas

```sql
-- Gerar path de artwork
SELECT get_image_path('my-slug', 'optimized'); 
-- retorna: artworks/optimized/my-slug.webp

-- Gerar path de série  
SELECT get_series_image_path('my-series', 'raw');
-- retorna: series/raw/my-series-raw.jpg

-- Gerar path de artifact
SELECT get_artifact_image_path(uuid, 'optimized');
-- retorna: artifacts/optimized/{uuid}.webp
```

### Views Disponíveis

```sql
-- Artworks com paths e URLs gerados automaticamente
SELECT * FROM artworks_with_images;

-- Series com paths e URLs gerados automaticamente  
SELECT * FROM series_with_images;

-- Artifacts com paths e URLs gerados automaticamente
SELECT * FROM artifacts_with_images;
```

## ✅ Vantagens

1. **Simplicidade**: Apenas slug/ID é necessário para gerar URLs
2. **Consistência**: Nomenclatura padronizada e previsível
3. **Backup fácil**: Arquivos organizados por slug, fácil identificação
4. **Performance**: Menos campos no banco, URLs geradas dinamicamente
5. **Manutenção**: Sistema mais simples de entender e manter
6. **SEO**: URLs mais limpas e amigáveis

## 🚨 Considerações

1. **Slugs únicos**: Garanta que slugs sejam únicos por tipo de recurso
2. **Backup**: Faça backup antes da migração
3. **Teste completo**: Valide todo o fluxo antes do cleanup
4. **URLs externas**: Sistema não funciona com URLs externas (IPFS, etc)

## 📝 Scripts Disponíveis

- `scripts/test-image-system.js` - Testa e valida o sistema
- `scripts/migrate-to-slug-based-images.js` - Migra imagens existentes
- `supabase/migrations/20250924000000_simplify_image_management.sql` - Migration inicial
- `supabase/migrations/20250924000001_cleanup_image_columns.sql` - Cleanup final
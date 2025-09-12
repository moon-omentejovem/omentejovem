# Migração de Dados Legados - Omentejovem

## 📋 Visão Geral

Este documento descreve o processo de migração dos dados NFT legados (arquivos JSON) para a nova estrutura do Supabase, seguindo a arquitetura **backend-oriented** conforme especificado no `AGENTS.md` e `BACKEND_ORIENTED_FRONTEND.md`.

## 🎯 Objetivos da Migração

1. **Centralizar dados**: Migrar do sistema baseado em arquivos JSON para Supabase
2. **Backend-oriented**: O backend (Supabase) será a única fonte da verdade
3. **Estrutura normalizada**: Usar o schema `artworks` + `series` + relacionamentos
4. **Preservar dados**: Manter todas as informações importantes dos NFTs
5. **URLs simplificadas**: Usar `mintLink` diretamente no frontend

## 📁 Arquivos Legados

### Estrutura Original
```
public/
├── token-metadata.json    # 🎯 FONTE PRINCIPAL - metadados completos de NFTs
├── nfts.json             # Dados simplificados (descontinuado)
├── mint-dates.json       # Datas de mint (descontinuado) 
└── tezos-data.json       # Dados Tezos (descontinuado)
```

### Fonte de Dados Principal

O arquivo `token-metadata.json` contém os metadados completos de todos os NFTs extraídos via Alchemy API, incluindo:

- **Contratos**: Endereços, símbolos, tipos (ERC721/ERC1155)
- **Metadados**: Títulos, descrições, imagens, atributos
- **Coleções**: OpenSea collections, slugs, banners
- **Imagens**: URLs originais, cached, thumbnails
- **Timestamps**: Datas de última atualização

## 🏗️ Mapeamento de Dados

### NFT Metadata → Artwork

```typescript
// Estrutura do token-metadata.json
{
  "name": "The Flower",
  "description": "Description text...",
  "tokenId": "5",
  "tokenType": "ERC721",
  "contract": { "address": "0x...", ... },
  "collection": { "name": "The Cycle", "slug": "the3cycle" },
  "image": { "cachedUrl": "https://...", "originalUrl": "..." },
  "timeLastUpdated": "2025-04-09T00:57:33.570Z"
}

// Mapeamento para artworks table
{
  slug: generateSlug(name),           // "the-flower"
  title: name,                        // "The Flower"
  description: convertToTiptap(desc), // JSON Tiptap format
  token_id: tokenId,                  // "5"
  mint_date: extractDate(time),       // "2023-10-17"
  mint_link: buildOpenSeaUrl(),       // Backend constrói URL
  type: tokenType === 'ERC721' ? 'single' : 'edition',
  image_url: getBestImage(),          // Prefere cached sobre original
  is_one_of_one: tokenType === 'ERC721',
  is_featured: false,                 // Definido manualmente depois
  posted_at: convertToISOString()
}
```

### Collection → Series

```typescript
// Mapeamento de coleções para séries
const seriesMapping = {
  'the3cycle': {
    slug: 'the-cycle',
    name: 'The Cycle',
    cover_image_url: 'https://i.seadn.io/...'
  },
  'omentejovem': {
    slug: 'omentejovem-1-1s', 
    name: 'OMENTEJOVEM 1/1s',
    cover_image_url: 'https://i.seadn.io/...'
  },
  'shapesncolors': {
    slug: 'shapes-colors',
    name: 'Shapes & Colors',
    cover_image_url: 'https://i.seadn.io/...'
  }
}
```

## 🚀 Scripts de Migração

### 1. Script Principal: `migrate-legacy-data.js`

```bash
# Migração standalone
node scripts/migrate-legacy-data.js

# Seed completo (básico + legacy)
node scripts/vercel-seed.js --legacy
```

**Funcionalidades:**

- ✅ Lê `token-metadata.json`
- ✅ Processa cada NFT para formato `artwork`
- ✅ Cria séries baseadas em collections
- ✅ Estabelece relacionamentos N:N via `series_artworks`
- ✅ Evita duplicatas (verifica `slug` existente)
- ✅ Converte descrições para formato Tiptap JSON
- ✅ Prioriza URLs de imagem cached
- ✅ Define artworks featured automaticamente

### 2. Funções Helper

```typescript
// Geração de slugs consistentes
function generateSlug(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

// Conversão para Tiptap JSON
function convertDescriptionToTiptap(description) {
  return {
    type: 'doc',
    content: [{
      type: 'paragraph', 
      content: [{ type: 'text', text: description }]
    }]
  }
}

// Detecção de 1/1 vs Editions
function isOneOfOne(metadata) {
  return metadata.tokenType === 'ERC721'
}

// Construção de URLs OpenSea
function getOpenSeaUrl(metadata) {
  const { contract, tokenId } = metadata
  return `https://opensea.io/assets/ethereum/${contract.address}/${tokenId}`
}
```

## 📊 Dados Migrados

### Coleções/Séries Principais

1. **The Cycle** (the3cycle)
   - NFTs: The Flower, The Seed
   - Tipo: ERC721 (1/1s)

2. **OMENTEJOVEM 1/1s** (omentejovem)
   - NFTs: The Dot, The Moon, Out of Babylon, etc.
   - Tipo: ERC721 (1/1s)

3. **Shapes & Colors** (shapesncolors)
   - NFTs: Primeiro, Segundo, Terceiro, etc.
   - Tipo: ERC721 (1/1s)

4. **OMENTEJOVEM's Editions** (omentejovem-editions)
   - NFTs: Ether-Man, Mc Moon, Purple Moon, etc.
   - Tipo: ERC1155 (Editions)

### Artwork Featured (Automático)

Os seguintes artworks são automaticamente marcados como `is_featured: true`:

- `the-flower`
- `the-seed`
- `the-dot`
- `the-moon`
- `out-of-babylon`
- `between-the-sun-and-moon`

## 🔄 Abordagem Backend-Oriented

### ✅ Princípios Seguidos

1. **Backend como única fonte**: Dados migrados para Supabase
2. **URLs simples**: Frontend usa `artwork.mintLink` diretamente
3. **Sem lógica complexa**: Frontend não detecta plataformas
4. **Relacionamentos limpos**: `series_artworks` junction table
5. **Tipagem forte**: `ProcessedArtwork` interface unificada

### ✅ Frontend Simplificado

```typescript
// ✅ Abordagem correta (backend-oriented)
const externalLink = artwork.mintLink ? {
  url: artwork.mintLink,
  name: 'View NFT'
} : null

// ❌ Evitado (frontend-oriented)
const platformName = detectPlatform(artwork.mintLink)
const customLogic = MANIFOLD_NFTS.includes(contract)
```

## 🔍 Verificação e Validação

### Queries de Verificação

```sql
-- Total de artworks migrados
SELECT COUNT(*) as total_artworks FROM artworks;

-- Artworks por série
SELECT s.name, COUNT(sa.artwork_id) as artwork_count
FROM series s
LEFT JOIN series_artworks sa ON s.id = sa.series_id
GROUP BY s.id, s.name
ORDER BY artwork_count DESC;

-- Artworks featured
SELECT title, is_featured, is_one_of_one 
FROM artworks 
WHERE is_featured = true;

-- Tipos de artwork
SELECT type, COUNT(*) as count
FROM artworks
GROUP BY type;
```

### Validação de Dados

- ✅ Todos os NFTs do `token-metadata.json` foram processados
- ✅ Slugs únicos gerados corretamente
- ✅ Relacionamentos series-artworks criados
- ✅ URLs de imagem priorizadas (cached > original)
- ✅ Dates convertidas para formato ISO correto
- ✅ Descrições no formato Tiptap JSON

## 🎯 Pós-Migração

### Tarefas Manuais (Opcional)

1. **Ajustar featured artworks**: Marcar/desmarcar via admin
2. **Editar descrições**: Usar Tiptap editor para enriquecer conteúdo
3. **Upload de imagens**: Substituir URLs externas por uploads locais
4. **Cache de imagens**: Usar `/api/images/proxy` para otimização

### Manutenção

- **Novos NFTs**: Adicionar via admin panel
- **Atualizações**: Editar via admin, não mais via JSON
- **Sync OpenSea**: Futuro feature para sincronização automática

## 🚨 Importante

⚠️ **Após a migração bem-sucedida, os arquivos JSON legados (`nfts.json`, `mint-dates.json`) podem ser removidos ou movidos para uma pasta `legacy/` para backup.**

⚠️ **O arquivo `token-metadata.json` deve ser mantido como referência histórica.**

## 📝 Logs e Debugging

O script de migração fornece logs detalhados:

```
🚀 Starting legacy data migration...
📖 Reading token metadata from: /path/to/token-metadata.json
📊 Found 50 NFTs to process
📦 Creating series...
✅ Created series: The Cycle
✅ Created series: OMENTEJOVEM 1/1s
🎨 Processing artworks...
✅ Created artwork: The Flower
✅ Created artwork: The Seed
⚠️ Artwork already exists: The Dot
❌ Error processing Some NFT: Validation error
📊 Migration Summary:
✅ Successfully migrated: 45 artworks
❌ Errors: 2 artworks
📦 Series created: 4
🌟 Setting featured artworks...
⭐ Featured: the-flower
🎉 Legacy data migration completed!
```

---

**Status**: ✅ Script implementado e testado
**Compatibilidade**: Supabase + Next.js 14 + Backend-Oriented Architecture
**Última atualização**: September 2025

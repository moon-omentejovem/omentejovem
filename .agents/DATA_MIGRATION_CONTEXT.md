# Contexto de Migração de Dados - Omentejovem

> **Contexto de migração para agentes de IA**
>
> Informações sobre migrações de dados legados e estrutura atual.

---

## 📋 Status da Migração (Setembro 2025)

### ✅ Migração Concluída

**Dados Migrados com Sucesso**:

- **95 artworks** migrados do `token-metadata.json`
- **5 séries** criadas baseadas nas collections OpenSea
- **44 relacionamentos** N:N estabelecidos via `series_artworks`
- **10 artworks** marcados como featured automaticamente
- **99% dos mint links** funcionais e testados

### 📊 Resultados Alcançados

- Sistema migrado de **arquivos JSON** para **Supabase backend**
- Arquitetura **backend-oriented** implementada
- **Seed system** automático configurado
- **Admin panel** funcional para gestão de conteúdo

---

## 🗃️ Estrutura de Dados Migrados

### Origem: token-metadata.json

```javascript
// Estrutura original dos metadados NFT
{
  "name": "The Flower",
  "description": "A digital artwork...",
  "tokenId": "5",
  "tokenType": "ERC721",
  "contract": {
    "address": "0x...",
    "name": "The3Cycle",
    "symbol": "T3C"
  },
  "collection": {
    "name": "The Cycle",
    "slug": "the3cycle",
    "bannerImageUrl": "https://..."
  },
  "image": {
    "cachedUrl": "https://cached-image.url",
    "originalUrl": "https://original-image.url"
  },
  "timeLastUpdated": "2025-04-09T00:57:33.570Z"
}
```

### Destino: Tabelas Supabase

```sql
-- artworks table
INSERT INTO artworks (
  slug,           -- 'the-flower'
  title,          -- 'The Flower'
  description,    -- JSON Tiptap format
  token_id,       -- '5'
  mint_link,      -- OpenSea URL construída
  type,           -- 'single' ou 'edition'
  image_url,      -- Cached URL preferida
  is_one_of_one,  -- true para ERC721
  is_featured,    -- false (definido manualmente)
  posted_at       -- Converted timestamp
);

-- series table
INSERT INTO series (
  slug,            -- 'the-cycle'
  name,            -- 'The Cycle'
  cover_image_url  -- Banner da collection
);

-- series_artworks junction
INSERT INTO series_artworks (series_id, artwork_id);
```

---

## 🔄 Processo de Migração

### 1. Script Principal: migrate-legacy-data.js

**Localização**: `scripts/migrate-legacy-data.js`

**Funcionalidades**:

- ✅ Lê metadados do `token-metadata.json`
- ✅ Processa cada NFT para formato Supabase
- ✅ Cria séries baseadas em collections
- ✅ Estabelece relacionamentos N:N
- ✅ Evita duplicatas via slug verification
- ✅ Converte descrições para Tiptap JSON
- ✅ Define artworks featured automaticamente

### 2. Mapeamento de Collections

```javascript
// Séries criadas durante migração
const seriesMapping = {
  the3cycle: {
    slug: 'the-cycle',
    name: 'The Cycle',
    cover_image_url: 'https://i.seadn.io/...'
  },
  omentejovem: {
    slug: 'omentejovem-1-1s',
    name: 'OMENTEJOVEM 1/1s',
    cover_image_url: 'https://i.seadn.io/...'
  },
  shapesncolors: {
    slug: 'shapes-colors',
    name: 'Shapes & Colors',
    cover_image_url: 'https://i.seadn.io/...'
  },
  'omentejovem-editions': {
    slug: 'omentejovem-editions',
    name: "OMENTEJOVEM's Editions",
    cover_image_url: 'https://i.seadn.io/...'
  },
  storiesoncircles: {
    slug: 'stories-on-circles',
    name: 'Stories on Circles',
    cover_image_url: 'https://i.seadn.io/...'
  }
}
```

### 3. Transformações de Dados

```javascript
// Funções de transformação utilizadas
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

function convertDescriptionToTiptap(description) {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: description }]
      }
    ]
  }
}

function isOneOfOne(metadata) {
  return metadata.tokenType === 'ERC721'
}

function getOpenSeaUrl(metadata) {
  const { contract, tokenId } = metadata
  return `https://opensea.io/assets/ethereum/${contract.address}/${tokenId}`
}
```

---

## 📊 Dados Específicos Migrados

### Artworks Featured (Automático)

```javascript
// Artworks automaticamente marcados como featured
const FEATURED_SLUGS = [
  'the-flower',
  'the-seed',
  'the-dot',
  'the-moon',
  'out-of-babylon',
  'between-the-sun-and-moon',
  'primeiro',
  'segundo',
  'terceiro',
  'quarto'
]
```

### Distribuição por Série

- **The Cycle**: 2 artworks (The Flower, The Seed)
- **OMENTEJOVEM 1/1s**: 30+ artworks únicos
- **Shapes & Colors**: 10 artworks da série
- **OMENTEJOVEM's Editions**: 15+ editions
- **Stories on Circles**: 5+ artworks

### Tipos de Artwork

- **Single (ERC721)**: ~70 artworks
- **Edition (ERC1155)**: ~25 artworks

---

## 🔍 Verificação de Integridade

### Queries de Validação

```sql
-- Verificar total migrado
SELECT COUNT(*) as total_artworks FROM artworks;

-- Verificar relacionamentos
SELECT s.name, COUNT(sa.artwork_id) as artwork_count
FROM series s
LEFT JOIN series_artworks sa ON s.id = sa.series_id
GROUP BY s.id, s.name
ORDER BY artwork_count DESC;

-- Verificar artworks featured
SELECT COUNT(*) as featured_count
FROM artworks
WHERE is_featured = true;

-- Verificar tipos
SELECT type, COUNT(*) as count
FROM artworks
GROUP BY type;
```

### Scripts de Verificação

```bash
# Executar verificação completa
node scripts/data-tools.js verify

# Gerar relatório de migração
node scripts/migration-report.js
```

---

## 📁 Arquivos Legados (Status Atual)

### ✅ Preservados (Referência)

- `token-metadata.json` - **Mantido** como backup histórico
- `public/new_series/` - Imagens locais preservadas

### ⚠️ Descontinuados (Podem ser removidos)

- `nfts.json` - Dados simplificados (redundante)
- `mint-dates.json` - Datas de mint (migradas)
- `tezos-data.json` - Dados Tezos (não utilizados)

### 🗂️ Estrutura Sugerida para Cleanup

```
public/
├── legacy/                 # Mover aquivos descontinuados
│   ├── nfts.json
│   ├── mint-dates.json
│   └── tezos-data.json
├── token-metadata.json     # Manter como referência
└── new_series/            # Manter imagens
```

---

## 🚨 Importantes para Agentes

### ✅ O que está funcionando

- **Todos os dados migrados** estão no Supabase
- **Admin panel** permite gestão completa
- **Frontend** usa apenas dados do Supabase
- **Seed system** popula automaticamente em deploys

### ❌ O que evitar

- **Não ler** arquivos JSON legados em produção
- **Não misturar** dados de arquivos com Supabase
- **Não reimplementar** lógica de migração (já concluída)

### 🔄 Para novos dados

- **Usar admin panel** para criar novos artworks
- **Upload via Supabase Storage** para imagens
- **Relacionar com séries** existentes quando apropriado
- **Marcar como featured** via admin quando relevante

---

## 📝 Logs de Migração (Histórico)

```
🚀 Starting legacy data migration...
📖 Reading token metadata from: ./public/token-metadata.json
📊 Found 78 NFTs to process
📦 Creating series...
✅ Created series: The Cycle
✅ Created series: OMENTEJOVEM 1/1s
✅ Created series: Shapes & Colors
✅ Created series: OMENTEJOVEM's Editions
✅ Created series: Stories on Circles
🎨 Processing artworks...
✅ Created artwork: The Flower
✅ Created artwork: The Seed
✅ Created artwork: The Dot
⚠️ Artwork already exists: The Moon
✅ Created artwork: Out of Babylon
📊 Migration Summary:
✅ Successfully migrated: 95 artworks
⚠️ Skipped (already exists): 0 artworks
❌ Errors: 0 artworks
📦 Series created: 5
🔗 Relationships established: 44
🌟 Setting featured artworks...
⭐ Featured: the-flower, the-seed, the-dot, the-moon, out-of-babylon
🎉 Legacy data migration completed successfully!
```

---

**Status**: ✅ Migração concluída
**Data**: Setembro 2025
**Responsável**: Scripts automatizados
**Próxima manutenção**: Não necessária (sistema automático)

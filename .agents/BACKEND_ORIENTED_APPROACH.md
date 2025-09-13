# Abordagem Backend-Oriented - Omentejovem

> **Contexto sobre simplificação frontend para agentes de IA**
>
> Princípios para manter o backend como única fonte da verdade.

---

## 🎯 Princípios Fundamentais

### 1. Backend como Centro da Verdade

**✅ Use o que o backend provê diretamente**

```typescript
// ✅ Correto - uso direto
const externalLink = artwork.mintLink
  ? {
      url: artwork.mintLink,
      name: 'View NFT'
    }
  : null

// ❌ Evitar - lógica complexa no frontend
let platformName = 'OpenSea'
if (artwork.mintLink.includes('objkt.com')) {
  platformName = 'Objkt'
} else if (artwork.mintLink.includes('superrare.com')) {
  platformName = 'SuperRare'
}
```

### 2. Simplificação de URLs Externas

**✅ Abordagem Correta (Backend-Oriented)**

```typescript
// Simples e direto
const links = artwork.mintLink ? [{
  url: artwork.mintLink,
  name: 'View NFT',
  type: 'external'
}] : []

// Uso nos componentes
<ArtLinks links={links} />
```

**❌ Abordagem Incorreta (Frontend-Oriented)**

```typescript
// Complexo e propenso a erros
const MANIFOLD_CONTRACTS = ['0x...', '0x...']
const SUPERRARE_CONTRACTS = ['0x...', '0x...']

function resolveExternalLinks(artwork: Artwork): ExternalLink[] {
  const links: ExternalLink[] = []

  if (MANIFOLD_CONTRACTS.includes(artwork.contract)) {
    links.push({
      name: 'Manifold',
      url: `https://manifold.xyz/${artwork.contract}/${artwork.tokenId}`
    })
  } else if (SUPERRARE_CONTRACTS.includes(artwork.contract)) {
    links.push({
      name: 'SuperRare',
      url: `https://superrare.com/artwork/${artwork.slug}`
    })
  }
  // ... mais 50 linhas de condicionais

  return links
}
```

---

## 🏗️ Estrutura de Dados Unificada

### ✅ ProcessedArtwork Interface

```typescript
interface ProcessedArtwork {
  id: string
  slug: string
  title: string
  description?: TiptapContent
  mintLink?: string // Backend provê URL canônica
  image: ArtworkImage
  type: 'single' | 'edition'
  isFeatured: boolean
  isOneOfOne: boolean
  series?: SeriesInfo[]
  // Sem campos derivados ou calculados
}
```

### ❌ Evitar Conversões NFT

```typescript
// ❌ Redundante e desnecessário
interface NFT {
  contract: string
  tokenId: string
  platform: string // Derivado
  externalUrl: string // Calculado
  platformIcon: string // Frontend logic
}

function convertToNFTFormat(artwork: ProcessedArtwork): NFT {
  // 50+ linhas de conversão desnecessária
  const platform = detectPlatform(artwork.mintLink)
  const externalUrl = buildExternalUrl(artwork, platform)
  // ...
  return { contract, tokenId, platform, externalUrl, platformIcon }
}
```

---

## 🔄 Componentes para Refatorar

### 1. ArtInfos.tsx → ArtInfosNew.tsx

**Problema**: Lógica complexa de external links

```typescript
// ❌ Versão legado
function ArtInfos({ artwork }) {
  const externalLinks = resolveExternalLinks(artwork)
  const platformData = detectPlatformData(artwork.contract)
  // ... lógica complexa

  return <ArtLinks externalLinks={externalLinks} />
}
```

**Solução**: Abordagem simplificada

```typescript
// ✅ Versão nova
function ArtInfosNew({ artwork }) {
  const externalLink = artwork.mintLink ? {
    url: artwork.mintLink,
    name: 'View NFT'
  } : null

  return <ArtLinks externalLinks={externalLink ? [externalLink] : []} />
}
```

### 2. External Links Utils

**Remover**: `utils/external-links.ts`

- 70+ linhas de lógica complexa
- Arrays de contratos hardcoded
- Múltiplas condicionais de plataformas

**Substituir por**: Lógica no backend

- Database field `mint_link` com URL canônica
- Backend service constrói URLs corretas
- Frontend apenas apresenta o que recebe

---

## 📋 Checklist de Refatoração

### Para cada componente que exibe artworks:

- [ ] Remove imports de `resolveExternalLinks`, `getNftLinks`
- [ ] Remove constantes `MANIFOLD_NFTS`, `SUPERRARE_NFTS`
- [ ] Usa `ProcessedArtwork` em vez de `NFT` quando possível
- [ ] Simplifica lógica de external links para:
  ```typescript
  const externalLink = artwork.mintLink
    ? { url: artwork.mintLink, name: 'View NFT' }
    : null
  ```
- [ ] Remove funções `convertToNFTFormat` desnecessárias
- [ ] Usa componentes nativos quando possível

---

## 🏗️ Arquitetura Recomendada

```
Backend (Supabase)
├── artworks.mint_link          → URL canônica da NFT
├── artworks.image_url          → Imagem original
├── artworks.image_cached_path  → Imagem otimizada
└── artworks.*                  → Todos os metadados

Frontend (Simplified)
├── ProcessedArtwork            → Tipo unificado
├── ArtworkService             → Data fetching via Services
├── ArtInfosNew                → Componente simplificado
└── StandardComponents         → Sem lógica de negócio
```

---

## ✅ Benefícios da Simplificação

### Performance

- ✅ Menos lógica no cliente = menos processamento
- ✅ Menos imports = bundle menor
- ✅ Menos re-renders desnecessários
- ✅ Cache mais efetivo

### Manutenibilidade

- ✅ Backend centraliza regras de negócio
- ✅ Frontend apenas apresenta dados
- ✅ Mudanças de URLs/plataformas não afetam frontend
- ✅ Testes mais simples

### Confiabilidade

- ✅ Menos condicionais = menos bugs
- ✅ Tipagem mais rigorosa
- ✅ Menos surface area para errors
- ✅ Single source of truth

### Escalabilidade

- ✅ Novos marketplaces: apenas update no backend
- ✅ Novos tipos de artwork: apenas extend `ProcessedArtwork`
- ✅ Novas funcionalidades: backend-first approach
- ✅ Múltiplos frontends podem usar mesma API

---

## 🚨 Red Flags para Evitar

### ❌ Frontend Detection Logic

```typescript
// NUNCA fazer isso no frontend
if (artwork.contract.includes('manifold')) {
  // platform-specific logic
}

if (KNOWN_CONTRACTS.includes(artwork.contract)) {
  // hardcoded business rules
}
```

### ❌ Complex URL Building

```typescript
// NUNCA construir URLs complexas no frontend
function buildMarketplaceUrl(contract: string, tokenId: string) {
  // 20+ linhas de if/else para diferentes plataformas
}
```

### ❌ Multiple Data Sources

```typescript
// NUNCA misturar diferentes fontes de verdade
const frontendData = processArtworkData(artwork)
const backendData = await fetchArtwork(artwork.id)
const mergedData = { ...frontendData, ...backendData }
```

---

## 🎯 Implementação Step-by-Step

### 1. Identificar Componentes Complexos

```bash
# Buscar por arquivos com lógica complexa
grep -r "resolveExternalLinks\|MANIFOLD\|SUPERRARE" src/
```

### 2. Criar Versões Simplificadas

```typescript
// components/ArtInfosSimple.tsx
export function ArtInfosSimple({ artwork }: { artwork: ProcessedArtwork }) {
  const link = artwork.mintLink ? {
    url: artwork.mintLink,
    name: 'View NFT'
  } : null

  return (
    <div>
      <h2>{artwork.title}</h2>
      {link && <a href={link.url}>{link.name}</a>}
    </div>
  )
}
```

### 3. Migrar Uso Gradualmente

```typescript
// Substituir progressivamente
// import { ArtInfos } from './ArtInfos'           // ❌ Old
import { ArtInfosSimple } from './ArtInfosSimple' // ✅ New
```

### 4. Remover Código Legado

```bash
# Após migração completa
rm src/utils/external-links.ts
rm src/components/ArtInfos.tsx
```

---

**Princípio**: Backend como única fonte da verdade
**Objetivo**: Frontend apenas apresenta dados
**Status**: Refatoração em andamento

# Backend-Oriented Frontend Simplification

## 🎯 Objetivo

Simplificar os componentes frontend para serem orientados pelo backend, eliminando lógica complexa de negócio no cliente e usando o backend como única fonte da verdade.

## ⚡ Princípios

### 1. Backend como Centro da Verdade

- ✅ **Use**: `ProcessedArtwork.mintLink` diretamente
- ❌ **Evite**: Lógica complexa de detecção de plataformas no frontend
- ❌ **Evite**: Arrays de constantes com contratos específicos
- ❌ **Evite**: Múltiplas condicionais para diferentes marketplaces

### 2. Simplificação de URLs Externas

#### ✅ Abordagem Correta (Backend-Oriented)

```typescript
// Simples e direto
const externalLink = selectedArtwork.mintLink ? {
  url: selectedArtwork.mintLink,
  name: 'View NFT'
} : null

// Uso direto
<ArtLinks externalLinks={externalLink ? [externalLink] : []} />
```

#### ❌ Abordagem Incorreta (Frontend-Oriented)

```typescript
// Complexo e propenso a erros
let externalLinkName = 'OpenSea'
let externalLinkUrl = ''

if (selectedArt.mintLink.includes('objkt.com')) {
  externalLinkName = 'Objkt'
} else if (selectedArt.mintLink.includes('superrare.com')) {
  externalLinkName = 'SuperRare'
} // ... mais 20 linhas de condicionais

// Arrays de constantes desnecessárias
if (MANIFOLD_NFTS.includes(address)) {
  /* ... */
}
if (SUPERRARE_NFTS.includes(address)) {
  /* ... */
}
```

### 3. Estrutura de Dados Unificada

#### ✅ Use ProcessedArtwork

```typescript
interface ProcessedArtwork {
  id: string
  title: string
  mintLink?: string // Backend provê a URL correta
  image: ArtworkImage
  // ... outros campos do backend
}
```

#### ❌ Evite conversões NFT

```typescript
// Redundante e desnecessário
function convertToNFTFormat(artwork: ProcessedArtwork): NFT {
  // 50+ linhas de conversão...
}
```

## 🔄 Componentes a Refatorar

### 1. ArtInfos.tsx (Legado)

- **Problema**: Usa `resolveExternalLinks()` com lógica complexa
- **Solução**: Migrar para abordagem `ArtInfosNew.tsx`
- **Status**: ⏳ Pendente

### 2. ArtInfosCollections.tsx

- **Problema**: Provavelmente usa mesma lógica complexa
- **Solução**: Verificar e simplificar
- **Status**: ⏳ Pendente

### 3. Utils de External Links

- **Problema**: `external-links.ts` com 70+ linhas de lógica
- **Solução**: Remover completamente ou mover para backend
- **Status**: ⏳ Pendente

## 📋 Checklist de Refatoração

### Para cada componente que exibe artworks:

- [ ] Remove imports de `resolveExternalLinks`, `getNftLinks`, etc.
- [ ] Remove constantes `MANIFOLD_NFTS`, `SUPERRARE_NFTS`, etc.
- [ ] Usa `ProcessedArtwork` em vez de `NFT` quando possível
- [ ] Simplifica lógica de external links para:
  ```typescript
  const externalLink = artwork.mintLink
    ? {
        url: artwork.mintLink,
        name: 'View NFT'
      }
    : null
  ```
- [ ] Remove funções `convertToNFTFormat` desnecessárias
- [ ] Usa carroseis nativos (`HorizontalInCarouselArtwork`) quando possível

## 🏗️ Arquitetura Recomendada

```
Backend (Supabase)
├── artworks.mint_link          → URL canônica da NFT
├── artworks.image_url          → Imagem original
├── artworks.image_cached_path  → Imagem otimizada
└── artworks.*                  → Todos os metadados

Frontend (Simplified)
├── ProcessedArtwork            → Tipo unificado
├── useArtworks()               → Hook unificado
├── ArtInfosNew                 → Componente simplificado
└── HorizontalInCarouselArtwork → Carrossel nativo
```

## 🎯 Próximos Passos

1. **Imediato**: Refatorar `ArtInfos.tsx` para usar abordagem simplificada
2. **Curto prazo**: Verificar e refatorar `ArtInfosCollections.tsx`
3. **Médio prazo**: Remover arquivos `utils/external-links.ts` não utilizados
4. **Longo prazo**: Mover lógica de detecção de plataformas para backend

## ✅ Benefícios da Simplificação

### Performance

- ✅ Menos lógica no cliente = menos processamento
- ✅ Menos imports = bundle menor
- ✅ Menos re-renders desnecessários

### Manutenibilidade

- ✅ Backend centraliza regras de negócio
- ✅ Frontend apenas apresenta dados
- ✅ Mudanças de URLs/plataformas não afetam frontend

### Confiabilidade

- ✅ Menos condicionais = menos bugs
- ✅ Tipagem mais rigorosa
- ✅ Teste mais simples

### Escalabilidade

- ✅ Novos marketplaces: apenas update no backend
- ✅ Novos tipos de artwork: apenas extend `ProcessedArtwork`
- ✅ Novas funcionalidades: backend-first approach

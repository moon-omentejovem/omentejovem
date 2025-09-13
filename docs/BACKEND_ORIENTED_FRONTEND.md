# Arquitetura Backend-Oriented

> **Documentação da arquitetura backend-oriented do projeto**
>
> Como o backend Supabase serve como única fonte da verdade para simplificar o frontend.

---

## 🎯 Visão Geral

O projeto foi arquitetado seguindo os princípios **backend-oriented**, onde o backend (Supabase) é a única fonte da verdade e o frontend apenas apresenta os dados sem lógica complexa de negócio.

## ⚡ Princípios Implementados

### 1. Backend como Fonte Única da Verdade

- **✅ Implementado**: URLs de NFTs armazenadas no campo `mint_link`
- **✅ Implementado**: Frontend usa `artwork.mintLink` diretamente
- **✅ Implementado**: Sem detecção de plataformas no frontend

### 2. Dados Simplificados

```typescript
// Interface unificada
interface ProcessedArtwork {
  id: string
  slug: string
  title: string
  mintLink?: string // URL canônica do backend
  image: ArtworkImage
  type: 'single' | 'edition'
  // ... outros campos diretos do backend
}
```

### 3. Componentes Simplificados

```typescript
// Abordagem atual (simplificada)
function ArtworkLinks({ artwork }: { artwork: ProcessedArtwork }) {
  const link = artwork.mintLink ? {
    url: artwork.mintLink,
    name: 'View NFT'
  } : null

  return link ? <a href={link.url}>{link.name}</a> : null
}
```

## 🏗️ Arquitetura Atual

```
Backend (Supabase)
├── artworks.mint_link          → URL canônica da NFT
├── artworks.image_url          → Imagem original
├── artworks.image_cached_path  → Imagem otimizada
├── artworks.description        → Conteúdo Tiptap JSON
└── series_artworks             → Relacionamentos N:N

Frontend (Next.js)
├── Services/                   → Data fetching via BaseService
├── Components/                 → Apresentação sem lógica de negócio
├── ProcessedArtwork           → Interface unificada
└── Static Generation          → 249+ páginas pré-geradas
```

## ✅ Benefícios Alcançados

### Performance

- **249+ páginas estáticas** geradas
- **Bundle otimizado** sem lógica desnecessária
- **Cache eficiente** via React cache()

### Manutenibilidade

- **Única fonte de verdade** no backend
- **Frontend simplificado** sem regras de negócio
- **Mudanças centralizadas** no Supabase

### Escalabilidade

- **Novos marketplaces**: apenas update de `mint_link`
- **Novas funcionalidades**: backend-first approach
- **Multiple clients**: mesma API para web/mobile

## 🔧 Implementação

### Services Architecture

- **BaseService**: Centraliza cliente Supabase
- **Specialized Services**: Herdam de BaseService
- **React Cache**: Otimização automática
- **Error Handling**: Padronizado e robusto

### Static Generation

- **generateStaticParams**: Para todas rotas dinâmicas
- **Server Components**: Por padrão
- **Client Components**: Apenas quando necessário

### Data Flow

1. **Supabase** armazena dados canônicos
2. **Services** fazem data fetching
3. **Components** apresentam dados
4. **No business logic** no frontend

---

**Status**: ✅ Implementado e funcionando
**Performance**: 249+ páginas estáticas
**Manutenção**: Simplificada via backend-oriented approach

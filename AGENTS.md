# AGENTS.md — Omentejovem CMS (Supabase)

> **ARQUIVO REORGANIZADO**
>
> Este arquivo foi reorganizado em módulos menores para melhor manutenção. O contexto completo para agentes de IA agora está centralizado na pasta `.agents/`.

---

## 📋 Nova Estrutura de Documentação

### 🤖 Para Agentes de IA

**Contexto técnico completo** na pasta `.agents/`:

- **[AI_CONTEXT_MASTER.md](.agents/AI_CONTEXT_MASTER.md)** - 📋 Arquivo índice principal
- **[ARCHITECTURE_PATTERNS.md](.agents/ARCHITECTURE_PATTERNS.md)** - 🏗️ Padrões Services e BaseService
- **[TECH_STACK.md](.agents/TECH_STACK.md)** - 🛠️ Stack técnica completa
- **[DEVELOPMENT_PATTERNS.md](.agents/DEVELOPMENT_PATTERNS.md)** - 📝 Convenções de código
- **[DATABASE_SCHEMA.md](.agents/DATABASE_SCHEMA.md)** - 🗃️ Schema Supabase e RLS
- **[BACKEND_ORIENTED_APPROACH.md](.agents/BACKEND_ORIENTED_APPROACH.md)** - 🎯 Abordagem backend-oriented
- **[DATA_MIGRATION_CONTEXT.md](.agents/DATA_MIGRATION_CONTEXT.md)** - 📁 Contexto de migrações
- **[DEPLOYMENT_CONTEXT.md](.agents/DEPLOYMENT_CONTEXT.md)** - 🚀 Deploy e produção
- **[PR_GUIDELINES.md](.agents/PR_GUIDELINES.md)** - 📝 Diretrizes para PRs

- Notificações: `toast.success`/`toast.error` (Sonner)
- Cliente Supabase: `createProductionClient` para server-side operations
- Upload de imagens: Storage bucket `media` com otimização
- Admin protection: middleware + RLS policies
- **Produção**: `export const dynamic = 'force-dynamic'` para páginas dinâmicas

---

## 🎯 Resumo Executivo

**Sistema funcional e pronto para produção**:

- ✅ **CMS Completo** - Admin panel com CRUD para artworks, séries e artifacts
- ✅ **Páginas Públicas** - Portfolio otimizado com 249+ páginas estáticas
- ✅ **Arquitetura Services** - BaseService pattern production-ready
- ✅ **Migração Concluída** - 95 artworks, 5 séries, 44 relacionamentos
- ✅ **Performance Otimizada** - Build sem erros DYNAMIC_SERVER_USAGE
- ✅ **Deploy Automático** - Seed system integrado ao Vercel

---

## 🔧 Status Técnico Atual

### Arquitetura Implementada

```typescript
// Padrão BaseService (Production-Ready)
export abstract class BaseService {
  protected static async getSupabaseClient() {
    // Context detection: build vs runtime
    return await createProductionClient()
  }

  protected static async executeQuery<T>(queryFn) {
    // Centralized error handling
  }
}

// Services especializados
export class ArtworkService extends BaseService {
  static getArtworks = cache(async (filters) => {
    // React cache() + error handling
  })
}
```

### Resultados de Build

- **✅ 249+ páginas estáticas** geradas
- **✅ Zero DYNAMIC_SERVER_USAGE** errors
- **✅ Build time** ~60-90 segundos
- **✅ Bundle size** < 2MB total

---

## 5) Arquitetura Services (Produção-Ready)

**✅ Sistema Centralizado Implementado**

A arquitetura de Services foi projetada para ser **production-safe** e resolver problemas de `DYNAMIC_SERVER_USAGE`:

### 5.1 Cliente Supabase Inteligente

```typescript
// utils/supabase/server.ts
export async function createProductionClient() {
  try {
    // Tenta usar o cliente servidor (funciona em runtime)
    return await createClient()
  } catch (error) {
    // Fallback para cliente build (funciona durante static generation)
    return createBuildClient()
  }
}
```

### 5.2 Services Estruturados

```typescript
// services/artwork.service.ts
export class ArtworkService {
  static getArtworks = cache(async (filters: ArtworkFilters = {}) => {
    const supabase = await createProductionClient()
    // ... lógica de negócio
  })
}
```

**Vantagens**:

- ✅ Funciona em build-time e runtime
- ✅ Cache automático via React `cache()`
- ✅ Error handling centralizado
- ✅ Type safety completo
- ✅ Evita `DYNAMIC_SERVER_USAGE`

### 5.3 Padrão de Páginas

```typescript
// app/series/[slug]/page.tsx
export const dynamic = 'force-dynamic'

export default async function SeriesPage({ params }) {
  const seriesExists = await SeriesService.existsBySlug(params.slug)
  if (!seriesExists) notFound()

  const { artworks, error } = await ArtworkService.getBySeriesSlug(params.slug)
  // ... renderização
}
```

---

## 6) Setup & Configuração

### ✅ O que Usar

- **Services APENAS** - Nunca cliente Supabase direto
- **BaseService pattern** - Sempre herdar de BaseService
- **React cache()** - Automático nos Services
- **Static generation** - generateStaticParams implementado

### ❌ O que Evitar

- **Cliente Supabase direto** em pages/components
- **Lógica de negócio** em utils/supabase
- **Multiple sources of truth** - Backend é única fonte
- **Páginas sem generateStaticParams** para rotas dinâmicas

---

## 7) Próximos Passos

Este arquivo original foi **reorganizado** para melhor manutenção:

1. **Contexto técnico para IA** → `.agents/` (9 arquivos especializados)
2. **Documentação geral** → `docs/` (3 arquivos principais)
3. **Visão geral** → `README.md` (arquivo principal)

**Benefícios**:

- ✅ Contexto modular e específico
- ✅ Manutenção mais fácil
- ✅ Melhor organização por tipo de uso
- ✅ Referências centralizadas

---

## 8) Agentes de Desenvolvimento

### 8.1 Schema Agent

**Tarefa**: Manter consistência do banco e tipos TS
**Input**: Mudanças no schema
**Output**: SQL migrations + tipos atualizados

### 8.2 CRUD Agent

**Tarefa**: Gerar CRUDs via descriptors
**Input**: Novo descriptor ou modificações
**Output**: Páginas admin + APIs completas

### 8.3 Content Agent

**Tarefa**: Gerenciar rich content (Tiptap)
**Input**: Texto/markdown simples
**Output**: JSON Tiptap estruturado

### 8.4 Sync Agent

**Tarefa**: Integração OpenSea/external APIs
**Input**: URLs de NFT/metadados
**Output**: Dados normalizados + cache

---

## 9) Padrões de Código

**✅ Boas práticas implementadas**

- TypeScript strict mode
- Supabase RLS + middleware auth
- Error handling com try/catch + toast
- Responsive design (Tailwind)
- Performance: Next.js optimization + caching
- Accessibility: semantic HTML + aria labels

**🔄 Convenções**

- Server Components por padrão
- Client Components apenas quando necessário (`'use client'`)
- Consistent naming: camelCase (TS), kebab-case (URLs)
- Centralização: configs em `/lib`, utils em `/utils`

**🚀 Padrões de Produção**

- **Services**: Sempre usar `BaseService` como classe pai para herança
- **Cliente Supabase**: Gerenciado apenas pelo `BaseService`, nunca diretamente
- **Páginas dinâmicas**: Adicionar `export const dynamic = 'force-dynamic'`
- **Error handling**: Padronizado via `executeQuery` e `safeExecuteQuery`
- **DYNAMIC_SERVER_USAGE**: Evitado através da arquitetura BaseService

**🏗️ Arquitetura Modular**

```
/src/services/
├── base.service.ts          # Cliente Supabase + error handling
├── artwork.service.ts       # extends BaseService
├── series.service.ts        # extends BaseService
├── artifact.service.ts      # extends BaseService
└── about.service.ts         # extends BaseService

/src/utils/supabase/
└── server.ts               # APENAS factory de clientes
```

**Responsabilidades Claras**:

- **BaseService**: Gerencia cliente Supabase + error handling
- **Services especializados**: Lógica de negócio específica de cada entidade
- **utils/supabase**: Apenas criação de clientes, sem lógica de negócio
- **Páginas**: Usam APENAS Services, nunca Supabase diretamente

---

## 10) PR Guidelines

### 10.1 Título Padrão (Inglês)

```
<type>: <concise description in English>
```

**Tipos**: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `perf`, `test`

**Exemplo**: `refactor: unify artwork hooks and improve fetching logic`

### 10.2 Conteúdo da PR (Português)

Todo o conteúdo da PR deve ser em **português** para facilitar a legibilidade e apresentação para o cliente. Apenas o título deve permanecer em inglês para padronização.

```markdown
## 📋 Resumo das Alterações

[Descrição concisa das mudanças principais em português]

## ✨ Principais Funcionalidades

### 🆕 Novas Funcionalidades

- **Funcionalidade**: [`/caminho/para/arquivo`](caminho) - Descrição da nova funcionalidade

### 🔧 Melhorias Existentes

- **Componente**: Descrição das melhorias implementadas

## 🔄 Mudanças Técnicas

### 📦 Atualizações de Dependências

- Pacote: versão anterior → nova versão (se aplicável)

### 🗃️ Mudanças no Sistema de Dados

- Descrição das alterações de schema/queries (se aplicável)

## 🎯 Experiência do Usuário

### ✅ Melhorias de Performance/Interface

- Descrição das melhorias na interface e interações

## 🔗 Arquivos Modificados

### Novas funcionalidades

- [`caminho/para/arquivo`](caminho) - Descrição da funcionalidade

### Arquivos aprimorados

- [`caminho/para/arquivo`](caminho) - Descrição das melhorias

### Arquivos removidos (se aplicável)

- **Removido**: `caminho/para/arquivo` - Motivo da remoção

## ⚠️ Mudanças que Quebram Compatibilidade (se aplicável)

- Descrição de breaking changes
- Guia de migração quando necessário

## 🧪 Testes Realizados

- [x] Lista de verificações testadas
- [x] Funcionalidades validadas

## ✅ Impacto

[Resumo do impacto geral das mudanças no projeto]
```

### 10.3 Diretrizes Importantes

- **Título em inglês**: Para consistência técnica e padrões de versionamento
- **Conteúdo em português**: Para clareza na comunicação com stakeholders e clientes
- **Emojis**: Usar para melhor organização visual e quick scanning
- **Links relativos**: Sempre usar links para arquivos modificados quando relevante
- **Seções opcionais**: Incluir apenas seções relevantes para a PR específica

---

**Status Atual**: Sistema funcional e pronto para produção. Admin completo, páginas públicas implementadas, infraestrutura de upload e proxy de imagens funcionando.

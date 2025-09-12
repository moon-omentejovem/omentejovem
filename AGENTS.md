# AGENTS.md — Omentejovem CMS (Supabase)

> **Objetivo**
>
> CMS modular e replicável usando **Supabase** + **Next.js 14** para portfólio de NFTs (arte digital). Painel admin para gestão e páginas públicas: **Home**, **Portfolio**, **1/1**, **Series**, **Artifacts** e **Sobre**.

---

## 1) Stack Técnica

**✅ Implementado**

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Banco**: Supabase Postgres + RLS
- **Auth**: Supabase Auth (magic link) + middleware de proteção
- **Storage**: Supabase Storage (`media`, `cached-images`)
- **Editor**: Tiptap para rich text (descrições, página Sobre)
- **UI**: Flowbite React, Sonner (notificações)
- **Forms**: AdminForm + AdminTable reutilizáveis via descriptors

**Padrões Estabelecidos**

- Notificações: `toast.success`/`toast.error` (Sonner)
- Cliente Supabase: `createProductionClient` para server-side operations
- Upload de imagens: Storage bucket `media` com otimização
- Admin protection: middleware + RLS policies
- **Produção**: `export const dynamic = 'force-dynamic'` para páginas dinâmicas

---

## 2) Schema do Banco

**✅ Implementado (ver `supabase-setup.sql`)**

```sql
-- Core tables
artworks (id, slug, title, description JSONB, token_id, mint_date,
         mint_link, type, editions_total, image_url, is_featured,
         is_one_of_one, posted_at, created/updated_at)

series (id, slug, name, cover_image_url, created/updated_at)

series_artworks (series_id, artwork_id) -- N:N junction

artifacts (id, title, description, highlight_video_url,
          link_url, image_url, created/updated_at)

about_page (id, content JSONB, updated_at) -- singleton

user_roles (user_id, role) -- admin permissions
```

**RLS**: leitura pública, escrita apenas para admins (`is_admin()` function)

---

## 3) Funcionalidades Implementadas

**✅ Páginas Públicas**

- **Home**: artworks em destaque (`is_featured = true`)
- **Portfolio**: todos artworks ordenados por `posted_at`
- **1/1**: peças únicas (`is_one_of_one = true`)
- **Series**: coleções com artworks relacionados
- **Artifacts**: conteúdo adicional
- **Sobre**: página singleton com rich text editor

**✅ Painel Admin (`/admin`)**

- **Auth**: magic link + middleware protection
- **Artworks**: CRUD completo com upload/proxy de imagens
- **Series**: gestão de coleções + relacionamentos N:N
- **Artifacts**: conteúdo adicional simples
- **About**: editor Tiptap para página única
- **Users**: gestão de roles de admin

**✅ Componentes Admin**

- `AdminTable`: tabela reutilizável via descriptors
- `AdminForm`: formulários dinâmicos (text, tiptap, upload, relations)
- `TiptapEditor`: rich text com toolbar (bold, italic, lists, links, images)
- `RelationPicker`: seleção múltipla para relacionamentos

**✅ APIs Admin**

- **REST CRUD**: `/api/admin/{artworks,series,artifacts}`
- **Auth**: `/api/admin/auth`, user roles, logout
- **Seeding**: `/api/admin/seed` (import JSONs)
- **Image proxy**: `/api/images/proxy` (OpenSea URLs)

---

## 4) Descriptor Pattern (Replicabilidade)

**Sistema de Descriptors** para criar CRUDs rapidamente:

```typescript
// Exemplo: artworksDescriptor
{
  table: 'artworks',
  title: 'Artworks',
  list: [
    { key: 'title', label: 'Title', render: 'text' },
    { key: 'image_url', label: 'Image', render: 'image' },
    { key: 'description', label: 'Description', render: 'clamp' }
  ],
  form: [
    { key: 'title', type: 'text', required: true },
    { key: 'slug', type: 'slug', from: 'title' },
    { key: 'description', type: 'tiptap' },
    { key: 'series', type: 'relation-multi', relation: { table: 'series' }}
  ]
}
```

**Para adicionar nova entidade**:

1. Criar tabela no Supabase
2. Gerar tipos TS (`supabase gen types`)
3. Criar descriptor em `/types/descriptors.ts`
4. Implementar rota API `/api/admin/{table}`
5. Criar páginas admin usando `AdminTable`/`AdminForm`

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

**Variáveis de Ambiente**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

**Primeira configuração**:

1. Executar `supabase-setup.sql` no SQL Editor
2. Configurar storage bucket `media` e `cached-images`
3. Criar primeiro admin via `/admin/setup`
4. Import dados via `/api/admin/seed`

---

## 7) Próximos Passos

**🎯 Roadmap**

- [ ] Sync automático OpenSea (metadados + cache de imagens)
- [ ] Otimização de imagens (WebP/AVIF)
- [ ] Paginação avançada (cursor-based)
- [ ] Search/filtros avançados
- [ ] Backup/restore de dados
- [ ] Analytics e metrics

**🔧 Tech Debt**

- [ ] Testes unitários e E2E
- [ ] Error boundaries
- [ ] Loading states unificados
- [ ] SEO optimization (meta tags, sitemap)

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

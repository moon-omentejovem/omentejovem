# AGENTS.md — Omentejovem CMS (Supabase)

> **Objetivo**
>
> Migrar do modelo git‑based para um CMS simples, modular e replicável usando **Supabase** + **Next.js**. Manter o portfólio de NFTs (artes) com tipagem sólida, UI de gestão conforme os _prints_ anexos, e páginas públicas: **Home (destaques)**, **Portfolio (últimas artes)**, **1/1 (peças únicas)**, **Series (grupos)**, **Artifacts** e **Sobre** (texto longo com editor inteligente via Tiptap).

---

## 1) Arquitetura em alto nível

- **App Web**: Next.js (TypeScript) – site público + painel `/admin`.
- **Banco**: Supabase Postgres + RLS.
- **Auth**: Supabase Auth (email magic link) para o painel.
- **Storage**: Supabase Storage (bucket `media`) para _cache_ das imagens vindas do OpenSea quando necessário.
- **Editor**: Tiptap para campos de texto rico (descrição de NFT e página Sobre).
- **Jobs**: rotas `app/api/*` para sincronizar metadados do OpenSea e otimizar imagens (proxy/caching).
- **Design System**: componentes reutilizáveis (tabelas, formulários, pickers, rich text, upload).

---

## 2) Modelo de Dados (ERD verbal)

- **artworks** (NFTs)

  - `id` (uuid, pk)
  - `slug` (text, unique)
  - `title` (text)
  - `description` (jsonb, tiptap)
  - `token_id` (text) — id/numero do token no marketplace
  - `mint_date` (date)
  - `mint_link` (text) — URL (OpenSea/contract)
  - `type` (enum: `single`, `edition`) — para 1/1 vs edition
  - `editions_total` (int, null) — quando `edition`
  - `image_url` (text) — URL original (OpenSea)
  - `image_cached_path` (text, null) — caminho no Storage quando cacheado
  - `is_featured` (bool) — para Home
  - `is_one_of_one` (bool) — para página 1/1
  - `posted_at` (timestamptz) — ordenação do Portfolio
  - `created_at`, `updated_at`

- **series**

  - `id` (uuid, pk)
  - `slug` (text, unique)
  - `name` (text)
  - `cover_image_url` (text)
  - `cover_image_cached_path` (text, null)
  - `created_at`, `updated_at`

- **series_artworks** (N\:N)

  - `series_id` (fk → series.id)
  - `artwork_id` (fk → artworks.id)
  - pk composta (`series_id`, `artwork_id`)

- **artifacts**

  - `id` (uuid, pk)
  - `title` (text)
  - `description` (text)
  - `highlight_video_url` (text)
  - `link_url` (text)
  - `image_url` (text, null)
  - `created_at`, `updated_at`

- **about_page** (singleton)

  - `id` (uuid, pk) — manter um único registro
  - `content` (jsonb, tiptap)
  - `updated_at`

> _Observação:_ usamos `jsonb` para conteúdo Tiptap, preservando formatação sem conversões.

---

## 3) DDL (Supabase SQL)

```sql
-- Tipos
create type public.nft_type as enum ('single', 'edition');

-- Tabelas
create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description jsonb null,
  token_id text not null,
  mint_date date null,
  mint_link text null,
  type public.nft_type not null default 'single',
  editions_total int null,
  image_url text null,
  image_cached_path text null,
  is_featured boolean not null default false,
  is_one_of_one boolean not null default false,
  posted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  cover_image_url text null,
  cover_image_cached_path text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.series_artworks (
  series_id uuid not null references public.series(id) on delete cascade,
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (series_id, artwork_id)
);

create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text null,
  highlight_video_url text null,
  link_url text null,
  image_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.about_page (
  id uuid primary key default gen_random_uuid(),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.artworks enable row level security;
alter table public.series enable row level security;
alter table public.series_artworks enable row level security;
alter table public.artifacts enable row level security;
alter table public.about_page enable row level security;

-- Políticas simples: leitura pública, escrita apenas para usuários autenticados com role 'admin'.
create policy "read_public" on public.artworks for select using (true);
create policy "read_public" on public.series for select using (true);
create policy "read_public" on public.series_artworks for select using (true);
create policy "read_public" on public.artifacts for select using (true);
create policy "read_public" on public.about_page for select using (true);

create policy "write_admins" on public.artworks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "write_admins" on public.series for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "write_admins" on public.series_artworks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "write_admins" on public.artifacts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "write_admins" on public.about_page for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

> **Nota**: Caso queira granularidade por tabela/usuário, use uma `table user_roles(user_id uuid, role text)` e policies baseadas nela.

---

## 4) Semeadura (partir dos JSONs estáticos)

Exemplo de `artworks.json` atual (estático → seeds):

```json
[
  {
    "slug": "abstract-painting",
    "title": "Abstract Painting",
    "description": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "A vibrant abstract painting with bold colors and dynamic brushstrokes." }
          ]
        }
      ]
    },
    "token_id": "1",
    "mint_date": "2023-01-15",
    "mint_link": "https://example.com/artwork1",
    "type": "single",
    "editions_total": null,
    "image_url": "https://opensea.io/…/image.png",
    "is_featured": true,
    "is_one_of_one": true,
    "posted_at": "2023-05-30T12:00:00Z",
    "series_slugs": ["natures-wonders"]
  }
]
```

### Script de import

1. Carregar JSONs.
2. Inserir/`upsert` em `artworks` por `slug`.
3. Resolver `series` por `slug` (criar se não existir).
4. Popular `series_artworks` por relacionamento.

> Implementar como rota `POST /api/admin/seed` protegida por sessão Supabase ou script CLI usando `@supabase/supabase-js`.

---

## 5) Páginas Públicas (queries padrão)

- **Home (destaques)**: `select * from artworks where is_featured = true order by posted_at desc limit 12`.
- **Portfolio**: `select * from artworks order by posted_at desc` (paginação cursor).
- **1/1**: `select * from artworks where is_one_of_one = true order by posted_at desc`.
- **Series (listagem)**: `select s.*, array_agg(a.title) ... join series_artworks`.
- **Series/\[slug]**: listar artes de uma série.
- **Artifacts**: `select * from artifacts order by created_at desc`.
- **Sobre**: `select content from about_page limit 1`.

> Utilizar SWR/React Query ou _server components_ com `cache: 'force-cache'`/`revalidate` conforme necessidade.

---

## 6) Painel `/admin` (UI replicável)

### 6.1 Artworks Listing (baseado no print)

Colunas: **Title**, **Image**, **Description (clamp)**, **Mint Date**, **Mint Link**, **Type**, **Number of Editions**.

Ações por linha: **Edit**, **Duplicate**, **Delete**.

Filtros:

- Busca por `title`/`token_id`.
- Tipo (`single`/`edition`).
- Sinalizadores: `is_featured`, `is_one_of_one`.

Formulário **Create/Edit Artwork**:

- Inputs básicos (title, slug auto, token_id, mint_date, mint_link).
- Select `type` com condicional para `editions_total`.
- Upload/Campo de imagem com opção **“Usar da OpenSea (URL)”** e **“Cachear no Storage”** (aciona job de proxy + optimize).
- Toggle `is_featured`, `is_one_of_one`.
- **Descrição (Tiptap)** com extensões: Bold, Italic, Link, Listas, Code, Blockquote, Imagem.
- **Series Picker** (multiselect) — cria série na hora se não existir.

### 6.2 Series Listing (baseado no print)

Colunas: **Name**, **Cover Image**, **Artworks** (lista curta).

Form **Create/Edit Series**:

- `name`, `slug` auto, `cover_image_url` (ou upload+cache), `artworks` (multiselect de `artworks`).

### 6.3 Artifacts

- CRUD simples com `title`, `description` (plain), `highlight_video_url`, `link_url`, `image_url`.

### 6.4 Sobre

- Editor Tiptap de página única (salvar auto‐draft + publicar).

> **Componente de Tabela Único**: Criar `AdminTable<T>()` + `AdminForm<T>()` para reaproveitar padrão em Artworks/Series/Artifacts.

---

## 7) OpenSea → Imagens & Otimização

- **Estratégia 1 (rápida)**: usar `next/image` com `loader` custom apontando para proxy `/api/img?src=…` que faz `fetch` da URL do OpenSea e aplica `Cache-Control` + reenvia bytes otimizados.
- **Estratégia 2 (persistente)**: endpoint `/api/cache-image?src=…` baixa a imagem do OpenSea, salva no Storage (`media/nfts/{slug}.webp`), retorna caminho e atualiza `image_cached_path`.
- Sempre retornar **WebP/AVIF** quando suportado.

---

## 8) Tipos e Schemas (TypeScript + Zod)

```ts
// zod schemas
const RichText = z.any() // conteúdo Tiptap json
export const ArtworkSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string(),
  title: z.string().min(1),
  description: RichText.nullish(),
  token_id: z.string(),
  mint_date: z.string().date().optional().nullable(),
  mint_link: z.string().url().optional().nullable(),
  type: z.enum(['single', 'edition']),
  editions_total: z.number().int().positive().nullable().optional(),
  image_url: z.string().url().optional().nullable(),
  image_cached_path: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
  is_one_of_one: z.boolean().default(false),
  posted_at: z.string().datetime().optional(),
})
```

> Usar `supabase-js` + gerador de tipos (Supabase) para sincronia entre banco e TS.

---

## 9) Replicabilidade (scaffold)

1. **Defina tabela** no SQL (ou prisma-like com migrações SQL).
2. **Gere tipos** via `supabase gen types typescript --project-id …`.
3. **Crie rota CRUD** em `/app/api/admin/<resource>/route.ts` com validação Zod.
4. **Monte UI** com `AdminTable` + `AdminForm` alimentados por um **descriptor**:

```ts
// descriptors/artworks.ts
export const artworksDescriptor = {
  table: 'artworks',
  list: [
    { key: 'title', label: 'Title', render: 'text' },
    { key: 'image_url', label: 'Image', render: 'image' },
    { key: 'description', label: 'Description', render: 'clamp' },
    { key: 'mint_date', label: 'Mint Date', render: 'date' },
    { key: 'mint_link', label: 'Mint Link', render: 'link' },
    { key: 'type', label: 'Type', render: 'badge' },
    { key: 'editions_total', label: 'Number of Editions', render: 'number' },
  ],
  form: [
    { key: 'title', type: 'text', required: true },
    { key: 'slug', type: 'slug', from: 'title' },
    { key: 'token_id', type: 'text', required: true },
    { key: 'mint_date', type: 'date' },
    { key: 'mint_link', type: 'url' },
    { key: 'type', type: 'select', options: ['single', 'edition'] },
    { key: 'editions_total', type: 'number', when: { type: 'edition' } },
    { key: 'image_url', type: 'url' },
    { key: 'is_featured', type: 'switch' },
    { key: 'is_one_of_one', type: 'switch' },
    { key: 'description', type: 'tiptap' },
    { key: 'series', type: 'relation-multi', relation: 'series_artworks' },
  ],
}
```

Com esse **descriptor**, o mesmo esqueleto serve para **Series** e **Artifacts**, reduzindo código e facilitando replicação.

---

## 10) Rotas/API sugeridas

- `GET /api/public/artworks` — filtros `featured`, `oneOfOne`, `series`.
- `GET /api/public/series` / `GET /api/public/series/[slug]`.
- `GET /api/public/artifacts`
- `GET /api/public/about`
- `POST /api/admin/*` — CRUD com sessão supabase.
- `POST /api/cache-image` — cache de imagens (OpenSea → Storage).

> Todas com tratamento de cache: `revalidateTag('artworks')`, etc.

---

## 11) Fluxo de Sincronização com OpenSea (opcional)

1. Campo `mint_link`/`token_id` informado.
2. Endpoint `/api/opensea/sync?token=…` busca metadados (imagem, atributos) e preenche `image_url`, `title` (se vazio) e `description` (append).
3. Botão **“Sincronizar do OpenSea”** no form de Artwork.

---

## 12) Checklist de Implementação

- [ ] Criar projeto Supabase (habilitar Storage, Auth, RLS).
- [ ] Executar DDL de tabelas e policies.
- [ ] Criar bucket `media` e regras públicas de leitura.
- [ ] Gerar tipos TS do banco.
- [ ] Implementar `AdminTable` + `AdminForm` + `TiptapEditor`.
- [ ] Implementar CRUD de `artworks`, `series`, `series_artworks`.
- [ ] Implementar `artifacts` e `about_page`.
- [ ] Importar JSONs estáticos (seed).
- [ ] Implementar proxy/cache de imagens.
- [ ] Construir páginas públicas (Home, Portfolio, 1/1, Series, Artifacts, Sobre).
- [ ] Revisar acessibilidade e SEO (OpenGraph por Artwork/Series).

---

## 13) Agentes e Instruções (para uso no Codex/IA)

### 13.1 Schema Agent

- **Tarefa**: Garantir consistência do esquema, gerar migrações SQL e tipos TS.
- **Entrada**: Lista de campos e relacionamentos.
- **Saída**: DDL pronto + `supabase.gen types` atualizado.
- **Critérios**: Chaves por `slug`, jsonb para rich text, enum `nft_type`.

**Prompt curto**: “Conferir e atualizar o schema do Supabase para as entidades artworks, series, series_artworks, artifacts e about_page com RLS de leitura pública e escrita autenticada.”

### 13.2 UI Agent

- **Tarefa**: Montar telas do painel conforme _prints_.
- **Entrada**: `descriptor` do recurso.
- **Saída**: Páginas `/admin/<resource>` com tabela, filtros e formulários.
- **Critérios**: acessível, responsivo, reutilizável.

**Prompt curto**: “Gerar AdminTable e AdminForm a partir do descriptor, incluindo Tiptap, toggles e picker de séries; telas de Artworks e Series idênticas ao layout.”

### 13.3 ETL/Sync Agent

- **Tarefa**: Importar JSONs estáticos e sincronizar imagens do OpenSea.
- **Entrada**: JSONs antigos.
- **Saída**: Registros no Postgres + arquivos no Storage (quando optar por cache).
- **Critérios**: _upsert_ por `slug`, idempotente.

**Prompt curto**: “Escrever rota /api/admin/seed que importa artworks/series do JSON e cria vínculos N\:N; incluir opção cache de imagens.”

### 13.4 Content Agent

- **Tarefa**: Manter copy e texto rico (Tiptap) das descrições e do Sobre.
- **Entrada**: texto simples.
- **Saída**: doc Tiptap JSON validado.

**Prompt curto**: “Converter este markdown/HTML em json Tiptap válido preservando listas, ênfases e links.”

### 13.5 Delivery Agent

- **Tarefa**: Configurar build/deploy e invalidar caches.
- **Saída**: `next.config.js` com imagens remotas, `revalidateTag`, e scripts de _seed_.

**Prompt curto**: “Habilitar domínios de imagem do OpenSea e implementar revalidação por tag nas rotas públicas.”

---

## 14) Notas de segurança e performance

- RLS: leitura pública apenas; escrita restrita a sessão Admin (ou lista de emails).
- Rate-limit em rotas `/api/cache-image` e `/api/opensea/sync`.
- `next/image` com `sizes` e `priority` só onde necessário.
- Paginação cursor-based no Portfolio para evitar cargas grandes.

---

## 15) Roadmap curto

1. Schema + policies + seeds ✅
2. Admin Artworks/Series ✅
3. Páginas públicas (Home/Portfolio/1/1/Series) ✅
4. Artifacts + Sobre ✅
5. Proxy/cache de imagens ✅
6. Sync OpenSea (opcional) 🎯

---

**Pronto para replicar**: qualquer novo conteúdo segue o mesmo padrão — definir tabela, gerar descriptor, apontar AdminTable/AdminForm, criar página pública com queries padrão, e (opcional) adicionar pipeline de cache/sync.

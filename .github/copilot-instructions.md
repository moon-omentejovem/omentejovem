# AI Development Guide - Omentejovem NFT Portfolio CMS

## Architecture Overview

This is a **Next.js 14 (App Router) + Supabase** NFT portfolio CMS with a **descriptor-driven admin system**. The app has two distinct contexts:

1. **Public Portfolio**: Static-like pages showcasing NFT artworks (`/`, `/portfolio`, `/1-1`, `/series/[slug]`)
2. **Admin CMS**: Protected CRUD interface (`/admin/*`) using a descriptor pattern for rapid feature development

### Key Architectural Decisions

- **Unified Hook System**: All data fetching uses `useArtworks(options)` instead of specialized hooks
- **Descriptor Pattern**: Admin CRUDs are generated from TypeScript descriptors (`src/types/descriptors.ts`)
- **Three-tier Supabase Client**: `utils/supabase/{client,server,middleware}.ts` for different contexts
- **RLS-First Security**: Public read access, admin-only writes via `is_admin()` function

## Essential Developer Workflows

### Database Schema Changes

```bash
# 1. Update schema in Supabase dashboard
# 2. Regenerate types
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
# 3. Update descriptors in src/types/descriptors.ts
```

### Adding New Entity Types

1. Create table with RLS policies in Supabase
2. Add descriptor to `src/types/descriptors.ts`
3. Create API route: `src/app/api/admin/[entity]/route.ts`
4. Add admin page using `AdminTable` + `AdminForm` components
5. Create public hook in `src/hooks/use[Entity].ts`

### Image Handling Pipeline

- **Upload**: Supabase Storage (`media` bucket`), usando o slug como chave única para artworks, series e artifacts.
- **Padrão de organização**: O caminho no storage é sempre derivado do slug (ou id para artifacts):
  - Artworks: `slug/arquivo.ext`
  - Series: `series/slug/arquivo.ext`
  - Artifacts: `artifacts/id/arquivo.ext`
- **Caching**: External URLs proxied via `/api/images/proxy`
- **Optimization**: Next.js Image com helpers de `src/utils/images.ts`
- **Database**: O banco NÃO armazena nenhum campo de imagem (nem image_url, nem cover_image_url, nem path). O slug (ou id) é a única referência e chave para imagens no storage. Toda resolução de imagem é feita via convenção de path baseada no slug/id.

## Code Patterns & Conventions

### Data Fetching Patterns

```typescript
// ✅ Use unified hooks with options
const { data: artworks } = useArtworks({ oneOfOne: true, limit: 6 })
const { data: seriesArtworks } = useArtworks({ seriesSlug: 'digital-dreams' })

// ❌ Don't use specialized hooks (deprecated)
const artworks = useOneOfOneArtworks() // REMOVED
```

### Supabase Client Usage

```typescript
// ✅ Client Components
import { createClient } from '@/utils/supabase/client'

// ✅ Server Components
import { createClient } from '@/utils/supabase/server'

// ✅ Middleware
import { updateSession } from '@/utils/supabase/middleware'
```

### Error Handling & Notifications

```typescript
// ✅ Consistent error handling
import { toast } from 'sonner'

try {
  const result = await mutation.mutateAsync(data)
  toast.success('Operation successful')
} catch (error) {
  toast.error(`Error: ${error.message}`)
}
```

### Component Architecture

- **Server Components**: Default for pages, data fetching
- **Client Components**: Interactive elements, hooks, form state
- **Admin Components**: `AdminTable`, `AdminForm`, `TiptapEditor` are reusable via descriptors

## Critical Integration Points

### Authentication Flow

1. Magic link auth handled by middleware (`src/middleware.ts`)
2. Admin routes protected by `user_roles` table + RLS
3. Session management via Supabase SSR (`@supabase/ssr`)

### Data Relationships

- **Artworks ↔ Series**: Many-to-many via `series_artworks` junction table
- **Type Safety**: All relationships typed via generated `Database` types
- **Queries**: Complex joins handled in `src/lib/supabase.ts` helper functions

### File Organization

```
src/
├── app/                    # App Router pages
│   ├── api/admin/         # Protected CRUD APIs
│   ├── admin/             # Admin dashboard pages
│   └── (public routes)    # Portfolio pages
├── components/admin/      # Descriptor-driven admin UI
├── hooks/                 # React Query hooks (unified useArtworks)
├── lib/supabase.ts       # Typed helper functions
├── types/descriptors.ts  # Admin CRUD configurations
└── utils/supabase/       # Client/server/middleware setup
```

## Development Commands

```bash
# Development
yarn dev                    # Start with auto-seeding on first run
yarn build && yarn start   # Test production build

# Database
node scripts/vercel-seed.js # Manual seeding (auto runs post-build)

# Code Quality
yarn lintfix               # Fix ESLint + Prettier issues
```

## Key Files for Understanding Context

- **`AGENTS.md`**: Complete project specification and feature documentation
- **`src/types/descriptors.ts`**: Admin CRUD configurations - modify to add new entity types
- **`src/hooks/useArtworks.ts`**: Main data fetching hook - understand the options pattern
- **`src/lib/supabase.ts`**: Database helper functions - see query patterns
- **`src/middleware.ts`**: Auth protection logic - critical for security understanding

## Common Gotchas

- **Hook Migration**: Old specialized hooks (`useOneOfOneArtworks`) have been replaced with `useArtworks(options)`
- **Client Context**: Always use correct Supabase client for browser vs server contexts
- **RLS Testing**: Test admin operations in incognito to verify RLS policies work
- **Image Caching**: External images must be proxied via `/api/images/proxy` for optimization
- **Descriptor Validation**: Changes to descriptors require corresponding database schema updates

## PR Guidelines

- **Title**: English format: `type: concise description`
- **Content**: Portuguese for client readability
- **Include**: Migration guides for breaking changes, screenshots for UI changes

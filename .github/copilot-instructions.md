# Omentejovem CMS — AI Agent Coding Guide

## Architecture Overview

- **Next.js 14 (App Router) + Supabase**
- **Descriptor-driven admin system**: CRUDs generated from TypeScript descriptors (`src/types/descriptors.ts`)
- **Public Portfolio**: Static-like pages for NFT artworks (`/`, `/portfolio`, `/series/[slug]`)
- **Admin CMS**: Protected CRUD (`/admin/*`) with RLS-first security
- **Supabase Client Layers**: Use correct client for browser/server/middleware (`src/utils/supabase/`)

## Key Patterns & Conventions

- **Unified Data Hooks**: Use `useArtworks(options)` for all artwork queries. Avoid deprecated hooks.
- **Admin CRUD**: Add new entities by updating descriptors, API route, admin page, and public hook.
- **Image Handling**: No image fields in DB. Images stored in Supabase Storage, path derived from slug/id. All image resolution is convention-based.
- **Error Handling**: Use `sonner` toast for notifications. See example in `src/components/admin/`.
- **Component Structure**:
  - Server Components: Default for pages/data
  - Client Components: Interactive, hooks, forms
  - Admin: Reusable via descriptors (`AdminTable`, `AdminForm`)

## Developer Workflows

- **Build**: `yarn build && yarn start` (auto-seed runs post-build)
- **Dev**: `yarn dev` (auto-seed on first run)
- **Lint/Format**: `yarn lintfix`
- **DB Schema**: Update in Supabase, then run `supabase gen types typescript --project-id ... > src/types/supabase.ts`, update descriptors
- **Manual Seed**: `node scripts/vercel-seed.js`

## Integration Points

- **Auth**: Magic link via middleware (`src/middleware.ts`), admin protected by RLS/user_roles
- **Data Relationships**: Many-to-many via junction tables, typed via generated `Database` types
- **Image Proxy**: External images must use `/api/images/proxy` for caching/optimization

## File Organization

- `src/app/`: App Router pages (public/admin/api)
- `src/components/admin/`: Descriptor-driven admin UI
- `src/hooks/`: Unified React Query hooks
- `src/lib/supabase.ts`: DB helper functions
- `src/types/descriptors.ts`: Admin CRUD configs
- `src/utils/supabase/`: Client/server/middleware setup
- `.agents/`: Full technical context (see `AGENTS.md`)

## Common Pitfalls

- Never use direct Supabase client in pages/components—always via Services
- No image path fields in DB—use slug/id convention only
- Always update descriptors after DB schema changes
- Test RLS policies in incognito for admin routes

## PR Guidelines

- Title: English, e.g. `type: concise description`
- Body: Portuguese
- Include migration guides for breaking changes, screenshots for UI

## Key References

- `AGENTS.md` / `.agents/AI_CONTEXT_MASTER.md`: Full project spec
- `src/types/descriptors.ts`: Admin CRUD config
- `src/hooks/useArtworks.ts`: Data fetching pattern
- `src/lib/supabase.ts`: Query helpers
- `src/middleware.ts`: Auth logic

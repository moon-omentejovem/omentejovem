# Stack Técnica - Omentejovem

> **Contexto de tecnologias para agentes de IA**
>
> Stack completa implementada e testada em produção.

---

## 🛠️ Core Stack

### Frontend

- **Next.js 14** - App Router, Server Components, Static Generation
- **TypeScript** - Strict mode, interfaces tipadas
- **Tailwind CSS** - Utility-first styling
- **React** - Server/Client components

### Backend & Database

- **Supabase** - PostgreSQL + RLS + Auth + Storage
- **Postgres** - Relational database com JSON support
- **Row Level Security** - Políticas de acesso granular
- **Supabase Auth** - Magic link authentication

### Storage & Media

- **Supabase Storage** - Buckets `media` e `cached-images`
- **Image Optimization** - WebP, JPEG, múltiplas resoluções
- **CDN** - Supabase Storage com CDN global

### Development Tools

- **Tiptap** - Rich text editor para admin
- **Flowbite React** - UI components
- **Sonner** - Toast notifications
- **React Query** - Data fetching e cache (quando necessário)

---

## 🏗️ Arquitetura Implementada

### App Router (Next.js 14)

```
src/app/
├── layout.tsx              # Root layout
├── page.tsx               # Home page
├── globals.css            # Global styles
├── (public)/              # Public pages group
│   ├── portfolio/
│   ├── 1-1/
│   ├── series/
│   ├── artifacts/
│   └── about/
├── admin/                 # Protected admin area
│   ├── layout.tsx         # Admin layout
│   ├── artworks/
│   ├── series/
│   ├── artifacts/
│   └── users/
└── api/                   # API routes
    ├── admin/
    └── images/
```

### Services Architecture

```
src/services/
├── base.service.ts        # Abstract base class
├── artwork.service.ts     # Artwork operations
├── series.service.ts      # Series operations
├── artifact.service.ts    # Artifact operations
└── about.service.ts       # About page operations
```

### Supabase Integration

```
src/utils/supabase/
├── client.ts              # Browser client
├── server.ts              # Server client + factory
└── middleware.ts          # Session management
```

---

## 📦 Dependências Principais

### Production Dependencies

```json
{
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/ssr": "^0.0.10",
  "next": "14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.2.0",
  "@tiptap/react": "^2.1.0",
  "@tiptap/starter-kit": "^2.1.0",
  "tailwindcss": "^3.3.0",
  "flowbite-react": "^0.6.0",
  "sonner": "^1.2.0"
}
```

### Development Dependencies

```json
{
  "@types/node": "^20.8.0",
  "@types/react": "^18.2.0",
  "eslint": "^8.51.0",
  "eslint-config-next": "14.0.0",
  "postcss": "^8.4.0",
  "sharp": "^0.32.0"
}
```

---

## 🗃️ Database Schema (Supabase)

### Core Tables

```sql
-- Artworks (NFTs)
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description JSONB,
  token_id TEXT,
  mint_date DATE,
  mint_link TEXT,
  type TEXT CHECK (type IN ('single', 'edition')),
  editions_total INTEGER,
  image_url TEXT,
  image_cached_path TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_one_of_one BOOLEAN DEFAULT false,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Series (Collections)
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Many-to-Many Relationship
CREATE TABLE series_artworks (
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  PRIMARY KEY (series_id, artwork_id)
);

-- Artifacts (Additional Content)
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  highlight_video_url TEXT,
  link_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Page (Singleton)
CREATE TABLE about_page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'editor')),
  PRIMARY KEY (user_id)
);
```

### RLS Policies

```sql
-- Public read access
CREATE POLICY "read_public" ON artworks FOR SELECT USING (true);
CREATE POLICY "read_public" ON series FOR SELECT USING (true);
CREATE POLICY "read_public" ON artifacts FOR SELECT USING (true);
CREATE POLICY "read_public" ON about_page FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "write_admin" ON artworks FOR ALL USING (is_admin());
CREATE POLICY "write_admin" ON series FOR ALL USING (is_admin());
CREATE POLICY "write_admin" ON artifacts FOR ALL USING (is_admin());
CREATE POLICY "write_admin" ON about_page FOR ALL USING (is_admin());
```

---

## 🚀 Build & Deploy

### Vercel Configuration

```json
{
  "functions": {
    "src/app/api/**": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"]
}
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Development
NODE_ENV=production
```

### Build Process

```bash
# Install dependencies
yarn install

# Type check
yarn tsc --noEmit

# Build static pages
yarn build

# Deploy to Vercel
vercel --prod
```

---

## 🔧 Key Features Enabled

### Static Generation

- **249+ páginas estáticas** geradas
- **generateStaticParams** para todas rotas dinâmicas
- **Cache automático** via React cache()

### Authentication

- **Magic Link** authentication via Supabase
- **Middleware protection** para rotas admin
- **Role-based access** com RLS

### Content Management

- **Tiptap editor** para rich text
- **Image upload** para Supabase Storage
- **Proxy de imagens** para otimização

### Performance

- **Server Components** por padrão
- **Lazy loading** de imagens
- **Responsive images** com Next.js Image
- **CDN optimization** via Supabase

---

## 🎯 Padrões Estabelecidos

### Client vs Server

- **Server Components**: Páginas, layouts, data fetching
- **Client Components**: Interações, forms, state management
- **Hybrid approach**: Quando necessário

### Data Fetching

- **Services**: Única fonte de data fetching
- **React cache()**: Cache automático em Server Components
- **Error boundaries**: Tratamento de erros robusto

### Styling

- **Tailwind**: Utility-first approach
- **Flowbite**: Component library
- **Custom CSS**: Apenas quando necessário

### Type Safety

- **Supabase types**: Gerados automaticamente
- **Strict TypeScript**: Sem `any` types
- **Interface consistency**: `ProcessedArtwork` unificado

---

**Status**: Produção-ready
**Performance**: ✅ Build 249+ páginas
**Última validação**: Setembro 2025

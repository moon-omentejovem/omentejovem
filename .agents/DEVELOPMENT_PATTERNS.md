# Padrões de Desenvolvimento - Omentejovem

> **Contexto de padrões de código para agentes de IA**
>
> Convenções e práticas estabelecidas no projeto.

---

## 🎯 Convenções Gerais

### Naming Conventions

```typescript
// Files & Folders
component - name.tsx // kebab-case
useCustomHook.ts // camelCase para hooks
SomeService.ts // PascalCase para classes
utils / helper - functions.ts // kebab-case para utilities

// Variables & Functions
const userName = 'john' // camelCase
const API_BASE_URL = 'https://...' // SCREAMING_SNAKE_CASE para constantes
function getUserData() {} // camelCase
class ArtworkService {} // PascalCase

// Database & URLs
table_name / // snake_case (Postgres)
  series /
  [slug] // kebab-case (URLs)
```

### File Organization

```
src/
├── app/                   # Next.js App Router
│   ├── (public)/         # Route groups
│   ├── admin/            # Protected routes
│   └── api/              # API routes
├── components/           # React components
│   ├── admin/           # Admin-specific components
│   └── ui/              # Reusable UI components
├── services/            # Data layer (Services pattern)
├── hooks/               # Custom React hooks
├── utils/               # Pure utility functions
├── types/               # TypeScript type definitions
└── lib/                 # Third-party integrations
```

---

## 🚀 Services Pattern

### BaseService (Always Extend)

```typescript
// services/base.service.ts
export abstract class BaseService {
  protected static async getSupabaseClient() {
    // Context-aware client creation
    return await createProductionClient()
  }

  protected static async executeQuery<T>(
    queryFn: (supabase: SupabaseClient) => Promise<T>
  ): Promise<T> {
    const supabase = await this.getSupabaseClient()
    return await queryFn(supabase)
  }

  protected static async safeExecuteQuery<T>(
    queryFn: (supabase: SupabaseClient) => Promise<T>,
    fallback: T
  ): Promise<T> {
    try {
      return await this.executeQuery(queryFn)
    } catch (error) {
      console.error('Query error:', error)
      return fallback
    }
  }
}
```

### Service Implementation

```typescript
// services/artwork.service.ts
export class ArtworkService extends BaseService {
  // ✅ Static methods with cache
  static getArtworks = cache(async (filters: ArtworkFilters = {}) => {
    return this.executeQuery(async (supabase) => {
      let query = supabase.from('artworks').select('*')

      // Apply filters
      if (filters.featured) {
        query = query.eq('is_featured', true)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      const { data, error } = await query.order('posted_at', {
        ascending: false
      })
      if (error) throw error

      return data.map(processArtwork)
    })
  })

  // ✅ Error-safe methods
  static async safeGetArtworks(filters: ArtworkFilters = {}) {
    return this.safeExecuteQuery(() => this.getArtworks(filters), [])
  }
}
```

---

## 🎨 Component Patterns

### Server Components (Default)

```typescript
// app/portfolio/page.tsx
export default async function PortfolioPage() {
  // ✅ Data fetching in Server Component
  const artworks = await ArtworkService.getArtworks()

  return (
    <div>
      <ArtworkGrid artworks={artworks} />
    </div>
  )
}
```

### Client Components (When Needed)

```typescript
'use client'

// components/InteractiveFilter.tsx
export default function InteractiveFilter() {
  const [filter, setFilter] = useState('')

  // ✅ Client-side state management
  const handleFilterChange = (value: string) => {
    setFilter(value)
  }

  return <FilterUI onChange={handleFilterChange} />
}
```

### Component Props

```typescript
// ✅ Explicit interfaces
interface ArtworkCardProps {
  artwork: ProcessedArtwork
  showSeries?: boolean
  onSelect?: (artwork: ProcessedArtwork) => void
}

export function ArtworkCard({ artwork, showSeries = false, onSelect }: ArtworkCardProps) {
  return (
    <article className="artwork-card">
      {/* Implementation */}
    </article>
  )
}
```

---

## 📝 TypeScript Patterns

### Type Definitions

```typescript
// types/artwork.ts
export interface ProcessedArtwork {
  id: string
  slug: string
  title: string
  description?: TiptapContent
  tokenId?: string
  mintDate?: string
  mintLink?: string
  type: 'single' | 'edition'
  editionsTotal?: number
  image: ArtworkImage
  isFeatured: boolean
  isOneOfOne: boolean
  postedAt: string
  series?: SeriesInfo[]
}

export interface ArtworkFilters {
  featured?: boolean
  type?: 'single' | 'edition'
  series?: string
  limit?: number
  offset?: number
}
```

### Database Types

```typescript
// types/supabase.ts (generated)
export interface Database {
  public: {
    Tables: {
      artworks: {
        Row: {
          id: string
          slug: string
          title: string
          // ... outros campos
        }
        Insert: {
          slug: string
          title: string
          // ... campos obrigatórios
        }
        Update: {
          slug?: string
          title?: string
          // ... campos opcionais
        }
      }
    }
  }
}
```

---

## 🚨 Error Handling

### Service Level

```typescript
// ✅ Error handling no Service
export class ArtworkService extends BaseService {
  static async getArtwork(slug: string): Promise<ProcessedArtwork | null> {
    try {
      return await this.executeQuery(async (supabase) => {
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error) throw error
        return processArtwork(data)
      })
    } catch (error) {
      console.error(`Error fetching artwork ${slug}:`, error)
      return null
    }
  }
}
```

### Page Level

```typescript
// app/portfolio/[slug]/page.tsx
export default async function ArtworkPage({ params }: { params: { slug: string } }) {
  const artwork = await ArtworkService.getArtwork(params.slug)

  if (!artwork) {
    notFound()
  }

  return <ArtworkDetail artwork={artwork} />
}
```

### Client Components

```typescript
'use client'

// components/ArtworkForm.tsx
export function ArtworkForm() {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ArtworkFormData) => {
    try {
      setError(null)
      await ArtworkService.createArtwork(data)
      toast.success('Artwork created successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setError(message)
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}
      {/* Form fields */}
    </form>
  )
}
```

---

## 🎨 CSS & Styling

### Tailwind Patterns

```typescript
// ✅ Consistent utility classes
const buttonStyles = {
  base: 'px-4 py-2 rounded-lg font-medium transition-colors',
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
}

// ✅ Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Component Variants

```typescript
// components/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ variant, size, children, ...props }: ButtonProps) {
  const baseClasses = 'rounded-lg font-medium transition-colors'
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  }
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`

  return <button className={className} {...props}>{children}</button>
}
```

---

## 🔧 Performance Patterns

### React Cache

```typescript
// ✅ Cache em Services
import { cache } from 'react'

export class ArtworkService extends BaseService {
  static getArtworks = cache(async (filters: ArtworkFilters = {}) => {
    // Implementation with automatic caching
  })
}
```

### Static Generation

```typescript
// app/series/[slug]/page.tsx
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const slugs = await SeriesService.getSlugs()
  return slugs.map((slug) => ({ slug }))
}
```

### Image Optimization

```typescript
// components/ArtworkImage.tsx
import Image from 'next/image'

interface ArtworkImageProps {
  artwork: ProcessedArtwork
  priority?: boolean
}

export function ArtworkImage({ artwork, priority = false }: ArtworkImageProps) {
  return (
    <Image
      src={artwork.image.optimized || artwork.image.original}
      alt={artwork.title}
      width={600}
      height={600}
      priority={priority}
      className="rounded-lg object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

---

## 📋 Code Review Checklist

### ✅ Services

- [ ] Extends `BaseService`
- [ ] Uses `executeQuery` ou `safeExecuteQuery`
- [ ] Methods are static with `cache()`
- [ ] Proper error handling
- [ ] Returns `ProcessedArtwork` types

### ✅ Components

- [ ] Server Component por padrão
- [ ] Client Component apenas quando necessário
- [ ] Props interface definida
- [ ] Error boundaries apropriados
- [ ] Accessible HTML (semantic tags, aria-labels)

### ✅ Types

- [ ] No `any` types
- [ ] Interfaces exported
- [ ] Database types via generated
- [ ] Consistent naming

### ✅ Performance

- [ ] Static generation when possible
- [ ] Image optimization
- [ ] Cache strategies
- [ ] Minimal client-side JavaScript

---

**Padrão Estabelecido**: Services + BaseService inheritance
**Última atualização**: Setembro 2025
**Status**: Production-ready

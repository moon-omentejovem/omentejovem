# Contexto de Deploy e Produção - Omentejovem

> **Contexto de deployment para agentes de IA**
>
> Configurações de produção, otimizações e troubleshooting.

---

## 🚀 Configuração de Deploy

### Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "src/app/api/**": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs",
  "buildCommand": "yarn build",
  "outputDirectory": ".next"
}
```

### Environment Variables (Produção)

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Next.js
NODE_ENV=production
NEXTAUTH_URL=https://omentejovem.vercel.app
NEXTAUTH_SECRET=your_secret_here

# Optional
ANALYZE=false
```

---

## 📦 Build Process

### Package.json Scripts

```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "node scripts/vercel-seed.js",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Build Optimization

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de produção
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    domains: [
      'nft-cdn.alchemy.com',
      'ipfs.io',
      'arweave.net',
      'lh3.googleusercontent.com',
      'i.seadn.io',
      'projeto.supabase.co'
    ],
    formats: ['image/webp', 'image/avif']
  },

  // Headers para cache
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

---

## 🏗️ Static Generation

### Resultados de Build (Atual)

```
✅ Static pages: 249+ páginas
✅ Server components: Otimizados
✅ Bundle size: < 2MB total
✅ Build time: ~60-90 segundos
✅ Zero DYNAMIC_SERVER_USAGE errors
```

### generateStaticParams Implementation

```typescript
// app/portfolio/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await ArtworkService.getSlugs()
  return slugs.map((slug) => ({ slug }))
}

// app/series/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await SeriesService.getSlugs()
  return slugs.map((slug) => ({ slug }))
}

// app/1-1/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await ArtworkService.getOneOfOneSlugs()
  return slugs.map((slug) => ({ slug }))
}

// app/editions/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await ArtworkService.getEditionSlugs()
  return slugs.map((slug) => ({ slug }))
}
```

### Force Dynamic Pages

```typescript
// Páginas que requerem server-side rendering
export const dynamic = 'force-dynamic'

// Casos de uso:
// - Admin pages (authentication required)
// - API routes com mutations
// - Pages com real-time data
```

---

## ⚡ Performance Optimizations

### React Cache Strategy

```typescript
// Services usam cache() automático
import { cache } from 'react'

export class ArtworkService extends BaseService {
  // Cache durante a duração da request
  static getArtworks = cache(async (filters: ArtworkFilters = {}) => {
    // Implementation...
  })

  // Cache para static generation
  static getSlugs = cache(async () => {
    // Implementation...
  })
}
```

### Image Optimization

```typescript
// components/ArtworkImage.tsx
import Image from 'next/image'

export function ArtworkImage({ artwork, priority = false }) {
  return (
    <Image
      src={artwork.image.optimized || artwork.image.original}
      alt={artwork.title}
      width={600}
      height={600}
      priority={priority}                    // Critical images
      placeholder="blur"                     // Loading state
      blurDataURL="data:image/jpeg;base64..."// Placeholder
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="rounded-lg object-cover"
    />
  )
}
```

### Bundle Optimization

```typescript
// Dynamic imports para componentes pesados
const TiptapEditor = dynamic(() => import('./TiptapEditor'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})

// Code splitting automático por rota (App Router)
// app/admin/* - Admin bundle separado
// app/(public)/* - Public bundle separado
```

---

## 🔧 Production Checks

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Verificar conexão Supabase
    const supabase = await createProductionClient()
    const { data, error } = await supabase
      .from('artworks')
      .select('id')
      .limit(1)

    if (error) throw error

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      artworks_count: data?.length || 0
    })
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error.message
      },
      { status: 500 }
    )
  }
}
```

### Seed Automático

```javascript
// scripts/vercel-seed.js
const { createClient } = require('@supabase/supabase-js')

async function seedDatabase() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Verificar se dados já existem
    const { data: existingArtworks } = await supabase
      .from('artworks')
      .select('id')
      .limit(1)

    if (existingArtworks?.length > 0) {
      console.log('📊 Database already seeded, skipping...')
      return
    }

    // Seed básico para produção
    await seedBasicData(supabase)
    console.log('✅ Database seeded successfully')
  } catch (error) {
    console.warn('⚠️ Seed failed (non-critical):', error.message)
    // Não falha o deploy se seed der erro
  }
}

// Executa automaticamente após build
if (require.main === module) {
  seedDatabase()
}
```

---

## 🚨 Troubleshooting

### Common Production Issues

#### 1. DYNAMIC_SERVER_USAGE Error

**Problema**: Pages tentando usar cookies/headers durante static generation

```
Error: Dynamic server usage: cookies
```

**Solução**: BaseService com context detection

```typescript
// services/base.service.ts
protected static async getSupabaseClient() {
  try {
    // Runtime: usar cliente servidor
    return await createClient()
  } catch (error) {
    // Build-time: usar cliente build
    return createBuildClient()
  }
}
```

#### 2. Environment Variables Missing

**Problema**: Variáveis de ambiente não definidas

```
Error: Cannot read property 'SUPABASE_URL' of undefined
```

**Verificação**:

```bash
# No Vercel Dashboard
# Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=✅
SUPABASE_SERVICE_ROLE_KEY=✅
```

#### 3. Build Timeout

**Problema**: Build excede limite de tempo

```
Error: Build exceeded maximum time limit
```

**Solução**: Otimizar queries de static generation

```typescript
// ✅ Otimizado - apenas slugs
static getSlugs = cache(async () => {
  return this.executeQuery(async (supabase) => {
    const { data } = await supabase.from('artworks').select('slug')
    return data.map(item => item.slug)
  })
})

// ❌ Ineficiente - dados completos
static getSlugs = cache(async () => {
  const artworks = await this.getArtworks() // Busca tudo
  return artworks.map(artwork => artwork.slug)
})
```

### Debug Commands

```bash
# Verificar build local
yarn build && yarn start

# Analisar bundle
yarn analyze

# Verificar tipos
yarn type-check

# Test static generation
yarn build 2>&1 | grep "Static"
```

---

## 📊 Monitoring & Analytics

### Build Metrics

```bash
# Monitorar durante deploy
echo "📊 Build Metrics:"
echo "Static pages: $(cat .next/prerender-manifest.json | jq '. | length')"
echo "Server pages: $(cat .next/server-pages-manifest.json | jq '. | length')"
echo "Build time: ${BUILD_TIME}s"
```

### Performance Monitoring

```typescript
// lib/analytics.ts
export function trackPageView(url: string) {
  // Google Analytics ou similar
  gtag('config', GA_TRACKING_ID, {
    page_location: url
  })
}

export function trackEvent(action: string, data?: any) {
  gtag('event', action, data)
}
```

### Error Tracking

```typescript
// lib/error-tracking.ts
export function captureError(error: Error, context?: any) {
  console.error('Production error:', error, context)

  // Sentry ou similar
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context })
  }
}
```

---

## 🔄 Deploy Workflow

### CI/CD Pipeline (Vercel)

1. **Trigger**: Push to main branch
2. **Install**: `yarn install --frozen-lockfile`
3. **Type Check**: `yarn type-check`
4. **Lint**: `yarn lint`
5. **Build**: `yarn build`
6. **Seed**: `yarn postbuild` (auto-seed)
7. **Deploy**: Vercel deployment
8. **Health Check**: Verify `/api/health`

### Rollback Strategy

```bash
# Via Vercel CLI
vercel rollback [deployment-url]

# Via Dashboard
# Deployments > Previous deployment > Promote to Production
```

---

## ✅ Production Checklist

### Pre-Deploy

- [ ] Environment variables configuradas
- [ ] Build local bem-sucedido
- [ ] Static generation testada (249+ páginas)
- [ ] Type check sem erros
- [ ] Lint sem warnings críticos

### Post-Deploy

- [ ] Health check `/api/health` retorna 200
- [ ] Homepage carrega corretamente
- [ ] Admin login funciona
- [ ] Static pages acessíveis
- [ ] Images carregando corretamente

### Performance

- [ ] Lighthouse Score > 90
- [ ] Core Web Vitals dentro dos targets
- [ ] Bundle size < 2MB
- [ ] First Contentful Paint < 2s

---

**Status**: ✅ Produção estável
**Build**: 249+ páginas estáticas
**Performance**: Otimizado
**Última verificação**: Setembro 2025

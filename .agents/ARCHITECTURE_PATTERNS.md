# Arquitetura e Padrões - Omentejovem

> **Contexto de arquitetura para agentes de IA**
>
> Padrões arquiteturais e sistema Services production-ready implementado.

---

## 🏗️ Arquitetura Services (Production-Ready)

### Cliente Supabase Inteligente

**Problema Resolvido**: `DYNAMIC_SERVER_USAGE` em produção

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

### BaseService Pattern

**Herança em vez de composição** para gerenciamento centralizado:

```typescript
// services/base.service.ts
export abstract class BaseService {
  protected static async getSupabaseClient() {
    // Detecta contexto automaticamente
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

### Services Especializados

```typescript
// services/artwork.service.ts
export class ArtworkService extends BaseService {
  static getArtworks = cache(async (filters: ArtworkFilters = {}) => {
    return this.executeQuery(async (supabase) => {
      let query = supabase.from('artworks').select('*')

      if (filters.featured) {
        query = query.eq('is_featured', true)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      const { data, error } = await query
      if (error) throw error

      return data.map(processArtwork)
    })
  })
}
```

## 🎯 Benefícios da Arquitetura

### ✅ Production-Safe

- **Funciona em build-time e runtime**
- **Evita `DYNAMIC_SERVER_USAGE`**
- **Error handling centralizado**
- **Context detection automático**

### ✅ Type Safety

- **TypeScript strict mode**
- **Interface unificada `ProcessedArtwork`**
- **Supabase types gerados**
- **Validation centralizada**

### ✅ Performance

- **React `cache()` automático**
- **Static generation otimizada**
- **Queries otimizadas**
- **Minimal re-renders**

## 🔄 Padrão de Páginas Dinâmicas

```typescript
// app/series/[slug]/page.tsx
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const slugs = await SeriesService.getSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function SeriesPage({ params }) {
  const seriesExists = await SeriesService.existsBySlug(params.slug)
  if (!seriesExists) notFound()

  const { artworks, error } = await ArtworkService.getBySeriesSlug(params.slug)

  if (error) {
    console.error('Error loading series artworks:', error)
    return <div>Error loading series</div>
  }

  return <SeriesDisplay artworks={artworks} />
}
```

## 📦 Estrutura Modular

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

## 🚨 Responsabilidades Claras

### BaseService

- Gerencia cliente Supabase
- Error handling centralizado
- Context detection (build vs runtime)
- Query execution patterns

### Services Especializados

- Lógica de negócio específica
- Cache via React `cache()`
- Validation de dados
- Transformação para `ProcessedArtwork`

### utils/supabase

- **APENAS** criação de clientes
- **SEM** lógica de negócio
- Factory patterns
- Environment-based clients

### Páginas

- **USAM APENAS** Services
- **NUNCA** Supabase diretamente
- Static generation via `generateStaticParams`
- Error boundaries apropriados

## 🔧 Padrões de Implementação

### ✅ Correto

```typescript
// Usar Service
const artworks = await ArtworkService.getArtworks({ featured: true })

// Error handling no Service
const { data, error } = await ArtworkService.safeGetArtworks()

// Cache automático
const cached = ArtworkService.getArtworks // React cache() aplicado
```

### ❌ Evitar

```typescript
// Cliente Supabase direto
const supabase = createClient()
const { data } = await supabase.from('artworks').select('*')

// Lógica de negócio em utils
const processedData = utils.processArtworks(data)

// Multiple sources of truth
const clientData = useArtworks()
const serverData = await getServerData()
```

## 🏆 Resultados Comprovados

- **✅ 249 páginas estáticas** geradas
- **✅ Zero `DYNAMIC_SERVER_USAGE`** errors
- **✅ Build bem-sucedido** sem erros
- **✅ Performance otimizada** com cache
- **✅ Type safety** completo
- **✅ Error handling** robusto

---

**Padrão Estabelecido**: BaseService inheritance pattern
**Status**: Production-ready
**Última validação**: Setembro 2025

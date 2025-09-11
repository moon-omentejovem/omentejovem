# Server-Side Data Fetching Guide

Este guia explica como implementar data fetching no lado do servidor para melhor performance e SEO.

## 🚀 Problema Resolvido

O código original fazia a requisição no lado do cliente:

```tsx
// ❌ Client-side (antes)
function ImageBanner(): ReactElement {
  const [images, setImages] = useState<string[]>([])
  const { data: artworks } = useArtworksPaginated(1, 10)

  useEffect(() => {
    const loadImages = async () => {
      if (!artworks?.data) return
      const randomImages = artworks.data.map((nft) => nft.image_url)
      setImages(randomImages)
    }
    loadImages()
  }, [artworks])

  // render...
}
```

**Problemas:**

- ❌ Dados não disponíveis no server-side rendering
- ❌ Loading states desnecessários
- ❌ Pior SEO (conteúdo vazio no primeiro render)
- ❌ CLS (Cumulative Layout Shift)
- ❌ Requisições extras no cliente

## ✅ Soluções Implementadas

### 1. Server Component com Props

```tsx
// ✅ Server-side (page.tsx)
export default async function NewsletterPage() {
  const artworks = await getArtworksServer({ limit: 10 })
  const artworkImages = artworks.map((artwork) => artwork.image_url)

  return <Newsletter initialImages={artworkImages} />
}

// ✅ Client Component otimizado (content.tsx)
export function Newsletter({ initialImages = [] }: NewsletterProps) {
  const [images, setImages] = useState<string[]>(initialImages)

  // React Query como fallback opcional
  const shouldFetchImages = initialImages.length === 0
  const { data: artworks } = useArtworksPaginated(1, 10)

  useEffect(() => {
    if (shouldFetchImages && artworks?.data) {
      const randomImages = artworks.data.map((nft) => nft.image_url)
      setImages(randomImages)
    }
  }, [artworks, shouldFetchImages])

  return <ImageBanner images={images} />
}
```

### 2. Server-Side Queries Reutilizáveis

Criamos funções server-side com cache para reutilização:

```tsx
// ✅ server-queries.ts
import { cache } from 'react'

export const getArtworksServer = cache(async (options) => {
  const supabase = await createClient()
  // ... implementação com cache automático
})

export const getHomepageDataServer = cache(async () => {
  // Queries paralelas para melhor performance
  const [featuredArtworks, oneOfOneArtworks, series] = await Promise.all([
    getArtworksServer({ featured: true, limit: 6 }),
    getArtworksServer({ oneOfOne: true, limit: 3 }),
    getSeriesServer({ limit: 10 })
  ])

  return { featuredArtworks, oneOfOneArtworks, series }
})
```

## 🎯 Benefícios da Implementação

### Performance

- ✅ **SSR completo**: Dados renderizados no servidor
- ✅ **Cache automático**: React `cache()` evita requisições duplicadas
- ✅ **Queries paralelas**: `Promise.all()` para múltiplas requisições
- ✅ **Menor tempo de carregamento**: Primeiro render com dados

### SEO

- ✅ **Conteúdo indexável**: Dados disponíveis no HTML inicial
- ✅ **Meta tags dinâmicas**: Possibilidade de generateMetadata()
- ✅ **Sem loading states**: Conteúdo imediato

### Developer Experience

- ✅ **Type safety**: Totalmente tipado
- ✅ **Reutilização**: Funções server-side reutilizáveis
- ✅ **Fallback**: React Query como backup
- ✅ **Error handling**: Tratamento robusto de erros

## 📊 Comparação de Abordagens

| Aspecto            | Client-Side Only | Server + Client (Híbrido) | Server-Side Only |
| ------------------ | ---------------- | ------------------------- | ---------------- |
| **First Paint**    | Vazio            | Com dados                 | Com dados        |
| **SEO**            | ❌ Ruim          | ✅ Excelente              | ✅ Excelente     |
| **Interatividade** | ✅ Total         | ✅ Total                  | ❌ Limitada      |
| **Cache**          | React Query      | Server + React Query      | Server Cache     |
| **Loading States** | ✅ Necessário    | ⚠️ Opcional               | ❌ Não aplicável |
| **Realtime**       | ✅ Fácil         | ✅ Fácil                  | ❌ Complexo      |

## 🛠️ Como Usar

### Para páginas simples (só leitura):

```tsx
// page.tsx - Server Component
export default async function MyPage() {
  const data = await getArtworksServer({ limit: 10 })
  return <StaticComponent data={data} />
}
```

### Para páginas com interatividade:

```tsx
// page.tsx - Server Component
export default async function MyPage() {
  const initialData = await getArtworksServer({ limit: 10 })
  return <InteractiveComponent initialData={initialData} />
}

// component.tsx - Client Component
;('use client')
export function InteractiveComponent({ initialData }) {
  // React Query para updates em tempo real
  const { data } = useArtworks({ initialData })
  // ... lógica interativa
}
```

### Para páginas com loading/error states:

```tsx
// page.tsx
export default function MyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DataComponent />
    </Suspense>
  )
}

// component.tsx - Server Component
async function DataComponent() {
  const data = await getArtworksServer()
  return <div>{/* render data */}</div>
}
```

## 🔧 Configurações Avançadas

### Cache personalizado:

```tsx
import { unstable_cache } from 'next/cache'

export const getArtworksCustomCache = unstable_cache(
  async (options) => {
    // implementação
  },
  ['artworks'], // cache key
  {
    revalidate: 3600, // 1 hora
    tags: ['artworks'] // para invalidação
  }
)
```

### Invalidação de cache:

```tsx
import { revalidateTag } from 'next/cache'

// Em uma Server Action
export async function updateArtwork() {
  // ... update logic
  revalidateTag('artworks') // invalida cache
}
```

## 🎯 Recomendações

1. **Use Server Components** para dados iniciais
2. **Combine com React Query** para interatividade
3. **Cache adequadamente** baseado na frequência de mudança
4. **Queries paralelas** para múltiplas fontes de dados
5. **Fallbacks robustos** para cenários de erro
6. **Loading states** apenas quando necessário

## 📈 Métricas de Performance

Com a implementação server-side:

- ⚡ **LCP melhorado**: Conteúdo carrega instantaneamente
- ⚡ **CLS reduzido**: Sem layout shifts por loading
- ⚡ **FID otimizado**: Menos JavaScript no cliente
- ⚡ **SEO score**: 100% indexável pelo Google

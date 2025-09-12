# Solução Simplificada para Cache de Imagens Supabase

## Problema

- Página recarregava ao navegar via scroll no carousel
- Imagens do Supabase não eram cacheadas

## Solução Simples

### 1. Next.js Config (`next.config.js`)

```javascript
images: {
  unoptimized: false,           // Habilitar otimização Next.js
  minimumCacheTTL: 3600,       // Cache por 1 hora
  remotePatterns: [
    { hostname: '**.supabase.co' }
  ]
},
headers: [
  {
    source: '/_next/image',
    headers: [{
      key: 'Cache-Control',
      value: 'public, max-age=86400, immutable'
    }]
  }
]
```

### 2. Navigation Hook (`useCarouselNavigation.ts`)

- `router.replace()` para scroll (não adiciona ao histórico)
- `router.push()` para clique (adiciona ao histórico)
- Sem debounce ou complexidades extras

### 3. VerticalCarousel

- `onSlideChange` usa `replace=true`
- `onClick` usa `replace=false`

## Resultado

✅ Navegação suave sem recarregamento
✅ Imagens do Supabase cacheadas
✅ Código simples e maintível

**Servidor:** http://localhost:3001

# Integração Supabase

> **Documentação da integração Supabase no projeto**
>
> Como usar Supabase corretamente com Next.js 14 e App Router.

---

## 📁 Estrutura dos Arquivos

```
utils/supabase/
├── client.ts          # Cliente para browser/client components
├── server.ts          # Cliente para server components/API routes
└── middleware.ts      # Middleware para gestão de sessões

services/
├── base.service.ts    # Classe base para gerenciamento inteligente
├── artwork.service.ts # Service especializado para artworks
├── series.service.ts  # Service especializado para séries
└── ...               # Outros services especializados
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Schema do Banco

O schema está documentado em detalhes no arquivo `supabase-setup.sql` e inclui:

- **artworks**: NFTs e peças de arte com metadados completos
- **series**: Coleções/grupos de artworks
- **series_artworks**: Relacionamento N:N entre séries e artworks
- **artifacts**: Conteúdo adicional (coleções, vídeos)
- **about_page**: Página sobre (singleton com Tiptap JSON)
- **user_roles**: Gestão de permissões administrativas

## 🚀 Como Usar

### Services (Recomendado)

```tsx
// Usar Services em vez de cliente direto
import { ArtworkService } from '@/services/artwork.service'

export default async function PortfolioPage() {
  const artworks = await ArtworkService.getArtworks({ featured: true })

  return <ArtworkGrid artworks={artworks} />
}
```

### Client Components (Quando Necessário)

```tsx
'use client'
import { createClient } from '@/utils/supabase/client'

export default function InteractiveComponent() {
  const supabase = createClient()

  // Usar apenas para interações client-side
}
```

### API Routes

```tsx
import { ArtworkService } from '@/services/artwork.service'

export async function POST(request: Request) {
  // Services são production-safe para API routes
  const artworks = await ArtworkService.createArtwork(data)

  return Response.json(artworks)
}
```

## 🔐 Row Level Security (RLS)

### Políticas Atuais

- **Leitura Pública**: Todos os dados são legíveis publicamente
- **Escrita Restrita**: Apenas usuários autenticados podem escrever
- **Admin Only**: Operações de gestão requerem role 'admin'

### Helper Function

```sql
-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📝 Padrões de Uso

### 1. Services Architecture (Atual)

```tsx
// ✅ Recomendado - usar Services
const artworks = await ArtworkService.getArtworks()

// ❌ Evitar - cliente direto em pages
const supabase = createClient()
const { data } = await supabase.from('artworks').select('*')
```

### 2. Error Handling

```tsx
// Services têm error handling integrado
const { artworks, error } = await ArtworkService.safeGetArtworks()

if (error) {
  console.error('Error loading artworks:', error)
  return <ErrorDisplay />
}
```

### 3. Cache Automático

```tsx
// Services usam React cache() automaticamente
const artworks = await ArtworkService.getArtworks() // Cached
const featuredArtworks = await ArtworkService.getArtworks({ featured: true }) // Separate cache
```

## 🛡️ Segurança

### Environment Variables

- **Públicas**: `NEXT_PUBLIC_*` - expostas no client
- **Privadas**: `SUPABASE_SERVICE_ROLE_KEY` - apenas no server/Services

### Authentication

```tsx
// Verificação de auth via Services
const user = await AuthService.getCurrentUser()

if (!user) {
  redirect('/auth/login')
}
```

## 🔄 Middleware

O middleware em `utils/supabase/middleware.ts` gerencia:

- Refresh automático de tokens
- Sincronização de sessão entre client/server
- Proteção de rotas administrativas

```tsx
// middleware.ts
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

## 📊 Performance

### Services com Cache

```tsx
// Cache automático por request
export class ArtworkService extends BaseService {
  static getArtworks = cache(async (filters: ArtworkFilters = {}) => {
    // Implementation with automatic caching
  })
}
```

### Static Generation

```tsx
// generateStaticParams para páginas dinâmicas
export async function generateStaticParams() {
  const slugs = await ArtworkService.getSlugs()
  return slugs.map((slug) => ({ slug }))
}
```

### Query Optimization

```sql
-- ✅ Queries otimizadas nos Services
SELECT
  a.*,
  json_agg(s.*) as series
FROM artworks a
LEFT JOIN series_artworks sa ON a.id = sa.artwork_id
LEFT JOIN series s ON sa.series_id = s.id
WHERE a.is_featured = true
GROUP BY a.id
ORDER BY a.posted_at DESC
LIMIT 6;
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **"DYNAMIC_SERVER_USAGE"**
   - **Solução**: Usar Services em vez de cliente direto
   - Services têm context detection automático

2. **"Missing environment variables"**
   - Verificar arquivo `.env.local`
   - Confirmar variáveis no Vercel/deploy

3. **"RLS Policy Errors"**
   - Verificar políticas no Supabase Dashboard
   - Confirmar autenticação do usuário

### Debug Mode

```tsx
// Services têm logging integrado
const artworks = await ArtworkService.getArtworks()
// Logs automáticos em caso de erro
```

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Schema Setup](../supabase-setup.sql)

---

**Status**: ✅ Integração completa e production-ready
**Arquitetura**: Services-based com BaseService pattern
**Performance**: Otimizada com cache e static generation

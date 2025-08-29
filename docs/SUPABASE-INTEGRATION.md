# Supabase Integration Guide

Este guia documenta a integração do Supabase no projeto Omentejovem, seguindo as melhores práticas oficiais para Next.js.

## 📁 Estrutura dos Arquivos

```
utils/supabase/
├── client.ts          # Cliente para browser/client components
├── server.ts          # Cliente para server components/API routes
└── middleware.ts      # Middleware para gestão de sessões

src/lib/
├── supabase.ts        # Helper functions para queries
└── supabase-config.ts # Configurações e constantes
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Schema

O schema está definido em `supabase-setup.sql` e inclui:

- **artworks**: NFTs e peças de arte
- **series**: Coleções/grupos de artworks
- **series_artworks**: Relacionamento N:N
- **artifacts**: Conteúdo adicional
- **about_page**: Página sobre (singleton)
- **user_roles**: Gestão de permissões

## 🚀 Como Usar

### Client Components

```tsx
import { createClient } from '@/utils/supabase/client'

export default function MyClientComponent() {
  const supabase = createClient()

  // Usar supabase aqui...
}
```

### Server Components

```tsx
import { createClient } from '@/utils/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()

  // Usar supabase aqui...
}
```

### API Routes

```tsx
import { createServerActionClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  const supabase = await createServerActionClient()

  // Usar supabase aqui...
}
```

### Helper Functions

Use as funções helper em `src/lib/supabase.ts`:

```tsx
import { fetchArtworks, fetchSeries } from '@/lib/supabase'

// Buscar artworks em destaque
const featured = await fetchArtworks({ featured: true, limit: 6 })

// Buscar séries com artworks
const series = await fetchSeries({ includeArtworks: true })
```

## 🔐 Row Level Security (RLS)

### Políticas Atuais

- **Leitura Pública**: Todos os dados são legíveis publicamente
- **Escrita Restrita**: Apenas usuários autenticados podem escrever
- **Admin Only**: Operações de gestão requerem autenticação

### Implementação

```sql
-- Leitura pública
create policy "read_public" on public.artworks
  for select using (true);

-- Escrita para admins
create policy "write_admins" on public.artworks
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

## 📝 Padrões de Código

### 1. Tratamento de Erros

```tsx
try {
  const data = await fetchArtworks()
} catch (error) {
  console.error('Error:', error)
  // Tratar erro apropriadamente
}
```

### 2. Tipagem

```tsx
import type { Database } from '@/types/supabase'

type Artwork = Database['public']['Tables']['artworks']['Row']
```

### 3. Queries Otimizadas

```tsx
// ✅ Bom - especificar campos necessários
const { data } = await supabase.from('artworks').select('id, title, image_url')

// ❌ Evitar - selecionar tudo sem necessidade
const { data } = await supabase.from('artworks').select('*')
```

### 4. Cache e Revalidação

```tsx
// Em Server Components
const artworks = await fetchArtworks()

// Com revalidação no Next.js
export const revalidate = 60 // 1 minuto
```

## 🛡️ Segurança

### Environment Variables

- **Públicas**: `NEXT_PUBLIC_*` - expostas no client
- **Privadas**: `SUPABASE_SERVICE_ROLE_KEY` - apenas no server

### Authentication

```tsx
const {
  data: { user }
} = await supabase.auth.getUser()

if (!user) {
  redirect('/auth/login')
}
```

### Service Role

Use apenas no servidor para operações administrativas:

```tsx
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

## 🔄 Middleware

O middleware em `utils/supabase/middleware.ts` é responsável por:

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

### 1. Queries Eficientes

```tsx
// ✅ Com paginação
const { data } = await supabase
  .from('artworks')
  .select('*')
  .range(0, 9)

  // ✅ Com índices apropriados
  .eq('is_featured', true)
  .order('posted_at', { ascending: false })
```

### 2. Relacionamentos

```tsx
// ✅ Join eficiente
const { data } = await supabase.from('artworks').select(`
    *,
    series_artworks(
      series(name, slug)
    )
  `)
```

### 3. Caching

```tsx
// Next.js App Router
export const revalidate = 3600 // 1 hora

// React Query
const { data } = useQuery({
  queryKey: ['artworks'],
  queryFn: fetchArtworks,
  staleTime: 1000 * 60 * 5 // 5 minutos
})
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **"Cannot find name 'process'"**

   - Verificar se `@types/node` está instalado
   - Adicionar `"types": ["node"]` no tsconfig.json

2. **"Missing environment variables"**

   - Verificar arquivo `.env.local`
   - Confirmar variáveis no Vercel/deploy

3. **"Session not found"**

   - Verificar middleware
   - Confirmar cookies estão sendo passados

4. **RLS Policy Errors**
   - Verificar políticas no Supabase Dashboard
   - Confirmar autenticação do usuário

### Debug Mode

```tsx
// Ativar logs detalhados
const supabase = createClient()
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session)
})
```

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Type Generation](https://supabase.com/docs/guides/api/generating-types)

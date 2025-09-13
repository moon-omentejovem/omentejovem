# Manual de Implementação de Campo Status - Guia para Agentes de IA

> **Guia completo para implementar um campo de status em entidades do sistema**
>
> Este manual documenta o processo completo seguido na implementação do campo `status` para artworks e artifacts, servindo como referência para futuras implementações.

---

## 🎯 Visão Geral da Implementação

### Contexto do Projeto
- **Sistema**: Next.js 14 + Supabase CMS para portfolio NFT
- **Arquitetura**: Backend-oriented com Services pattern e BaseService
- **Objetivo**: Substituir ação destrutiva (delete) por status draft/published
- **Escopo**: Artworks e Artifacts com filtragem admin/público

---

## 📋 Fluxo de Implementação Completo

### Fase 1: Schema de Banco de Dados

#### 1.1 Criação da Migration
```sql
-- 001_add_status_to_artworks.sql
ALTER TABLE artworks 
ADD COLUMN status TEXT NOT NULL DEFAULT 'published' 
CHECK (status IN ('draft', 'published'));

-- 002_add_status_to_artifacts.sql  
ALTER TABLE artifacts 
ADD COLUMN status TEXT NOT NULL DEFAULT 'published' 
CHECK (status IN ('draft', 'published'));
```

**Localização**: `supabase/migrations/`

**Decisões Técnicas**:
- ✅ `DEFAULT 'published'` - Mantém dados existentes visíveis
- ✅ `CHECK` constraint - Garante integridade dos dados
- ✅ `NOT NULL` - Evita estados indefinidos

#### 1.2 Aplicação das Migrations
```bash
# Via Supabase Dashboard (Recomendado para produção)
# SQL Editor > Cole o conteúdo > Run

# Ou via CLI (para desenvolvimento local)
supabase db push
```

### Fase 2: Atualização de Types TypeScript

#### 2.1 Regeneração dos Types Supabase
```bash
# Gerar types atualizados
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

#### 2.2 Validação dos Types
```typescript
// Verificar se os types incluem o novo campo
type Artwork = Database['public']['Tables']['artworks']['Row']
// Deve incluir: status: 'draft' | 'published'
```

### Fase 3: Atualização dos Descriptors

#### 3.1 Modificação do Descriptor
```typescript
// src/types/descriptors.ts
export const artworksDescriptor: EntityDescriptor = {
  // ... outras configurações
  
  // ✅ Adicionar coluna na listagem
  columns: [
    { key: 'title', label: 'Título', render: 'text' },
    { key: 'status', label: 'Status', render: 'badge', width: '100px' },
    // ... outras colunas
  ],

  // ✅ Adicionar campo no formulário  
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Rascunho' },
        { value: 'published', label: 'Publicado' }
      ],
      required: true
    },
    // ... outros campos
  ],

  // ✅ Configurar ações customizadas
  actions: {
    hasDelete: false, // Remove ação destrutiva
    customActions: [
      {
        key: 'toggleDraft',
        label: 'Alternar Status',
        variant: 'secondary'
      }
    ]
  }
}
```

### Fase 4: Atualização do AdminTable

#### 4.1 Implementação da Ação de Toggle
```typescript
// src/components/admin/AdminTable.tsx

// ✅ Handler para toggle de status
const handleToggleDraft = async (item: any) => {
  try {
    const newStatus = item.status === 'published' ? 'draft' : 'published'
    
    const response = await fetch(`/api/admin/${entity}/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })

    if (!response.ok) throw new Error('Falha ao atualizar status')
    
    await refetch()
    toast.success(`Status alterado para ${newStatus === 'published' ? 'Publicado' : 'Rascunho'}`)
  } catch (error) {
    toast.error('Erro ao alterar status')
  }
}

// ✅ Renderização da ação customizada
{descriptor.actions?.customActions?.map((action) => (
  <Button
    key={action.key}
    variant={action.variant}
    size="sm"
    onClick={() => {
      if (action.key === 'toggleDraft') {
        handleToggleDraft(item)
      }
    }}
  >
    {action.label}
  </Button>
))}
```

#### 4.2 Renderização do Badge de Status
```typescript
// ✅ Case para render de badge no AdminTable
case 'badge':
  return (
    <Badge variant={cellValue === 'published' ? 'default' : 'secondary'}>
      {cellValue === 'published' ? 'Publicado' : 'Rascunho'}
    </Badge>
  )
```

### Fase 5: Atualização das APIs

#### 5.1 Implementação do PATCH Endpoint
```typescript
// src/app/api/admin/artworks/[id]/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    // ✅ Validação dos dados
    const validatedData = artworkSchema.partial().parse(body)
    
    // ✅ Update no banco
    const { data, error } = await supabase
      .from('artworks')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Falha ao atualizar artwork' },
      { status: 500 }
    )
  }
}
```

#### 5.2 Atualização do Schema Zod
```typescript
// ✅ Adicionar status ao schema
export const artworkSchema = z.object({
  // ... outros campos
  status: z.enum(['draft', 'published']).optional(),
})
```

### Fase 6: Filtragem Pública (Pendente)

#### 6.1 Atualização dos Services
```typescript
// services/artwork.service.ts
export class ArtworkService extends BaseService {
  // ✅ Filtragem automática para público
  static getPublishedArtworks = cache(async (filters: ArtworkFilters = {}) => {
    return this.executeQuery(async (supabase) => {
      let query = supabase
        .from('artworks')
        .select('*')
        .eq('status', 'published') // ✅ Apenas publicados
        
      // Aplicar outros filtros...
      return query
    })
  })

  // ✅ Método admin sem filtro de status
  static getAllArtworks = cache(async (filters: ArtworkFilters = {}) => {
    return this.executeQuery(async (supabase) => {
      let query = supabase.from('artworks').select('*')
      // Sem filtro de status para admin
      return query
    })
  })
}
```

#### 6.2 Atualização das Páginas Públicas
```typescript
// app/(public)/portfolio/page.tsx
export default async function PortfolioPage() {
  // ✅ Usar método que filtra por status
  const artworks = await ArtworkService.getPublishedArtworks()
  
  return (
    <div>
      {artworks.map(artwork => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  )
}
```

---

## 🛠️ Padrões e Convenções

### ✅ O que Fazer

1. **Sempre usar DEFAULT na migration** - Preserva dados existentes
2. **CHECK constraint** - Garante integridade dos valores
3. **Regenerar types** - Mantém TypeScript sincronizado
4. **Atualizar descriptor primeiro** - UI responde automaticamente
5. **PATCH endpoint** - Para updates parciais
6. **Validação Zod** - Segurança dos dados
7. **React cache()** - Performance otimizada

### ❌ O que Evitar

1. **Migration sem DEFAULT** - Quebra dados existentes
2. **Hardcode de valores** - Use enums/constants
3. **Update de múltiplos endpoints** - PATCH é suficiente
4. **Lógica no frontend** - Backend é fonte da verdade
5. **Queries sem cache** - Afeta performance

---

## 📋 Checklist de Implementação

### Banco de Dados
- [ ] Migration criada com DEFAULT value
- [ ] CHECK constraint aplicado
- [ ] Migration aplicada com sucesso

### TypeScript
- [ ] Types regenerados do Supabase
- [ ] Schema Zod atualizado
- [ ] Imports atualizados

### Admin Interface
- [ ] Descriptor atualizado (columns, fields, actions)
- [ ] AdminTable com handler customizado
- [ ] Badge/render implementado
- [ ] PATCH endpoint criado

### Público (Quando necessário)
- [ ] Service methods com filtro
- [ ] Páginas públicas atualizadas
- [ ] Cache invalidation configurado

### Testes
- [ ] Admin: Toggle funciona
- [ ] Público: Drafts não aparecem
- [ ] TypeScript: Sem erros
- [ ] Build: Sucesso sem warnings

---

## 🔍 Troubleshooting

### Problemas Comuns

**1. Type errors após migration**
```bash
# Solução: Regenerar types
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

**2. Botões duplicados no AdminTable**
```typescript
// Problema: hasActions logic incorreto
// Solução: Verificar descriptor.actions?.hasDelete === false
const hasActions = descriptor.actions?.hasDelete !== false || 
                  descriptor.actions?.customActions?.length > 0
```

**3. PATCH endpoint não funciona**
```typescript
// Verificar: Content-Type header
headers: { 'Content-Type': 'application/json' }

// Verificar: Schema validation
const validatedData = schema.partial().parse(body)
```

**4. Status não aparece na tabela**
```typescript
// Verificar: Descriptor columns
{ key: 'status', label: 'Status', render: 'badge' }

// Verificar: Badge case no AdminTable
case 'badge': return <Badge>...</Badge>
```

---

## 📖 Referências

### Arquivos Importantes
- `src/types/descriptors.ts` - Configuração de UI
- `src/components/admin/AdminTable.tsx` - Componente principal
- `services/base.service.ts` - Padrão de services
- `src/types/supabase.ts` - Types gerados

### Documentação Relacionada
- [ARCHITECTURE_PATTERNS.md](.agents/ARCHITECTURE_PATTERNS.md) - BaseService
- [BACKEND_ORIENTED_APPROACH.md](.agents/BACKEND_ORIENTED_APPROACH.md) - Princípios
- [DATABASE_SCHEMA.md](.agents/DATABASE_SCHEMA.md) - Schema RLS

---

**Criado**: Janeiro 2025  
**Status**: ✅ Implementação admin completa, público pendente  
**Próximos passos**: Filtragem pública e testes E2E
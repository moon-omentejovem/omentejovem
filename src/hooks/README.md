# Portfolio Hooks Documentation

Este diretório contém todos os React Query hooks para consumir os CRUDs do Supabase no portfólio. Os hooks estão organizados por entidade e funcionalidade.

## Estrutura dos Hooks

### 🎨 **useArtworks.ts**

Hooks para operações CRUD com artworks:

#### Queries (Leitura)

- `useArtworks(options?)` - Busca todos os artworks com filtros opcionais
- `useArtworkBySlug(slug)` - Busca artwork específico por slug
- `useFeaturedArtworks(limit?)` - Busca artworks em destaque
- `useOneOfOneArtworks(limit?)` - Busca artworks únicos (1/1)
- `useArtworksBySeries(seriesSlug)` - Busca artworks de uma série específica
- `useArtworksPaginated(page, pageSize, filters?)` - Busca artworks com paginação

#### Mutations (Escrita - Admin)

- `useCreateArtwork()` - Criar novo artwork
- `useUpdateArtwork()` - Atualizar artwork existente
- `useDeleteArtwork()` - Deletar artwork

### 📚 **useSeries.ts**

Hooks para operações CRUD com séries:

#### Queries (Leitura)

- `useSeries(options?)` - Busca todas as séries
- `useSeriesBySlug(slug)` - Busca série específica por slug
- `useSeriesWithArtworks()` - Busca séries incluindo artworks
- `useSeriesArtworks(seriesId)` - Busca artworks de uma série específica

#### Mutations (Escrita - Admin)

- `useCreateSeries()` - Criar nova série
- `useUpdateSeries()` - Atualizar série existente
- `useDeleteSeries()` - Deletar série
- `useAddArtworkToSeries()` - Adicionar artwork a uma série
- `useRemoveArtworkFromSeries()` - Remover artwork de uma série

### 🏺 **useArtifacts.ts**

Hooks para operações CRUD com artifacts:

#### Queries (Leitura)

- `useArtifacts()` - Busca todos os artifacts
- `useArtifactById(id)` - Busca artifact específico por ID
- `useArtifactsPaginated(page, pageSize)` - Busca artifacts com paginação

#### Mutations (Escrita - Admin)

- `useCreateArtifact()` - Criar novo artifact
- `useUpdateArtifact()` - Atualizar artifact existente
- `useDeleteArtifact()` - Deletar artifact

### 📄 **useAboutPage.ts**

Hooks para operações com página About:

#### Queries (Leitura)

- `useAboutPage()` - Busca conteúdo da página About

#### Mutations (Escrita - Admin)

- `useCreateAboutPage()` - Criar conteúdo da página About
- `useUpdateAboutPage()` - Atualizar conteúdo da página About
- `useUpsertAboutPage()` - Criar ou atualizar (recomendado para singletons)

### 👤 **useUserRoles.ts**

Hooks para sistema de autenticação e autorização:

#### Queries (Leitura)

- `useCurrentUserRole(userId?)` - Busca role do usuário atual
- `useIsAdmin(userId?)` - Verifica se usuário é admin
- `useUserRoles()` - Busca todos os user roles (Admin only)
- `useUserRoleById(userId)` - Busca role de usuário específico (Admin only)

#### Mutations (Escrita - Admin)

- `useCreateUserRole()` - Criar role para usuário
- `useUpdateUserRole()` - Atualizar role de usuário
- `useDeleteUserRole()` - Deletar role de usuário
- `usePromoteToAdmin()` - Promover usuário a admin
- `useDemoteFromAdmin()` - Rebaixar admin para usuário comum

### 🗂️ **useStorage.ts**

Hooks para upload e gerenciamento de arquivos:

#### File Operations

- `useUploadFile()` - Upload de arquivo único
- `useUploadMultipleFiles()` - Upload de múltiplos arquivos
- `useDeleteFile()` - Deletar arquivo
- `useMoveFile()` - Mover/renomear arquivo

#### File Listing & URLs

- `useListFiles(bucket, folder?)` - Listar arquivos em bucket/pasta
- `useFileUrl(filePath, bucket?)` - Obter URL pública de arquivo
- `useDownloadFile()` - Gerar URL de download

#### Utility Functions

- `validateFileType(file, allowedTypes)` - Validar tipo de arquivo
- `validateFileSize(file, maxSizeInMB)` - Validar tamanho do arquivo
- `generateUniqueFileName(originalName, prefix?)` - Gerar nome único

### 🔍 **usePortfolio.ts**

Hooks compostos que combinam múltiplas entidades:

#### Composite Queries

- `usePortfolioData()` - Dados completos do portfólio
- `useHomepageData()` - Dados otimizados para homepage
- `usePortfolioSearch(searchTerm)` - Busca global no portfólio
- `useFilteredArtworks(filters)` - Filtros avançados para artworks
- `usePortfolioStats()` - Estatísticas do portfólio
- `useAvailableYears()` - Anos disponíveis (para filtros)
- `useAvailableTypes()` - Tipos de artwork disponíveis (para filtros)

### ⚙️ **useDebounce.ts**

Hook utilitário para debouncing de valores.

## Como Usar

### Importação

```typescript
// Importar hooks específicos
import { useArtworks, useFeaturedArtworks } from '@/hooks/useArtworks'
import { useSeries } from '@/hooks/useSeries'

// Ou importar do índice principal
import {
  useArtworks,
  useFeaturedArtworks,
  useSeries,
  usePortfolioData
} from '@/hooks'
```

### Exemplos de Uso

#### 1. Buscar artworks em destaque

```typescript
function FeaturedArtworks() {
  const { data: artworks, isLoading, error } = useFeaturedArtworks(6)

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error.message}</div>

  return (
    <div>
      {artworks?.map(artwork => (
        <div key={artwork.id}>{artwork.title}</div>
      ))}
    </div>
  )
}
```

#### 2. Buscar artwork por slug

```typescript
function ArtworkDetail({ slug }: { slug: string }) {
  const { data: artwork, isLoading } = useArtworkBySlug(slug)

  if (isLoading) return <div>Carregando...</div>

  return <div>{artwork?.title}</div>
}
```

#### 3. Busca com filtros

```typescript
function FilteredArtworks() {
  const { data: artworks } = useFilteredArtworks({
    featured: true,
    type: 'digital',
    year: 2024,
    sortBy: 'newest',
    limit: 12
  })

  return (
    <div>
      {artworks?.map(artwork => (
        <div key={artwork.id}>{artwork.title}</div>
      ))}
    </div>
  )
}
```

#### 4. Operações de admin (mutations)

```typescript
function AdminPanel() {
  const createArtwork = useCreateArtwork()
  const updateArtwork = useUpdateArtwork()
  const deleteArtwork = useDeleteArtwork()

  const handleCreate = () => {
    createArtwork.mutate({
      title: 'Novo Artwork',
      slug: 'novo-artwork',
      type: 'digital'
      // Imagem será resolvida via helpers getImageUrlFromSlug(slug)
    })
  }

  const handleUpdate = (id: string) => {
    updateArtwork.mutate({
      id,
      title: 'Título Atualizado'
    })
  }

  const handleDelete = (id: string) => {
    deleteArtwork.mutate(id)
  }

  return (
    <div>
      <button onClick={handleCreate}>Criar</button>
      {/* outros botões */}
    </div>
  )
}
```

#### 5. Upload de arquivos

```typescript
function FileUpload() {
  const uploadFile = useUploadFile()

  const handleUpload = (file: File) => {
    uploadFile.mutate({
      file,
      options: {
        folder: 'artworks',
        fileName: `artwork-${Date.now()}.jpg`
      }
    }, {
      onSuccess: (data) => {
        console.log('Upload concluído:', data.publicUrl)
      }
    })
  }

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
      }}
    />
  )
}
```

## Configuração de Cache

Todos os hooks utilizam estratégias de cache otimizadas:

- **Queries frequentes**: 5 minutos de staleTime, 10 minutos de cacheTime
- **Dados estáticos**: 10-30 minutos de staleTime
- **URLs de arquivos**: Cache infinito (não mudam)
- **Busca/filtros**: 30 segundos a 2 minutos de staleTime

## Query Keys

Cada hook utiliza query keys estruturadas para invalidação eficiente:

```typescript
// Exemplos de query keys
;['artworks'][('artworks', 'list', filters)][('artworks', 'detail', slug)][ // Todos os artworks // Lista filtrada // Artwork específico
  ('series', 'detail', slug)
][('portfolio-search', searchTerm)] // Série específica // Resultados de busca
```

## Tratamento de Erros

Todos os hooks incluem tratamento de erro consistente:

- Errors do Supabase são propagados
- Loading states são fornecidos
- Retry policies configuradas conforme necessário

## Tipo Safety

Todos os hooks são completamente tipados usando os tipos gerados do Supabase:

- `Tables<'table_name'>` para tipos de linha
- `TablesInsert<'table_name'>` para inserções
- `TablesUpdate<'table_name'>` para atualizações

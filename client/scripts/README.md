# Omentejovem Database Seed

Este diretório contém scripts para popular o banco de dados Supabase com os dados históricos do projeto Omentejovem, migrando da estrutura antiga para o novo modelo CMS.

## Arquivos

- `seed-database.sql` - Script SQL principal para popular o banco de dados
- `validate-seed.ts` - Script TypeScript para validação e análise dos dados
- `check-admin.ts` - Script para verificar e configurar permissões de admin

## Estrutura dos Dados

O seed inclui dados de todas as principais coleções do Omentejovem:

### Séries

1. **The Cycle** - Coleção principal com "The Flower", "The Seed" e "The Tree"
2. **OMENTEJOVEM 1/1s** - Peças únicas da coleção principal
3. **Shapes & Colors** - Série completa numerada (Primeiro → Décimo)
4. **OMENTEJOVEM's Editions** - Edições limitadas incluindo "Ether-Man", "Mc Moon", etc.
5. **Tezos Collection** - Obras históricas do Tezos/OBJKT
6. **Stories on Circles** - Nova série com 10 peças
7. **Other Platforms** - Peças de outras plataformas

### Dados Inclusos

- **47 artworks** com metadados completos
- **7 séries** com relacionamentos many-to-many
- **3 artifacts** para showcase de coleções físicas
- **Página About** com conteúdo inicial
- **Datas de mint** precisas quando disponíveis
- **Links para marketplaces** (OpenSea, OBJKT)

## Como Usar

### 1. Preparação do Banco

Primeiro, execute o setup inicial do banco:

```sql
-- No Supabase SQL Editor, execute:
-- client/supabase-setup.sql
```

### 2. Executar o Seed

Execute o script de seed no Supabase SQL Editor:

```sql
-- No Supabase SQL Editor, execute:
-- client/scripts/seed-database.sql
```

### 3. Configurar Admin

Para configurar seu usuário como admin, edite o final do arquivo `seed-database.sql` e descomente a seção:

```sql
-- Substitua 'seu-email@exemplo.com' pelo seu email real
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'seu-email@exemplo.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### 4. Validar Dados (Opcional)

Para validar que tudo foi inserido corretamente:

```bash
# Instalar dependências se necessário
npm install @supabase/supabase-js

# Configurar variáveis de ambiente
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Executar validação
npx tsx scripts/validate-seed.ts validate

# Gerar relatório de dados
npx tsx scripts/validate-seed.ts report
```

## Mapeamento de Dados Antigos → Novos

### Tokens Ethereum → Artworks

- `token-metadata.json` → tabela `artworks`
- `mint-dates.json` → campo `mint_date`
- `nfts.json` → lista de contratos/tokens processados

### Tezos → Artworks

- `tezos-data.json` → tabela `artworks`
- Metadados IPFS → descrições JSONB

### Imagens Nova Série

- `public/new_series/*.jpg` → tabela `artworks`
- Nomes dos arquivos → títulos das obras

## Características do Seed

### Dados Reais

- ✅ Todas as datas de mint são reais (quando disponíveis)
- ✅ URLs de imagem apontam para CDNs reais (Alchemy, Arweave, IPFS)
- ✅ Links de mint apontam para OpenSea/OBJKT reais
- ✅ Metadados preservam descrições originais

### Consistência

- ✅ IDs UUID fixos para relacionamentos estáveis
- ✅ Slugs consistentes gerados dos títulos
- ✅ Tipos corretos (single/edition)
- ✅ Flags is_featured e is_one_of_one apropriadas

### Completude

- ✅ Todas as principais coleções incluídas
- ✅ Relacionamentos série-artwork mapeados
- ✅ Artifacts para elementos especiais
- ✅ Página About com conteúdo inicial

## Troubleshooting

### Erro de Permissão

Se você receber erros de RLS (Row Level Security), certifique-se de:

1. Estar autenticado no Supabase
2. Ter configurado seu usuário como admin
3. As políticas RLS estarem ativas

### Imagens Não Carregam

As URLs de imagem apontam para:

- Alchemy CDN (Ethereum NFTs)
- Arweave (metadados permanentes)
- IPFS (Tezos NFTs)
- Arquivos locais (nova série)

Certifique-se de que os arquivos da nova série estejam em `public/new_series/`.

### Dados Duplicados

O seed usa `ON CONFLICT` para evitar duplicatas. É seguro executar múltiplas vezes.

## Próximos Passos

Após executar o seed com sucesso:

1. **Testar Admin Dashboard** - Verifique se consegue editar artworks
2. **Verificar Frontend** - Confirme se as séries aparecem corretamente
3. **Ajustar Dados** - Use o admin para refinar descrições se necessário
4. **Backup** - Faça backup do banco antes de modificações

## Estrutura do Projeto

```
client/
├── public/
│   ├── new_series/           # Imagens da nova série
│   ├── token-metadata.json   # Metadados Ethereum
│   ├── mint-dates.json       # Datas de mint
│   ├── tezos-data.json       # Dados Tezos
│   └── nfts.json            # Lista de NFTs
├── scripts/
│   ├── seed-database.sql     # Seed principal
│   └── validate-seed.ts      # Validação
└── supabase-setup.sql       # Setup inicial do banco
```

Este seed preserva toda a história do projeto Omentejovem enquanto migra para a nova arquitetura CMS de forma consistente e pragmática.

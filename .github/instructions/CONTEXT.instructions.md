# Estrutura das tabelas antes da migration (2025-09)

## artworks

id: string (PK)
slug: string
title: string
status: string
type: string
created_at: string | null
updated_at: string | null
blockchain: string | null
collection_slug: string | null
contract_address: string | null
description: Json | null
editions_total: number | null
is_featured: boolean | null
is_one_of_one: boolean | null
mint_date: string | null
mint_link: string | null
posted_at: string | null
token_id: string | null
video_url: string | null

## series

id: string (PK)
slug: string
name: string
created_at: string | null
updated_at: string | null

## artifacts

id: string (PK)
title: string
status: string
description: string | null
link_url: string | null
highlight_video_url: string | null
created_at: string | null
updated_at: string | null

## about_page

id: string (PK)
content: Json
created_at: string | null
updated_at: string | null
exhibitions: Json | null
press: Json | null
socials: Json | null

- **Migrations de schema** (alterações em tabelas, colunas, constraints) devem ser feitas **exclusivamente pela CLI do Supabase**:
  1. Rode `supabase migration new nome-da-migration` para gerar o arquivo.
  2. Edite o arquivo gerado na pasta `supabase/migrations/` para adicionar/remover colunas, constraints, etc.
  3. Aplique a migration com `supabase db push`.
     Nunca crie migrations SQL manuais fora desse fluxo.

# Orientação sobre Migrations e Scripts de Dados

- **Migrations de schema** (alterações em tabelas, colunas, constraints) devem ser feitas **exclusivamente pela CLI do Supabase**:
  1. Rode `supabase migration new nome-da-migration` para gerar o arquivo.
  2. Edite o arquivo gerado na pasta `supabase/migrations/` para adicionar/remover colunas, constraints, etc.
  3. Aplique a migration com `supabase db push`.
     Nunca crie migrations SQL manuais fora desse fluxo.
- **Scripts de alteração ou migração de dados** (atualização de registros, preenchimento de campos, normalização, etc) devem ser feitos em **scripts JS** na pasta `scripts/`, seguindo o padrão já utilizado no projeto.
- Não misture scripts de dados com migrations de schema. Cada um deve seguir seu fluxo e ferramenta apropriada.

# Orientação sobre Migrations e Scripts de Dados

- **Migrations de schema** (alterações em tabelas, colunas, constraints) devem ser feitas **exclusivamente pela CLI do Supabase** (`supabase migration new`, `supabase db push`, etc). Nunca crie migrations SQL manuais fora desse fluxo.
- **Scripts de alteração ou migração de dados** (atualização de registros, preenchimento de campos, normalização, etc) devem ser feitos em **scripts JS** na pasta `scripts/`, seguindo o padrão já utilizado no projeto.
- Não misture scripts de dados com migrations de schema. Cada um deve seguir seu fluxo e ferramenta apropriada.

# Copilot Context Instructions

## Como o Copilot deve entender o contexto do projeto

- O projeto segue arquitetura backend-oriented, com lógica centralizada em Services e BaseService (ver `.agents/ARCHITECTURE_PATTERNS.md`).
- Nunca use o cliente Supabase diretamente em componentes ou páginas; sempre utilize Services especializados.
- O contexto técnico completo está modularizado na pasta `.agents/`:
  - **AI_CONTEXT_MASTER.md**: índice principal para agentes de IA.
  - **TECH_STACK.md**: stack técnica (Next.js, Supabase, React, etc).
  - **DEVELOPMENT_PATTERNS.md**: convenções de código e padrões de desenvolvimento.
  - **DATABASE_SCHEMA.md**: schema do Supabase e políticas RLS.
  - **BACKEND_ORIENTED_APPROACH.md**: detalhes da abordagem backend-oriented.
  - **PR_GUIDELINES.md**: diretrizes para PRs (título em inglês, conteúdo em português, checklist, etc).
- Para migrações, deploy, e performance, consulte os arquivos específicos em `.agents/` e `docs/`.
- O arquivo `AGENTS.md` serve como índice e resumo executivo, apontando para os módulos especializados.
- Sempre siga as convenções descritas nos arquivos de contexto antes de implementar, revisar ou sugerir mudanças.

## Referências rápidas

- `.agents/AI_CONTEXT_MASTER.md`: índice principal
- `AGENTS.md`: visão geral e links
- `docs/`: documentação geral para devs

# Contextualização Técnica Inicial

Durante a análise do código, foram identificados os principais pontos de acoplamento da lógica antiga de scaffold, subpastas dinâmicas e helpers de path/slug para imagens:

- `src/utils/upload-helpers.ts`: helpers de upload e geração de filename/path.
- `src/utils/storage.ts`: helpers para geração de URL pública e path de imagem.
- `src/services/image-upload.service.ts`: lógica de upload baseada em slug/id e geração de paths.
- `src/utils/image-compatibility.ts`: camada de compatibilidade slug → id.
- `src/utils/image-helpers.ts`: helpers para fallback e processamento de listas.

Esses arquivos concentram a lógica que será eliminada ou simplificada na refatoração, migrando para o padrão único de pasta `images` e campos diretos no banco.

---

# PLANO DE MIGRAÇÃO PARA ESTRUTURA SIMPLIFICADA DE IMAGENS — 2025/09

## Objetivo

Simplificar radicalmente o gerenciamento de imagens:

- Usar apenas uma pasta única `images` para todos os arquivos de imagem.
- Salvar imagens com hash único no filename para evitar conflitos.
- Adicionar dois campos em todas as tabelas de gerenciamento CRUD (artworks, series, artifacts, about): `filename` e `imageUrl`.
- Eliminar toda a lógica de scaffold, subpastas dinâmicas e helpers complexos de path/slug.
- Facilitar o acesso às imagens no frontend via campo `imageUrl`.

---

## Novo Plano de Migração de Imagens

### 1. Backup e Análise Inicial

- Realizar backup completo das tabelas afetadas (`artworks`, `series`, `artifacts`, `about`).
- Listar e analisar todos os arquivos existentes no bucket S3/Supabase Storage para garantir que nenhuma imagem será perdida.
- Gerar relatório de correspondência entre registros do banco e arquivos de imagem.

### 2. Migração das Imagens para Estrutura Simplificada

- Para cada registro de artwork, series, artifacts e about:
  - Identificar a(s) imagem(ns) original(is) na estrutura antiga:
    - Exemplo: `artworks/raw/{slug}.{ext}` ou `{scaffold}/{raw,optimized}/{slug}.{ext}`
  - Copiar a imagem para a nova estrutura:
    - Todas as imagens vão para `media/images/{id}.{ext}`
    - Se for otimizada, para `media/images/optimized/{id}.{ext}`
  - O nome do arquivo será sempre `{id}.{ext}` (usando o id único do registro e a extensão original)
  - Atualizar os campos `filename` e `imageUrl` no banco para refletir o novo nome e path
  - o campo `imageUrl` deve ser obtido usando o helper de geração de URL pública do Supabase Storage

### 3. Atualização do Frontend e APIs

- Refatorar o frontend e as APIs para:
  - Buscar imagens apenas na pasta `images` (e `images/optimized` se aplicável)
  - Utilizar os campos `filename` e `imageUrl` diretamente, sem lógica de scaffold, slug ou subpastas dinâmicas
  - Eliminar helpers antigos de path/slug
  - Garantir fallback e exibição correta mesmo para imagens otimizadas

### 4. Validação e Limpeza

- Validar se todas as imagens estão acessíveis via `imageUrl`.
- Remover código morto e arquivos não utilizados.
- Rodar testes e validações finais.

### 5. Documentação

- Atualizar README e docs:
  - Instruções para rodar os scripts de migração
  - Detalhes sobre o novo padrão de imagens
  - Checklist de validação pós-migração

### 1. Backup e Análise Inicial

- Realizar backup completo das tabelas afetadas (`artworks`, `series`, `artifacts`, `about`).
- Listar e analisar todos os arquivos existentes no bucket S3/Supabase Storage para garantir que nenhuma imagem será perdida.
- Gerar relatório de correspondência entre registros do banco e arquivos de imagem.

### 2. Alteração do Schema

- Adicionar os campos `filename` (string) e `imageUrl` (string) nas tabelas:
  - `artworks`
  - `series`
  - `artifacts`
  - `about`
- Gerar scripts SQL para aplicar as alterações (com opção de dry run).

### 3. Migração dos Dados

- Preencher os novos campos para registros existentes:
  - `filename`: nome do arquivo da imagem (com hash, se necessário).
  - `imageUrl`: URL pública da imagem no bucket `images`.
- Gerar scripts SQL para migrar os dados, com logs e validação.

### 4. Refatoração do Código

- Atualizar todo o código para:
  - Usar apenas a pasta `images` para uploads e downloads.
  - Utilizar os campos `filename` e `imageUrl` diretamente.
  - Eliminar helpers antigos e lógica de scaffold/pastas dinâmicas.

### 5. Validação e Limpeza

- Validar se todas as imagens estão acessíveis via `imageUrl`.
- Remover código morto e arquivos não utilizados.
- Rodar testes e validações finais.

### 6. Documentação

- Criar/atualizar README com:
  - Instruções para rodar os scripts de backup, migração e dry run.
  - Detalhes sobre o novo padrão de imagens.
  - Checklist de validação pós-migração.

---

## Observações Importantes

- Sempre execute o backup antes de qualquer alteração.
- Analise o bucket de imagens para garantir que não há arquivos órfãos ou inconsistentes.
- Scripts de migração devem ser idempotentes e seguros para rodar em produção.
- O processo deve ser validado em ambiente de staging antes de ir para produção.

---

## Checklist Rápido

- [ ] Backup das tabelas e imagens
- [ ] Análise dos arquivos no bucket
- [ ] Migração das imagens para `images/{id}.{ext}`
- [ ] Atualização dos campos no banco
- [ ] Refatoração do frontend e APIs
- [ ] Validação final
- [ ] Atualização da documentação

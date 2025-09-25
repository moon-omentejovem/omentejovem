# Migração Simplificada do Sistema de Imagens

Este guia descreve o processo para migrar o sistema de imagens para o novo padrão, centralizando tudo na pasta `images` e utilizando os campos `filename` e `imageUrl` em todas as tabelas de gerenciamento.

## 1. Backup e Migrations de Schema

- Gere um backup completo do banco de dados antes de qualquer alteração.
- Crie a migration de schema usando a CLI do Supabase:

```sh
supabase migration new add-image-fields
# Edite o arquivo gerado para adicionar os campos nas tabelas:
#   artworks, series, artifacts, about_page
supabase db push
```

## 2. Migração dos Dados

- Após rodar a migration de schema, execute o script JS para preencher os novos campos:

```sh
node scripts/migrate-image-fields.js
```

- O script irá popular os campos `filename` e `imageUrl` em:
  - `artworks` (usa slug e id)
  - `series` (usa slug e id)
  - `artifacts` (usa title e id)
  - `about_page` (usa apenas id)

- O padrão de filename é `<slug-ou-title>-<id>.webp` e a URL segue o padrão do bucket `images`.

## 3. Validação

- Verifique se todos os registros possuem os campos preenchidos corretamente:

```sql
SELECT id, filename, imageUrl FROM artworks WHERE filename IS NULL OR imageUrl IS NULL;
SELECT id, filename, imageUrl FROM series WHERE filename IS NULL OR imageUrl IS NULL;
SELECT id, filename, imageUrl FROM artifacts WHERE filename IS NULL OR imageUrl IS NULL;
SELECT id, filename, imageUrl FROM about_page WHERE filename IS NULL OR imageUrl IS NULL;
```

- Valide se as imagens estão acessíveis via URL pública.

## 4. Checklist Final

- [ ] Backup realizado
- [ ] Migration de schema aplicada via CLI do Supabase
- [ ] Script JS de migração executado
- [ ] Dados validados
- [ ] Código refatorado para novo padrão

---

> Siga sempre o padrão: migrations de schema via CLI do Supabase, scripts de dados em JS na pasta `scripts/`.

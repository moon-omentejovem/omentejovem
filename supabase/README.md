# Migração de Projeto Supabase

Guia oficial para migrar o CMS para um novo projeto Supabase mantendo dados e
arquivos.

## 1. Preparação

1. Confirme acesso aos projetos (antigo e novo) e às respectivas chaves
   **Service Role**.
2. Instale o CLI do Supabase (`npm install -g supabase`).
3. Garanta que você possui as variáveis do projeto atual em `.env.local`.

## 2. Exportar o Supabase atual

```bash
# (Opcional) use variáveis específicas para o projeto de origem
export SUPABASE_SOURCE_URL=https://<id>.supabase.co
export SUPABASE_SOURCE_SERVICE_ROLE_KEY=<service_role_antiga>

node scripts/migration/export-supabase-data.js
```

O comando gera `backups/supabase-export-<timestamp>.json` contendo:

- Tabelas `series`, `artworks`, `series_artworks`, `artifacts`, `about_page` e
  `user_roles`.
- Lista completa dos arquivos dos buckets `media` e `cached-images`.

## 3. Clonar buckets de storage

O arquivo de export não contém os binários das imagens. Copie os objetos do
bucket antigo para o novo:

```bash
# Faz download local (exemplo usando supabase CLI)
supabase storage cp --project-ref <origem> --from media --to ./storage/media

# Envia os arquivos para o novo projeto
supabase storage cp --project-ref <destino> --from ./storage/media --to media

# Repita para o bucket cached-images (se estiver em uso)
```

## 4. Criar o novo projeto Supabase

1. Crie um projeto pelo dashboard.
2. Configure as variáveis no `.env.local` para apontar para o novo projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<novo-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_nova>
SUPABASE_SERVICE_ROLE_KEY=<service_role_nova>
SUPABASE_TARGET_URL=https://<novo-id>.supabase.co
SUPABASE_TARGET_SERVICE_ROLE_KEY=<service_role_nova>
```

3. Aplique o schema:

```bash
# via CLI
supabase db push

# ou diretamente no dashboard executando supabase-setup.sql
psql $DATABASE_URL -f supabase-setup.sql
```

## 5. Importar dados para o novo projeto

```bash
# Garante que as variáveis TARGET apontam para o novo projeto
node scripts/migration/import-supabase-data.js \
  --input=backups/supabase-export-2025-xx-xx.json --truncate
```

- `--truncate` remove registros existentes antes de inserir.
- `--dry-run` informa quantos registros seriam importados sem alterar o banco.

## 6. Validar a migração

```bash
# Confirma credenciais e dados
node scripts/utils/deploy-helper.js

# Health check detalhado
node scripts/utils/health-check.js
```

Corrija eventuais alertas antes de prosseguir.

## 7. Atualizar aplicação

1. Atualize as variáveis de ambiente no provedor (Vercel, etc.).
2. Execute `yarn build` para validar localmente.
3. Faça o deploy. O `postbuild` rodará o seed automaticamente — ele detecta que
   o banco já contém dados e não duplica registros.

## 8. Checklist rápido

- [ ] Backup JSON exportado e armazenado com segurança.
- [ ] Buckets `media` e `cached-images` copiados para o projeto novo.
- [ ] Schema aplicado (tabelas, RLS e buckets criados).
- [ ] Dados importados sem erros.
- [ ] Health check e deploy helper executados.
- [ ] Variáveis de ambiente atualizadas.

---

Para detalhes da API e CLI consulte [`docs/SUPABASE-MIGRATIONS.md`](../docs/SUPABASE-MIGRATIONS.md).

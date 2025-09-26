# Contexto de Migração de Dados - Omentejovem

Atualizado para refletir o fluxo moderno de migração entre projetos Supabase.

## 🎯 Objetivo

Permitir clonar o CMS completo (banco + storage) para um novo projeto Supabase
sem depender dos antigos arquivos JSON.

## 📦 Visão Geral

- **Origem**: Projeto Supabase em produção (dados já consolidados).
- **Destino**: Novo projeto Supabase (produção ou staging).
- **Ferramentas**: `scripts/migration/export-supabase-data.js` e
  `scripts/migration/import-supabase-data.js`.

## 🔄 Workflow Recomendo

1. **Exportação**
   - `node scripts/migration/export-supabase-data.js`
   - Gera `backups/supabase-export-<timestamp>.json` com todas as tabelas chave e
     manifesto dos buckets `media` e `cached-images`.
2. **Cópia do Storage**
   - Utilize o Supabase CLI (`supabase storage cp`) ou outro utilitário (ex: `rclone`)
     para copiar os arquivos binários entre projetos.
3. **Criação de Schema**
   - Execute `supabase db push` ou rode `supabase-setup.sql` no projeto de destino.
4. **Importação**
   - `node scripts/migration/import-supabase-data.js --input=... --truncate`
   - Mantém os mesmos UUIDs garantindo integridade dos relacionamentos.
5. **Validação**
   - `node scripts/utils/deploy-helper.js`
   - `node scripts/utils/health-check.js`

## 🗃️ Tabelas consideradas essenciais

- `artworks`
- `series`
- `series_artworks`
- `artifacts`
- `about_page`
- `user_roles`

Os scripts tratam dessas tabelas automaticamente. Outras tabelas podem ser
incluídas no futuro conforme necessário.

## 🧰 Variáveis de Ambiente Importantes

- `SUPABASE_SOURCE_URL` / `SUPABASE_SOURCE_SERVICE_ROLE_KEY`
- `SUPABASE_TARGET_URL` / `SUPABASE_TARGET_SERVICE_ROLE_KEY`

Quando não definidas, os scripts usam `NEXT_PUBLIC_SUPABASE_URL` e
`SUPABASE_SERVICE_ROLE_KEY` como fallback.

## ✅ Benefícios da Abordagem Atual

- Evita regressão para dados legados em JSON.
- Mantém relações e UUIDs originais (import usa `upsert` por `id`).
- Permite dry-run para conferir contagens antes de modificar o banco.
- Gera manifesto de storage para facilitar conferência de arquivos.

## 🧪 Checklist de Validação

- [ ] Export executada e arquivo salvo em `backups/`.
- [ ] Buckets `media` e `cached-images` copiados para o novo projeto.
- [ ] Schema aplicado com sucesso (`supabase-setup.sql`).
- [ ] Import finalizada sem erros.
- [ ] Health check concluído sem pendências.

---

Documentação operacional detalhada: [`supabase/README.md`](../supabase/README.md).

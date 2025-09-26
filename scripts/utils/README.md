# 🛠️ Scripts Utilitários

Coleção de utilitários executados com frequência durante deploys e operações do
CMS.

## `vercel-seed.js`
Popula automaticamente o banco após o `next build`. O script faz insert apenas
quando detecta que o banco está vazio, evitando duplicidades.

```bash
# Execução manual (útil em ambientes locais ou staging)
node scripts/utils/vercel-seed.js
```

## `backup-database.js`
Cria um backup JSON do banco e do storage.

```bash
node scripts/utils/backup-database.js
```

O arquivo é salvo em `backups/backup-<timestamp>.json`.

## `health-check.js`
Executa testes de conectividade, integridade do banco e consistência do storage.

```bash
node scripts/utils/health-check.js
```

Retorna um objeto com o resultado da verificação (útil para CI/CD) e imprime um
relatório amigável.

## `deploy-helper.js`
Valida variáveis de ambiente, confirma se o banco contém artworks e executa o
health check. Ideal para rodar após um deploy.

```bash
node scripts/utils/deploy-helper.js
```

## `seed-database.sql`
Seed SQL estático com dados de demonstração. Execute via CLI do Supabase ou
psql quando preferir uma abordagem declarativa.

---

Para fluxos completos de migração consulte o guia em
[`supabase/README.md`](../../supabase/README.md).

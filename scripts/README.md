# Scripts Omentejovem

Coleção de utilitários usados para operar o CMS em produção. Os scripts são
agrupados em duas categorias principais:

- `migration/` – ferramentas para migrar dados entre projetos Supabase
- `utils/` – tarefas recorrentes (backup, seed, health check, pós-deploy)

## 📦 Migração de Dados

### `migration/export-supabase-data.js`
Gera um snapshot completo do Supabase atual (tabelas e lista de arquivos de
storage).

```bash
# Exporta usando as variáveis de ambiente atuais
node scripts/migration/export-supabase-data.js

# Exporta para um caminho customizado
node scripts/migration/export-supabase-data.js --output=backups/meu-backup.json
```

### `migration/import-supabase-data.js`
Restaura um snapshot gerado pelo script anterior para um novo projeto Supabase.

```bash
# Importa dados para o projeto configurado nas variáveis de ambiente
node scripts/migration/import-supabase-data.js --input=backups/meu-backup.json

# Força limpeza das tabelas antes de importar
node scripts/migration/import-supabase-data.js --input=backup.json --truncate

# Apenas mostra quantos registros seriam importados
node scripts/migration/import-supabase-data.js --input=backup.json --dry-run
```

## 🛠️ Utilitários Essenciais

### `utils/vercel-seed.js`
Executado automaticamente após o `next build` para garantir que o banco tenha os
dados mínimos de demonstração. Pode ser executado manualmente para popular um
banco vazio.

### `utils/backup-database.js`
Cria um backup JSON do estado atual (similar ao export), útil antes de
alterações críticas.

### `utils/health-check.js`
Executa uma verificação completa (conectividade, dados, storage e integridade).
Pode ser utilizado em pipelines de CI/CD.

### `utils/deploy-helper.js`
Valida variáveis de ambiente, confirma a presença de dados e dispara o health
check completo após um deploy.

### `utils/seed-database.sql`
Seed SQL estático com dados de demonstração. Útil para popular ambientes locais
quando é preferível usar SQL puro.

---

Para mais detalhes sobre o fluxo de migração consulte
[`supabase/README.md`](../supabase/README.md).

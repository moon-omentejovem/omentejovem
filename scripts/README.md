# Extract PR descriptions

This small Node.js script scans the git history for merge commits, extracts PR numbers when possible and writes a `PR_DESCRIPTIONS.md` file at the repository root containing the title, author, date and the PR body (description).

## Usage

From the repository root run:

PowerShell:

```powershell
node .\scripts\extract-pr-descriptions.js
```

If you have a `GITHUB_TOKEN` (recommended to avoid rate-limits and to fetch full PR metadata):

```powershell
$env:GITHUB_TOKEN = 'ghp_xxx'
node .\scripts\extract-pr-descriptions.js
```

## Output location

By default the script writes the generated file to the repository root as `PR_DESCRIPTIONS.md`.
Starting now the script will write into the `reports/` folder at the repository root. The folder will be created automatically if it does not exist.

When you use `--fetch-remote` the script will create a file named with the target repo to avoid collisions, for example:

```
reports/PR_DESCRIPTIONS_luismtns_omentejovem-project_remote.md
```

## Target another repository

You can target a different GitHub repository (for example the legacy repo `luismtns/omentejovem-project`) using `--repo` (owner/repo or a full git URL):

PowerShell:

```powershell
# target by owner/repo
node .\scripts\extract-pr-descriptions.js --repo luismtns/omentejovem-project

# or by full git URL
node .\scripts\extract-pr-descriptions.js --repo https://github.com/luismtns/omentejovem-project.git
```

## Fetch merged PRs directly from remote

If you run the script in a checkout that has no local merge commits (or you want to enumerate merged PRs from the remote project), add `--fetch-remote` to list closed & merged PRs from the GitHub API:

```powershell
# requires GITHUB_TOKEN or gh auth to access private repos; will fall back to local scanning
node .\scripts\extract-pr-descriptions.js --repo luismtns/omentejovem-project --fetch-remote
```

## Try it

PowerShell (quick run using your repo):

```powershell
# simple scan (local merges authored by your git user)
node .\scripts\extract-pr-descriptions.js

# target legacy repo and write remote results into reports/
node .\scripts\extract-pr-descriptions.js --repo luismtns/omentejovem-project --fetch-remote
```

Outputs will be written to `reports/` at the repository root. Remote fetches create a suffixed filename to avoid collisions.

## What it does

- Finds merge commits (`git log --merges`).
- Attempts to parse PR numbers from merge commit subjects/bodies.
- If `GITHUB_TOKEN` is available and the remote is a GitHub repo, it fetches PR details from the GitHub API.
- Writes `PR_DESCRIPTIONS.md` with the collected information.

## Notes and caveats

- The script expects the `origin` remote to be a GitHub URL to build links to PRs. If the URL can't be parsed, links will be omitted.
- If there are direct commits (no merge) they will not be included. This suits repositories that are "PR-first".
- The script is intentionally dependency-light (uses `axios` which is already in the project's dependencies). If you don't have `axios`, install it: `yarn add axios`.

## Improvements you can make

- Support multiple remotes or custom remote names.
- Accept an output path argument.
- Filter by date range or author.

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

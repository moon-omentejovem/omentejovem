# Legacy Data Migration & Seeding

Este módulo permite importar NFTs históricos para o banco Supabase a partir dos arquivos JSON em `public/legacy_data`.

## Como usar

### Seed básico

Roda o seed mínimo (series/artworks/artifacts/about):

```bash
node ../utils/vercel-seed.js
```

### Seed + Migração dos dados legados

Roda o seed básico e depois importa todos NFTs históricos dos arquivos JSON:

```bash
node ../utils/vercel-seed.js --legacy
```

- Idempotente: nunca duplica registros já existentes (checa pelo slug)
- Migração inclui artworks, séries e relacionamentos
- Não popula campos de imagem (novo padrão: imagens resolvidas por slug via storage)
- Logs detalhados no console (contagem de inseridos/ignorados)

### Rodar só a migração manualmente

```bash
node migrate-legacy-data.js
```

Mais detalhes em [../../docs/SEED-SYSTEM.md](../../docs/SEED-SYSTEM.md).

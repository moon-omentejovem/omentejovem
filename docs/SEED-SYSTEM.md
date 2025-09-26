# Sistema de Seed Automático

O seed roda automaticamente após o `next build` (hook `postbuild`). O objetivo é
preencher o banco com os dados mínimos necessários para que o CMS funcione logo
após um deploy.

## Fluxo

1. O Vercel executa `next build`.
2. O script `scripts/utils/vercel-seed.js` roda automaticamente.
3. Se o banco estiver vazio o seed insere séries, artworks, artifacts e a página
   "About" padrão.
4. Caso já existam dados nada é alterado.

## Execução manual

```bash
node scripts/utils/vercel-seed.js
```

O script usa `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` para se
conectar.

## Dados populados

- Séries base com covers de referência hospedadas em `/public`.
- Artworks demonstrativas com `imageurl` apontando para os assets locais.
- Artifacts de exemplo.
- Conteúdo inicial da página About.

## Recomendações

- Execute `node scripts/utils/backup-database.js` antes de alterar o seed.
- Após rodar manualmente, valide com `node scripts/utils/health-check.js`.
- Para replicar os dados em outro projeto utilize os scripts de migração
  documentados em [`supabase/README.md`](../supabase/README.md).

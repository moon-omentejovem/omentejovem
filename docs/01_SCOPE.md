# Scope

## In Scope

1. **CMS sem banco (Git-based)**

   - Conteúdo em `/content` (MDX/Markdown + frontmatter).
   - Coleções e obras como arquivos versionados.
   - Preview local de conteúdo durante o desenvolvimento.

2. **Stack & Code Cleanup**

   - Remover .NET, MongoDB, AWS e Docker.
   - Reorganizar repositório (Next.js puro).

3. **Migração de Conteúdo**

   - Baixa do servidor atual.
   - Conversão para o novo formato (`/content/collections/*.yml`, `/content/artworks/*.mdx`).
   - Imagens inicialmente em `/public/images`.

4. **Frontend & Build**
   - Next.js com **SSG/ISR**.
   - SEO, responsividade, performance.

## Optional (not included)

- **Storage externo barato** (ex.: Cloudflare R2 ou Vercel Blob) caso o repositório cresça demais.
- **Admin leve no /admin** (editor de Markdown + upload) que continue **sem banco**.

## Out of Scope

- Qualquer banco de dados (SQL/NoSQL).
- CMS headless pago/complexo.
- Infra pesada (containers, orquestração, etc.).

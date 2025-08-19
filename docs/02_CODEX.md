# Codex — O Mente Jovem

## Objetivos

- Operar **sem banco** e com **Next.js apenas**, priorizando custo quase zero e simplicidade.
- Garantir edição via Git (arquivos) com processo de build previsível e rápido.

## Arquitetura & Decisões

- **Next.js 14+ (App Router)** com **SSG/ISR**.
- **Conteúdo no repositório**:
  - `/content/collections/*.yml` (metadados de coleções)
  - `/content/artworks/*.mdx` (1 arquivo por obra, com frontmatter)
- **Imagens**:
  - Fase 1: `/public/images/...` (zero custo adicional).
  - Fase 2 (opcional): abstração de storage para mover imagens para R2/Blob sem quebrar o CMS.
- **Sem banco** (SQLite/Prisma fora do plano base).
- **SEO**: metadata por obra/coleção + sitemaps automáticos.
- **Acessibilidade**: `alt` descritivo, foco/tecla, contraste.

## Critérios de Aceitação

- [ ] Build estático funcional (coleções/obras renderizadas do `/content`).
- [ ] CRUD via Git: adicionar/editar/remover arquivos reflete no site após deploy.
- [ ] Imagens servidas de `/public/images` com `next/image`.
- [ ] Lighthouse OK (LCP < 2.5s; CLS < 0.1).
- [ ] Documentação de como criar uma obra e uma coleção.
- [ ] (Opcional) Toggle simples para trocar provedor de imagens futuramente.

## Rituais

- Checkpoints curtos + deploy de preview a cada marco.

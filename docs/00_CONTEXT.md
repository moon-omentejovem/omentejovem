# Context

O objetivo é **desacoplar completamente o banco de dados** e operar o portfólio do **O Mente Jovem** com a solução **mais barata e simples possível**, preferencialmente com **apenas Next.js** (sem serviços gerenciados complexos).

## Princípios

- **Sem banco**: conteúdo versionado no Git (MDX/Markdown + frontmatter YAML/JSON).
- **Barato por padrão**: hospedagem em Vercel (free/baixo custo) com **SSG/ISR**.
- **Autonomia**: editar arquivos em `/content` (obras, coleções) e dar commit → build publica.
- **Baixa complexidade**: nada de .NET, MongoDB, Docker, pipelines pesadas ou painéis caros.
- **Imagens**: inicialmente no repositório (`/public/images`) para custo zero; se volume crescer, migrar para um storage barato (ex.: R2/Blob) sem mudar o CMS (abstraído).

## Modelo mental

- **CMS = Git**: o “painel” é o próprio repositório. Cada obra é um arquivo `.mdx` com frontmatter (título, ano, coleção, edição, imagens, status).
- **Site = build estático**: Next.js gera páginas estáticas; atualizações acontecem em cada deploy.
- **Evolução opcional**: se necessário, adicionamos um admin leve (ex.: editor markdown no próprio site, protegido) **sem introduzir banco**.

# Copilot Context Instructions

## Como o Copilot deve entender o contexto do projeto

- O projeto segue arquitetura backend-oriented, com lógica centralizada em Services e BaseService (ver `.agents/ARCHITECTURE_PATTERNS.md`).
- Nunca use o cliente Supabase diretamente em componentes ou páginas; sempre utilize Services especializados.
- O contexto técnico completo está modularizado na pasta `.agents/`:
  - **AI_CONTEXT_MASTER.md**: índice principal para agentes de IA.
  - **TECH_STACK.md**: stack técnica (Next.js, Supabase, React, etc).
  - **DEVELOPMENT_PATTERNS.md**: convenções de código e padrões de desenvolvimento.
  - **DATABASE_SCHEMA.md**: schema do Supabase e políticas RLS.
  - **BACKEND_ORIENTED_APPROACH.md**: detalhes da abordagem backend-oriented.
  - **PR_GUIDELINES.md**: diretrizes para PRs (título em inglês, conteúdo em português, checklist, etc).
- Para migrações, deploy, e performance, consulte os arquivos específicos em `.agents/` e `docs/`.
- O arquivo `AGENTS.md` serve como índice e resumo executivo, apontando para os módulos especializados.
- Sempre siga as convenções descritas nos arquivos de contexto antes de implementar, revisar ou sugerir mudanças.

## Referências rápidas

- `.agents/AI_CONTEXT_MASTER.md`: índice principal
- `AGENTS.md`: visão geral e links
- `docs/`: documentação geral para devs

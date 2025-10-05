# PR_DESCRIPTIONS for luismtns/omentejovem

Generated: 2025-09-30T20:55:17.591Z


## Merge commit: Merge branch 'main' of github.com:luismtns/omentejovem
- Author: Luís Bovo
- Date: 2025-09-23 01:33:31 -0300


_No description found._

---

## PR #7: refactor: unify supabase middleware structure and eliminate duplications
- Author: luismtns
- Merged: 2025-09-11T07:55:08Z
- Link: https://github.com/luismtns/omentejovem/pull/7


## 📋 Resumo das Alterações

Refatoração completa da estrutura Supabase para eliminar duplicações de código e pastas, implementando uma arquitetura modular e concisa para o middleware de autenticação.

## ✨ Principais Funcionalidades

### 🆕 Novas Funcionalidades

- **Middleware Modular**: `/src/utils/supabase/middleware.ts` - Três funções especializadas (`updateSession`, `checkAdminAuth`, `handleAdminRoutes`)
- **Exports Centralizados**: `/src/utils/supabase/index.ts` - Importações unificadas para todos os clientes Supabase
- **Documentação Completa**: `/src/utils/supabase/README.md` - Guia detalhado de uso e padrões

### 🔧 Melhorias Existentes

- **Middleware Principal**: Reduzido de 100+ para 15 linhas de código limpo
- **Estrutura de Pastas**: Eliminação completa da duplicação entre utils e utils

## 🔄 Mudanças Técnicas

### 📦 Estrutura Reorganizada

```
Antes:
❌ /utils/supabase/ (duplicada)
❌ /src/utils/supabase/ (duplicada)
❌ Middleware com lógica duplicada

Depois:
✅ /src/utils/supabase/ (única pasta)
✅ Middleware modular
✅ Documentação centralizada
```

### 🗃️ Mudanças no Sistema de Middleware

- **Função `updateSession`**: Refresh básico de sessão sem verificações complexas
- **Função `checkAdminAuth`**: Verificação específica de roles de admin
- **Função `handleAdminRoutes`**: Proteção completa para rotas `/admin/*`

## 🎯 Experiência do Usuário

### ✅ Melhorias de Performance/Manutenibilidade

- **Código Modular**: Funções especializadas facilitam manutenção e testes
- **Zero Duplicação**: Eliminação completa de código redundante
- **Tipagem Consistente**: Type safety em todos os contextos de uso
- **Documentação Clara**: Padrões bem definidos para cada caso de uso

## 🔗 Arquivos Modificados

### Novas funcionalidades

- middleware.ts - Utilitários modulares de middleware
- index.ts - Exports centralizados
- `src/utils/supabase/README.md` - Documentação completa
- SUPABASE-REFACTOR-SUMMARY.md - Resumo da refatoração

### Arquivos aprimorados

- middleware.ts - Simplificado para usar funções modulares
- AGENTS.md - Atualizado para refletir nova estrutura

### Arquivos removidos

- **Removido**: `/utils/supabase/` (pasta duplicada da raiz) - Consolidação em supabase

## 🧪 Testes Realizados

- [x] Build bem-sucedida sem erros de TypeScript
- [x] Imports funcionando corretamente
- [x] Middleware de autenticação operacional
- [x] Proteção de rotas admin mantida
- [x] Refresh de sessão funcionando
- [x] Verificação de roles de admin preservada

## ✅ Impacto

Esta refatoração **elimina completamente as duplicações** na estrutura Supabase, criando um sistema **modular, documentado e fácil de manter**. O middleware principal agora é **15x mais conciso** (de 100+ para 15 linhas) enquanto mantém toda a funcionalidade original. A estrutura está preparada para **escalabilidade** e **facilita futuras manutenções**.

---

## PR #6: feat: add Google OAuth login support and improve admin navigation
- Author: luismtns
- Merged: 2025-09-11T07:28:20Z
- Link: https://github.com/luismtns/omentejovem/pull/6


## 📋 Resumo das Alterações

Esta PR introduz autenticação via Google OAuth como alternativa ao magic link existente e melhora a experiência de navegação no painel administrativo.

## ✨ Principais Funcionalidades

### 🆕 Novas Funcionalidades

- **Google OAuth**: [`src/utils/auth.ts`](src/utils/auth.ts) - Implementação de login via Google como método de autenticação adicional
- **Interface atualizada**: [`src/app/admin/page.tsx`](src/app/admin/page.tsx) - Botão de login com Google adicionado à página de admin

### 🔧 Melhorias Existentes

- **Sidebar sticky**: [`src/components/admin/Sidebar.tsx`](src/components/admin/Sidebar.tsx) - Melhor experiência de navegação com sidebar fixa
- **Documentação**: [`README.md`](README.md) - Atualização para refletir as novas opções de autenticação

## 🔄 Mudanças Técnicas

### 🔐 Sistema de Autenticação

- Mantém compatibilidade total com magic link existente
- Adiciona Google OAuth como opção alternativa de login
- Redirecionamento inteligente após autenticação via OAuth

### 🎨 Interface do Usuário

- Sidebar agora permanece fixa durante a navegação (sticky positioning)
- Footer da sidebar também fixo para melhor acesso às informações do usuário
- Botão prominente para login com Google na página de admin

## 🎯 Experiência do Usuário

### ✅ Melhorias de Performance/Interface

- **Navegação mais fluida**: Sidebar sticky elimina necessidade de scroll para acessar menu
- **Opções flexíveis de login**: Usuários podem escolher entre Google OAuth ou magic link
- **Onboarding simplificado**: Login via Google reduz fricção para novos usuários

## 🔗 Arquivos Modificados

### Novas funcionalidades

- [`src/utils/auth.ts`](src/utils/auth.ts) - Função `signInWithGoogle` para autenticação OAuth
- [`src/app/admin/page.tsx`](src/app/admin/page.tsx) - Interface atualizada com botão Google OAuth

### Arquivos aprimorados

- [`src/components/admin/Sidebar.tsx`](src/components/admin/Sidebar.tsx) - Posicionamento sticky para melhor navegação
- [`README.md`](README.md) - Documentação atualizada sobre métodos de autenticação

## 🧪 Testes Realizados

- [x] Login via Google OAuth funcional
- [x] Compatibilidade mantida com magic link
- [x] Redirecionamento correto após autenticação
- [x] Sidebar sticky responsiva
- [x] Interface consistente entre métodos de login

## ✅ Impacto

Esta atualização moderniza o sistema de autenticação oferecendo maior flexibilidade aos usuários, enquanto melhora significativamente a experiência de navegação no painel administrativo. As mudanças são completamente backward-compatible e não afetam usuários existentes.

---

## PR #5: refactor: unify artwork hooks and simplify component architecture
- Author: luismtns
- Merged: 2025-09-11T07:04:25Z
- Link: https://github.com/luismtns/omentejovem/pull/5


## 📋 Resumo das Alterações

Esta PR representa uma refatoração major para simplificar e unificar a lógica de busca de artworks em toda a aplicação, removendo complexidade desnecessária e melhorando a manutenibilidade do código.

**🆕 NOVO: Documentação AI Development Guide incluída nesta PR**

## ✨ Principais Funcionalidades

### 🆕 Novas Funcionalidades

- **Hook Unificado**: [`src/hooks/useArtworks.ts`](src/hooks/useArtworks.ts) - Consolidação dos hooks `useOneOfOneArtworks` e `useEditionArtworks` em um único hook mais flexível
- **Filtros Avançados**: Suporte para filtragem por `type`, `oneOfOne`, `featured`, `seriesSlug` com melhor type safety
- **Sistema de Busca Otimizado**: [`src/lib/supabase.ts`](src/lib/supabase.ts) - Lógica aprimorada para consultas específicas de séries
- **🆕 AI Development Guide**: [`.github/copilot-instructions.md`](.github/copilot-instructions.md) - Documentação especializada para agentes de IA

### 🔧 Melhorias Existentes

- **Hook de Séries**: Melhorias no `useSeries` com melhor capacidade de busca de artworks
- **Processamento de Artworks**: [`src/types/artwork.ts`](src/types/artwork.ts) - Definições de tipos aprimoradas com melhor lógica de processamento
- **Organização de Hooks**: [`src/hooks/index.ts`](src/hooks/index.ts) - Estrutura mais clara com exports organizados
- **Documentação de Agentes**: [`AGENTS.md`](AGENTS.md) - Atualização das diretrizes de PR em português

## 🔄 Mudanças Técnicas

### 📦 Simplificação de Arquitetura

**Antes:**
```typescript
// Múltiplos hooks especializados
const { data } = useOneOfOneArtworks()
const { data } = useEditionArtworks()

// Padrões de context complexos
<OneOfOneProvider>
  <OneOfOneContent />
</OneOfOneProvider>
```

**Depois:**
```typescript
// Hook único unificado
const { data } = useArtworks({ oneOfOne: true })
const { data } = useArtworks({ type: 'edition' })

// Uso direto de hooks, sem context necessário
function Content() {
  const { data } = useArtworks({ oneOfOne: true })
  // ...
}
```

### 🗃️ Mudanças no Sistema de Dados

- **Consultas Otimizadas**: Melhor suporte para filtragem baseada em séries
- **Tratamento de Erros**: Mensagens de erro aprimoradas e fallbacks na busca de dados
- **Performance**: Consultas mais eficientes com cache otimizado

### 📚 Nova Documentação para IA

#### 🎯 AI Development Guide Inclui:

- **Visão Arquitetural**: Entendimento completo da estrutura dual (portfolio público vs admin CMS)
- **Workflows Essenciais**: 
  - Processo de mudanças de schema com regeneração de tipos
  - Adição de novas entidades via descriptor pattern
  - Pipeline completo de handling de imagens
- **Padrões de Código**: 
  - Data fetching unificado com `useArtworks(options)`
  - Uso correto dos clientes Supabase por contexto
  - Tratamento consistente de erros com Sonner
- **Integração Crítica**: 
  - Fluxo de autenticação via middleware
  - Relacionamentos complexos de dados
  - Organização de arquivos e localização de código crítico

## 🎯 Experiência do Usuário

### ✅ Melhoria na Performance

- **Carregamento Mais Rápido**: Consultas otimizadas reduzem tempo de resposta
- **Menor Complexidade**: Remoção de ~600 linhas de código boilerplate de contexts
- **API Mais Simples**: Interface mais intuitiva para desenvolvedores trabalhando com dados de artwork
- **🆕 Desenvolvimento Assistido**: Agentes de IA podem agora ser produtivos imediatamente com o novo guia

### 🛡️ Melhorias de Autenticação

- **Gerenciamento de Sessão**: Melhor tratamento do estado de sessão no middleware
- **Proteção Admin**: Lógica aprimorada de proteção de rotas administrativas
- **Páginas de Erro**: Tratamento melhorado de erros de autenticação

## 🔗 Arquivos Modificados

### 📄 Documentação Adicionada/Atualizada

- **🆕 Novo**: [`.github/copilot-instructions.md`](.github/copilot-instructions.md) - AI Development Guide (152 linhas)
- **Atualizado**: [`AGENTS.md`](AGENTS.md) - Diretrizes de PR em português para melhor comunicação com cliente
- **Novo**: [`PR_DESCRIPTION.md`](PR_DESCRIPTION.md) - Template para descrições de PR

### Remoção de Contexts Redundantes

- **Removido**: `src/app/1-1/context/` - OneOfOneContext e providers relacionados
- **Removido**: `src/app/editions/context/` - EditionsContext e providers relacionados  
- **Removido**: `src/app/portfolio/context/` - PortfolioContext e providers relacionados
- **Removido**: `src/app/series/[slug]/context/` - CollectionsContext e providers relacionados

### Componentes Simplificados

- [`src/app/1-1/content.tsx`](src/app/1-1/content.tsx) - Migração para uso direto de hooks
- [`src/app/editions/content.tsx`](src/app/editions/content.tsx) - Simplificação da lógica de busca
- [`src/app/portfolio/content.tsx`](src/app/portfolio/content.tsx) - Remoção de dependência de context
- [`src/app/series/[slug]/content.tsx`](src/app/series/[slug]/content.tsx) - Otimização de consultas de série

### Limpeza de Arquivos

- **Removido**: Arquivos `new-page.tsx` não utilizados
- **Removido**: Componentes provider redundantes
- **Removido**: Context files desnecessários

## ⚠️ Mudanças que Quebram Compatibilidade

Esta refatoração remove vários contexts e hooks do React:
- `useOneOfOneContext` → Use `useArtworks({ oneOfOne: true })`
- `useEditionsContext` → Use `useArtworks({ type: 'edition' })`
- `usePortfolioContext` → Use `useArtworks()` ou `usePortfolio()`
- Contexts de séries → Use `useSeries()` e `useArtworks()`

## 🔄 Guia de Migração

Para componentes customizados usando os hooks antigos:

```typescript
// Padrão antigo
const { artworks } = useOneOfOneContext()

// Novo padrão  
const { data: artworks } = useArtworks({ oneOfOne: true })
```

### 📚 Para Agentes de IA

O novo guia de desenvolvimento documenta todos os padrões migrados:

```typescript
// ✅ Use unified hooks with options (conforme documentado)
const { data: artworks } = useArtworks({ oneOfOne: true, limit: 6 })
const { data: seriesArtworks } = useArtworks({ seriesSlug: 'digital-dreams' })

// ❌ Don't use specialized hooks (deprecated)
const artworks = useOneOfOneArtworks() // REMOVED
```

## 💡 Benefícios da Nova Documentação AI

### ⚡ Produtividade para Desenvolvimento Assistido

- **Onboarding Imediato**: Agentes de IA podem entender a arquitetura rapidamente
- **Padrões Consistentes**: Código gerado automaticamente seguirá as convenções do projeto
- **Workflows Específicos**: Documentação de processos únicos desta codebase
- **Gotchas Documentados**: Evita armadilhas comuns e uso de padrões deprecated

### 🎯 Integração com Ferramentas de IA

- **GitHub Copilot**: Instruções específicas para melhor sugestão de código
- **Claude/ChatGPT**: Contexto arquitetural para desenvolvimento assistido
- **Cursor/Windsurf**: Padrões documentados para análise de código

## 🧪 Testes Realizados

- [x] Todas as páginas de artwork renderizam corretamente (1-1, editions, portfolio, series)
- [x] Funcionalidade de filtros funcionando conforme esperado
- [x] Autenticação e proteção admin funcionando
- [x] Busca de artworks de séries operacional
- [x] Build passa sem erros
- [x] Documentação AI validada com exemplos reais da codebase

## 📊 Estatísticas da Refatoração

- **21 arquivos alterados** 
- **3.047 inserções, 3.319 deleções**
- **Redução líquida de 272 linhas**
- **~600 linhas de boilerplate removidas** (contexts)
- **152 linhas de documentação AI adicionadas**

## ✅ Impacto

Esta refatoração melhora significativamente a qualidade do código base mantendo toda a funcionalidade existente. A aplicação agora é mais fácil de manter, estender e compreender, com uma arquitetura mais simples e performática.

**🆕 Adicionalmente, a nova documentação AI garante que desenvolvimento futuro assistido por IA será mais eficiente e consistente com os padrões arquiteturais estabelecidos.**

---

## PR #1: feat: implement server-side rendering for newsletter page
- Author: luismtns
- Merged: 2025-09-11T02:48:48Z
- Link: https://github.com/luismtns/omentejovem/pull/1


## 📋 Resumo das Alterações

Migração da página `/newsletter` de client-side para server-side rendering, eliminando loading states e melhorando performance. As imagens do banner agora são renderizadas diretamente no servidor com dados do Supabase.

## ✨ Principais Funcionalidades

### 🆕 Novas Funcionalidades

- **Server Image Banner**: ServerImageBanner.tsx - Componente server-side que busca imagens diretamente do banco
- **Server Queries**: server-queries.ts - Funções reutilizáveis para data fetching no servidor

### 🔧 Melhorias Existentes

- **Newsletter Component**: Refatoração para remover dependências client-side desnecessárias
- **Environment Config**: Simplificação das variáveis de ambiente

## 🔄 Mudanças Técnicas

### 📦 Atualizações de Dependências

- Remoção de imports relacionados ao WordPress (`AboutData`, `PressTalk`, `FooterProperties`)
- Eliminação de funções client-side para busca de imagens

### 🗃️ Mudanças no Banco de Dados

- Implementação de queries otimizadas do Supabase via `getArtworksServer()`
- Cache automático usando React `cache()` para evitar requisições duplicadas

### 🛡️ Melhorias de Validação

- Configuração segura da `NEXT_PUBLIC_KIT_API_KEY` via variáveis de ambiente

## 🎯 Experiência do Usuário

### ✅ Feedback Visual

- **Zero loading states**: Banner de imagens carrega instantaneamente
- **Primeiro render completo**: Conteúdo disponível imediatamente

### 🔍 Melhorias na Interface

- **Eliminação de layout shifts**: Imagens renderizadas com dados desde o servidor
- **Performance otimizada**: Redução significativa no tempo de First Contentful Paint

### 🧹 Limpeza de Código

- Remoção de 40+ linhas de código client-side desnecessário
- Simplificação da função `ImageBanner` para componente server-side

## 🔗 Arquivos Modificados

### Novas funcionalidades

- ServerImageBanner.tsx - Banner server-side sem client loading
- server-queries.ts - Sistema de queries server-side com cache

### Arquivos aprimorados

- page.tsx - Integração com componente servidor
- content.tsx - Remoção de código client-side
- .env.example - Configuração simplificada para Kit API

## ✅ Impacto

Esta mudança transforma a página `/newsletter` de uma implementação client-side com loading states para server-side rendering completo. O resultado é uma experiência mais rápida e fluida para os usuários, com imagens carregando instantaneamente e melhor indexação para SEO. A implementação serve como base para futuras migrações server-side em outras páginas do projeto.

---

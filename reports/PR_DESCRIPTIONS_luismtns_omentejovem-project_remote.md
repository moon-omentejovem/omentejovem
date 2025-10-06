# PR_DESCRIPTIONS for luismtns/omentejovem-project

Generated: 2025-09-30T20:54:42.420Z


## Merge commit: Merge branch 'main' of github.com:luismtns/omentejovem
- Author: Luís Bovo
- Date: 2025-09-23 01:33:31 -0300


_No description found._

---

## PR #16: refactor: centralize supabase config
- Author: luismtns
- Merged: 2025-09-04T06:29:24Z
- Link: https://github.com/luismtns/omentejovem-project/pull/16


## Resumo das Alterações
- Centraliza variáveis e buckets do Supabase em um único módulo
- Armazena imagens originais e otimizadas no Storage
- Alinha criação de buckets e políticas no script de setup

## Principais Funcionalidades
- 🔧 Upload salva versões raw e WebP otimizadas
- 🔧 Clientes Supabase reutilizam configuração compartilhada

## Mudanças Técnicas
- 🗃️ DB: adiciona bucket `media` e corrige nome `cached-images`
- 🛡️ Validação: simplifica uso de variáveis de ambiente

## Experiência do Usuário
- ✅ Feedback consistente durante upload

## Arquivos Modificados
### 🆕 Novos
- [`config.ts`](src/lib/supabase/config.ts)

### ✏️ Alterados
- [`AdminForm.tsx`](src/components/admin/AdminForm.tsx)
- [`supabase-setup.sql`](supabase-setup.sql)
- [`client.ts`](src/utils/supabase/client.ts)
- [`server.ts`](src/utils/supabase/server.ts)
- [`client.ts`](utils/supabase/client.ts)
- [`server.ts`](utils/supabase/server.ts)
- [`middleware.ts`](utils/supabase/middleware.ts)
- [`supabase-admin.ts`](src/lib/supabase-admin.ts)
- [`supabase.ts`](src/lib/supabase.ts)
- [`middleware.ts`](src/middleware.ts)
- [`README.md`](README.md)
- [`SUPABASE-INTEGRATION.md`](docs/SUPABASE-INTEGRATION.md)

## Impacto
- Facilita manutenção do Supabase e prepara infraestrutura para otimização de mídia


------
https://chatgpt.com/codex/tasks/task_e_68b79507b200832c8224570518401aea

---

## PR #14: feat: implement infinite pagination for admin tables
- Author: luismtns
- Merged: 2025-09-03T01:02:39Z
- Link: https://github.com/luismtns/omentejovem-project/pull/14


## Resumo das Alterações
- Adiciona paginação infinita às tabelas do painel administrativo.

## Principais Funcionalidades
🆕 **Novas**
- Rolagem infinita baseada em `IntersectionObserver` nas listas do admin.

## Mudanças Técnicas
🛡️ **Validação**
- Ajuste das rotas `api` para aceitar parâmetros de paginação.

## Experiência do Usuário
🔍 **Interface**
- Carregamento contínuo de itens sem recarregar a página.

## Arquivos Modificados
- aprimorados
  - [src/components/admin/AdminTable.tsx](src/components/admin/AdminTable.tsx)
  - [src/app/api/admin/artworks/route.ts](src/app/api/admin/artworks/route.ts)
  - [src/app/api/admin/series/route.ts](src/app/api/admin/series/route.ts)
  - [src/app/api/admin/artifacts/route.ts](src/app/api/admin/artifacts/route.ts)
  - [src/app/admin/artworks/page.tsx](src/app/admin/artworks/page.tsx)
  - [src/app/admin/series/page.tsx](src/app/admin/series/page.tsx)
  - [src/app/admin/artifacts/page.tsx](src/app/admin/artifacts/page.tsx)

## Impacto
- Painel mais fluido com carregamento incremental de dados.

------
https://chatgpt.com/codex/tasks/task_e_68b1ddd499d8832c8297c51022a9e54d

---

## PR #13: feat: refine admin ux and image uploads
- Author: luismtns
- Merged: 2025-08-29T17:00:01Z
- Link: https://github.com/luismtns/omentejovem-project/pull/13


## Resumo das Alterações
- Atualiza plano de ação com boas práticas de Next.js, Supabase e Vercel
- Unifica campo de imagem aceitando URL ou upload direto ao Supabase
- Substitui alertas por toasts do Sonner em todo o painel administrativo

## Principais Funcionalidades
- 🆕 Campo de imagem único com suporte a upload para o bucket `media`
- 🔧 Feedback padronizado via `toast.success`/`toast.error`

## Mudanças Técnicas
- 🛡️ Validação de URLs expandida para o novo tipo `image`

## Experiência do Usuário
- ✅ Feedback imediato em ações de CRUD
- 🔍 Upload com preview de imagens
- 🧹 Remoção de `alert` em favor de toasts

## Arquivos Modificados
- [AGENTS.md](AGENTS.md)
- [src/types/descriptors.ts](src/types/descriptors.ts)
- [src/components/admin/AdminForm.tsx](src/components/admin/AdminForm.tsx)
- [src/app/admin/artworks/page.tsx](src/app/admin/artworks/page.tsx)
- [src/app/admin/artworks/new/page.tsx](src/app/admin/artworks/new/page.tsx)
- [src/app/admin/artworks/[id]/page.tsx](src/app/admin/artworks/%5Bid%5D/page.tsx)
- [src/app/admin/artifacts/page.tsx](src/app/admin/artifacts/page.tsx)
- [src/app/admin/artifacts/new/page.tsx](src/app/admin/artifacts/new/page.tsx)
- [src/app/admin/artifacts/[id]/page.tsx](src/app/admin/artifacts/%5Bid%5D/page.tsx)
- [src/app/admin/series/page.tsx](src/app/admin/series/page.tsx)
- [src/app/admin/series/new/page.tsx](src/app/admin/series/new/page.tsx)
- [src/app/admin/series/[id]/page.tsx](src/app/admin/series/%5Bid%5D/page.tsx)
- [src/app/admin/about/page.tsx](src/app/admin/about/page.tsx)

## Impacto
- Painel mais consistente e amigável, com uploads simplificados e feedbacks confiáveis

------
https://chatgpt.com/codex/tasks/task_e_68b1d54d1c44832cb5d2d1d1ddfe4e63

---

## PR #12: fix: resolve PKCE authentication conflicts in callback flow
- Author: luismtns
- Merged: 2025-08-29T16:23:46Z
- Link: https://github.com/luismtns/omentejovem-project/pull/12


## 📋 Resumo das Alterações

Corrigido problema crítico de autenticação onde o middleware estava interferindo no processo PKCE (Proof Key for Code Exchange) do Supabase durante o callback de login, causando erro "both auth code and code verifier should be non-empty".

## ✨ Principais Funcionalidades

### 🔧 Melhorias Existentes

- **Authentication Flow**: middleware.ts - Exclusão das rotas de callback do middleware para evitar conflitos PKCE
- **Session Management**: Correção na ordem de execução entre middleware e callback de autenticação

## 🔄 Mudanças Técnicas

### 🛡️ Melhorias de Validação

- Adicionada validação early return para rotas `/auth/callback` no middleware
- Prevenção de execução simultânea de `updateSession` e `exchangeCodeForSession`
- Manutenção da integridade do fluxo de autenticação Supabase

### 🗃️ Mudanças no Banco de Dados

- Nenhuma alteração de schema necessária

## 🎯 Experiência do Usuário

### ✅ Feedback Visual

- Login via magic link agora funciona corretamente sem erros de validação
- Redirecionamento adequado após autenticação bem-sucedida

### 🔍 Melhorias na Interface

- Eliminação de erro "Auth session missing!" durante processo de login
- Fluxo de autenticação mais confiável e consistente

## 🔗 Arquivos Modificados

### Arquivos aprimorados

- middleware.ts - Adicionada exclusão de rotas de callback para evitar conflitos PKCE

## ✅ Impacto

**Crítico**: Restaura funcionalidade essencial de autenticação que estava quebrada após reestruturação do projeto. O problema afetava todos os usuários tentando fazer login no painel administrativo, impedindo acesso completo ao CMS. A correção garante que o fluxo PKCE do Supabase funcione adequadamente sem interferência do middleware de sessão.

**Detalhes técnicos**: O middleware estava executando `updateSession` simultaneamente ao `exchangeCodeForSession` do callback, criando conflito na manipulação dos cookies de sessão e tokens de autenticação. A exclusão explícita das rotas `/auth/callback` permite que o processo de troca de código por sessão ocorra sem interferência.

---

## PR #11: feat: implement secure magic link authentication system
- Author: luismtns
- Merged: 2025-08-29T13:40:28Z
- Link: https://github.com/luismtns/omentejovem-project/pull/11


## 📋 Resumo das Alterações

Implementação de sistema de autenticação segura com magic links, removendo vulnerabilidades de segurança e consolidando o fluxo de autenticação admin.

## ✨ Principais Funcionalidades

### 🆕 Novas Funcionalidades

- **Secure Auth Utils**: auth.ts - Utilitários de autenticação segura com validação de base URL
- **Magic Link Authentication**: Sistema consolidado para envio de magic links com redirecionamentos seguros

### 🔧 Melhorias Existentes

- **Admin Authentication**: Remoção da vulnerabilidade `window.location.origin` 
- **Environment-based Redirects**: Redirecionamentos baseados em variáveis de ambiente confiáveis

## 🔄 Mudanças Técnicas

### 🛡️ Melhorias de Validação

- Validação robusta de base URL com fallbacks seguros
- Remoção de dependência client-side para URLs de redirect
- Implementação de `getBaseUrl()` com hierarquia de configuração segura

### 🗃️ Mudanças no Fluxo de Auth

- Centralização da lógica de magic link em `signInWithMagicLink()`
- Padronização de redirects para `/admin/artworks` como padrão
- Uso obrigatório de `NEXT_PUBLIC_BASE_URL` em produção

## 🎯 Experiência do Usuário

### ✅ Feedback Visual

- Fluxo de autenticação mais confiável e consistente
- Eliminação de falhas de redirect em diferentes ambientes

### 🔍 Melhorias na Interface

- Experiência de login unificada entre desenvolvimento e produção
- Redirecionamentos previsíveis após autenticação

## 🔗 Arquivos Modificados

### Novas funcionalidades

- auth.ts - Sistema de autenticação segura e utilitários de base URL

### Arquivos aprimorados

- page.tsx - Migração para uso do novo sistema de auth
- `client/.env.example` - Documentação atualizada com variável obrigatória

## ✅ Impacto

Esta implementação elimina uma vulnerabilidade de segurança importante ao remover a dependência de `window.location.origin` e estabelece um sistema de autenticação mais robusto e seguro. O sistema agora funciona consistentemente em todos os ambientes (desenvolvimento, preview, produção) com configuração centralizada e validação adequada de URLs de redirect.

---

## PR #10: feat: add user management page for admin with invite functionality
- Author: luismtns
- Merged: 2025-08-29T02:07:29Z
- Link: https://github.com/luismtns/omentejovem-project/pull/10


## 📋 Resumo das Alterações

Implementação completa do sistema de gerenciamento de usuários administradores com funcionalidade de convite via magic link, interface administrativa intuitiva e sistema de seeding automático para deploy na Vercel.

## ✨ Principais Funcionalidades

### 🆕 Novas Funcionalidades

- **Admin User Management Interface**: Interface completa para gerenciar administradores do CMS com estatísticas em tempo real, formulário de convite e lista de usuários
- **Admin Invitation API**: API para processar convites de administradores com magic link automático
- **User Management API**: CRUD completo para gerenciar roles e remover usuários do CMS
- **Automatic Database Seeding**: Sistema automático de seeding que popula o banco a cada deploy na Vercel
- **Secure Magic Link Auth**: Sistema de autenticação seguro com validação de base URL

### 🔧 Melhorias Existentes

- **Enhanced Middleware Protection**: Middleware aprimorado com verificação robusta de roles administrativos em todas as rotas `/admin/*`
- **Simplified Admin Model**: Todos os usuários do CMS são automaticamente administradores - sem níveis intermediários de acesso
- **Auto-Admin Creation**: Criação automática de role admin no primeiro login via callback otimizado
- **Security Hardening**: Eliminação de `window.location.origin` e implementação de validação de URLs

## 🔄 Mudanças Técnicas

### 📦 Atualizações de Dependências

- **sonner**: 2.0.7 - Sistema de toast notifications para feedback visual das operações administrativas

### 🗃️ Mudanças no Banco de Dados

- Service role authentication implementado para operações administrativas
- Sistema de seeding automático com dados essenciais (3 séries, 4 artworks, 2 artifacts, about page)
- Verificação inteligente de dados existentes antes de popular o banco

### 🛡️ Melhorias de Validação

- Middleware com verificação de admin role em todas as rotas administrativas
- Validação de email e verificação de usuários existentes nos convites
- Proteção contra auto-remoção de acesso administrativo
- Sistema de autenticação seguro baseado em variáveis de ambiente

## 🎯 Experiência do Usuário

### ✅ Feedback Visual

- Toast notifications usando Sonner para todas as operações (convite, remoção, erro)
- Estados de loading durante processamento de convites e remoções
- Mensagens contextuais para diferentes cenários (usuário já existe, email inválido, etc.)

### 🔍 Melhorias na Interface

- Interface administrativa limpa e intuitiva para gerenciar usuários
- Estatísticas em tempo real dos administradores do CMS
- Formulário de convite com validação e feedback visual imediato
- Menu lateral atualizado com nova opção "Users" (👥)

### 🧹 Limpeza de Código

- Remoção de arquivos de documentação desatualizados e scripts legados
- Consolidação da documentação no README.md principal
- Padronização das APIs administrativas com service role authentication
- Implementação de utilitários de autenticação seguros

## ✅ Impacto

Sistema completo de gerenciamento administrativo implementado com sucesso, oferecendo uma experiência profissional e segura para convite e gestão de administradores. O sistema permite que administradores convidem novos membros da equipe via email com criação automática de acesso admin, mantendo alta segurança através de service role authentication, middleware robusto e sistema de autenticação baseado em variáveis de ambiente. O sistema de seeding automático garante que todos os deployments tenham dados essenciais, eliminando configuração manual e acelerando o time-to-market.

A implementação está pronta para produção! 🚀

---

## PR #8: feat: update artifact and series management features
- Author: luismtns
- Merged: 2025-08-28T22:33:20Z
- Link: https://github.com/luismtns/omentejovem-project/pull/8


## 📋 Resumo das Alterações

Esta PR implementa melhorias significativas na interface administrativa e nas rotas de API, completando as operações CRUD para artifacts e series, além de aprimorar a experiência do usuário com validações, alertas e melhor tratamento de erros.

## ✨ Principais Funcionalidades

### 🆕 Novas Páginas Administrativas
- **Criação de Artifacts**: `/admin/artifacts/new`
- **Edição de Artifacts**: [`/admin/artifacts/[id]`](client/src/app/admin/artifacts/[id]/page.tsx)
- **Criação de Series**: `/admin/series/new`
- **Edição de Series**: [`/admin/series/[id]`](client/src/app/admin/series/[id]/page.tsx)

### 🔧 Melhorias na API
- **Novas rotas para Artifacts**: GET, PUT, DELETE em [`/api/admin/artifacts/[id]`](client/src/app/api/admin/artifacts/[id]/route.ts)
- **Cliente Supabase Admin**: Novo `supabaseAdmin` para operações sensíveis
- **Tratamento de erros centralizado**: Utilitário `handleApiError`

### 🎨 Componentes Aprimorados
- **RelationPicker**: Novo componente `RelationPicker` para campos multi-relacionais
- **AdminForm**: Suporte completo para campos `relation-multi`
- **AdminTable**: Melhor renderização de conteúdo Tiptap JSON na visualização resumida

## 🔄 Mudanças Técnicas

### 📦 Atualizações de Dependências
- Atualização do `dotenv` para versão `^17.2.1`

### 🗃️ Mudanças no Banco de Dados
- Alteração do método da About Page de POST para PUT em `/api/admin/about`
- Uso do `supabaseAdmin` para operações que requerem permissões elevadas

### 🛡️ Melhorias de Validação
- Ajustes nos schemas Zod em `schemas.ts`:
  - Campos de data mais flexíveis
  - Validação aprimorada para campos opcionais
  - Melhor tratamento de tipos nullable

## 🎯 Experiência do Usuário

### ✅ Feedback Visual
- Alertas de sucesso para operações (criar, atualizar, deletar)
- Confirmações de exclusão com mensagens mais claras
- Estados de loading durante operações assíncronas

### 🔍 Melhorias na Interface
- Exibição de conteúdo Tiptap em tabelas com extração de texto
- Picker de relacionamentos com interface intuitiva
- Melhor tratamento de erros com mensagens específicas

### 🧹 Limpeza de Código
- Remoção de scripts obsoletos:
  - `data.js` 
  - `tezos-data.js`

## 🔗 Arquivos Modificados

### Novas funcionalidades
- page.tsx - Edição de artifacts
- page.tsx - Criação de artifacts
- page.tsx - Edição de series
- page.tsx - Criação de series
- route.ts - API CRUD para artifacts
- RelationPicker.tsx - Picker de relacionamentos
- supabase-admin.ts - Cliente admin Supabase
- api-utils.ts - Utilitários de API

### Arquivos aprimorados
- AdminForm.tsx - Suporte a relation-multi
- AdminTable.tsx - Renderização de Tiptap
- page.tsx - Melhor UX e alertas
- page.tsx - Melhor UX e alertas
- page.tsx - Melhor UX e alertas
- schemas.ts - Validações ajustadas

## ✅ Impacto

Esta PR completa a interface administrativa do CMS, fornecendo:
- **CRUD completo** para todas as entidades (artworks, series, artifacts)
- **Interface consistente** em todas as páginas administrativas
- **Validação robusta** com feedback claro ao usuário
- **Melhor experiência** com loading states e confirmações
- **Código mais limpo** e organizado

O sistema agora está funcional, **necessitando de melhorias visuais ainda**, para gerenciamento de conteúdo, permitindo que administradores criem, editem e removam todos os tipos de conteúdo através de uma interface unificada e intuitiva.

---

## PR #7: feat/database-seed-migration
- Author: luismtns
- Merged: 2025-08-28T09:09:24Z
- Link: https://github.com/luismtns/omentejovem-project/pull/7


## Descrição
Esta PR implementa a migração completa do projeto omentejovem para um CMS baseado em Supabase. O sistema substitui o modelo git-based anterior por uma solução moderna e escalável.

## Principais Alterações

### Infraestrutura e Configuração
- **Supabase Integration**: Configuração completa do Supabase como backend
- **Database Schema**: DDL completo com RLS policies para artworks, series, artifacts e about_page
- **Environment Setup**: Configuração de variáveis de ambiente e guia de setup detalhado
- **Docker & Build**: Atualizações no sistema de build e configuração ESLint/Prettier

### Sistema de Administração
- **Admin Panel**: Interface completa de administração em `/admin`
- **CRUD Operations**: Operações completas para artworks, séries, artifacts e página sobre
- **Authentication**: Sistema de autenticação via magic link do Supabase
- **Rich Text Editor**: Integração do Tiptap para conteúdo rico
- **Image Handling**: Sistema de proxy e cache de imagens

### Migração de Dados
- **Seed System**: Script SQL completo para migrar dados históricos
- **Data Validation**: Scripts TypeScript para validação e análise de dados
- **Legacy Compatibility**: Conversão de dados antigos para nova estrutura
- **Historical Data**: Preservação completa do histórico de NFTs e coleções

### API e Rotas
- **Admin APIs**: Endpoints CRUD para todas as entidades
- **Public APIs**: Rotas públicas para consumo do frontend
- **Type Safety**: Schemas Zod completos e tipos TypeScript gerados
- **Cache Management**: Sistema de revalidação de cache

### Interface Pública
- **Portfolio Pages**: Páginas atualizadas usando dados do Supabase
- **1/1 Collection**: Página específica para peças únicas
- **About Page**: Sistema editável para página sobre
- **Responsive Design**: Interface otimizada para todos os dispositivos

## Estrutura do Banco de Dados

### Tabelas Principais
- `artworks`: NFTs com metadados completos, tipos (single/edition), flags de destaque
- `series`: Coleções/séries de artworks com imagens de capa
- `series_artworks`: Relacionamento N:N entre séries e artworks
- `artifacts`: Conteúdo adicional (prints físicos, documentação)
- `about_page`: Conteúdo editável da página sobre
- `user_roles`: Sistema de roles para controle de acesso

### Dados Migrados
- 47 artworks com metadados completos
- 7 séries principais (The Cycle, Shapes & Colors, etc.)
- Relacionamentos many-to-many preservados
- Datas de mint precisas quando disponíveis
- Links para marketplaces (OpenSea, OBJKT)

## Melhorias Técnicas

### Segurança
- Row Level Security (RLS) configurado
- Leitura pública, escrita restrita a admins
- Autenticação segura via Supabase Auth
- Validação de dados server-side

### Performance
- Sistema de cache com revalidação por tags
- Paginação cursor-based preparada
- Otimização de imagens via proxy
- Queries otimizadas com joins necessários

### Manutenibilidade
- Arquitetura modular e replicável
- Descriptors para facilitar CRUD
- Componentes reutilizáveis de admin
- Documentação completa de setup

## Como Testar

1. **Setup Local**:
   ```bash
   cd client
   cp .env.local.example .env.local
   # Configure as variáveis do Supabase
   yarn install
   yarn dev
   ```

2. **Configurar Banco**:
   - Executar supabase-setup.sql no SQL Editor
   - Executar seed-database.sql para dados de exemplo

3. **Acessar Admin**:
   - Ir para `/admin`
   - Usar magic link para autenticação
   - Configurar role de admin conforme guia

4. **Validar Migração**:
   - Verificar páginas públicas funcionando
   - Testar CRUD no admin panel
   - Confirmar dados migrados corretamente

## Arquivos de Configuração

- supabase-setup.sql: Schema inicial do banco
- seed-database.sql: Dados históricos completos
- SETUP.md: Guia completo de configuração
- AGENTS.md: Documentação arquitetural detalhada

## Compatibilidade

- Node.js 18+
- Supabase (conta gratuita suficiente)
- Browsers modernos com suporte a ES2020
- Mantém compatibilidade com componentes existentes

Esta migração estabelece uma base sólida para o futuro desenvolvimento do projeto, permitindo gestão de conteúdo profissional enquanto preserva toda a história e identidade visual do omentejovem.

---

## PR #6: Refatoração completa do painel administrativo com Supabase
- Author: luismtns
- Merged: 2025-08-28T08:36:25Z
- Link: https://github.com/luismtns/omentejovem-project/pull/6


### Descrição

Esta PR refatora completamente o painel administrativo, migrando de um sistema baseado em arquivos JSON estáticos para uma interface moderna integrada ao Supabase, com melhor UX e facilidade de manutenção.

### Alterações Realizadas

#### **Mudanças na Arquitetura**
- **Substituído sistema de arquivos JSON** por integração com banco de dados Supabase
- **Removidas dependências da API do GitHub** para gerenciamento de conteúdo
- **Introduzido layout modular** para o painel admin com navegação lateral

#### **Melhorias na Interface**
- **Novo layout moderno** com tema escuro e barra lateral de navegação
- **Substituído dashboard complexo** por página focada no gerenciamento de obras
- **Design responsivo aprimorado** e melhor acessibilidade
- **Navegação simplificada** entre seções administrativas

#### **Arquivos Alterados**

**Adicionados:**
- page.tsx - Nova página de gerenciamento de obras
- page.tsx - Placeholder para gerenciamento de séries
- AdminLayout.tsx - Componente de layout compartilhado
- Sidebar.tsx - Barra lateral de navegação
- supabase.ts - Utilitários do cliente Supabase

**Modificados:**
- page.tsx - Redirecionamento do login atualizado para `/admin/artworks`

**Removidos:**
- `client/src/app/admin/dashboard/page.tsx` - Dashboard legado (647 linhas removidas)
- `client/src/app/api/admin/delete-mint-date/route.ts` - Integração com API do GitHub
- `client/src/app/api/admin/update-mint-dates/route.ts` - Integração com API do GitHub

#### 🔧 **Melhorias Técnicas**
- **Busca de dados simplificada** com API REST do Supabase
- **Melhor tratamento de erros** e estados de carregamento
- **Interfaces type-safe** para dados das obras
- **Redução no tamanho do bundle** pela remoção das dependências da API do GitHub

#### 📊 **Schema do Banco de Dados**
Espera tabela `artworks` no Supabase com as colunas:
- `id` (string) - Identificador único
- `title` (string) - Título da obra
- `description` (string) - Descrição da obra
- `image_url` (string) - URL da imagem
- `mint_date` (string) - Data de mint
- `mint_link` (string) - Link para mint
- `editions` (number) - Número de edições

### Variáveis de Ambiente Necessárias

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
```

### Notas de Migração

- **Configuração do banco necessária**: Criar tabela `artworks` no Supabase
- **Variáveis de ambiente**: Adicionar credenciais do Supabase
- **Fluxo administrativo**: Login agora redireciona para `/admin/artworks`
- **Endpoints legados removidos**: Operações CRUD baseadas no GitHub não estão mais disponíveis

### Funcionalidades Implementadas

#### **Gerenciamento de Obras**
- Listagem completa de obras em tabela responsiva
- Visualização de imagens com modal expandido
- Informações detalhadas (título, descrição, data de mint, edições)
- Links diretos para páginas de mint
- Design otimizado para diferentes tamanhos de tela

#### **Interface Administrativa**
- Layout consistente com navegação lateral
- Tema escuro profissional
- Botões de ação claramente identificados
- Estados de carregamento e feedback visual
- Estrutura preparada para futuras funcionalidades

### Testes Realizados

- ✅ Login administrativo redireciona corretamente
- ✅ Tabela de obras carrega dados do Supabase
- ✅ Layout responsivo funciona em todos os tamanhos de tela
- ✅ Navegação entre seções administrativas
- ✅ Exibição de imagens e funcionalidade do modal
- ✅ Tratamento de erros para configuração ausente do Supabase

### Mudanças que Quebram Compatibilidade

- **URL do dashboard alterada** de `/admin/dashboard` para `/admin/artworks`
- **Fonte de dados alterada** de JSON estático para banco Supabase
- **Endpoints de API removidos** para gerenciamento de datas de mint

### Próximos Passos

1. **Configurar banco Supabase** com a tabela `artworks`
2. **Adicionar variáveis de ambiente** necessárias
3. **Migrar dados existentes** do JSON para o Supabase
4. **Implementar funcionalidades CRUD** para obras (criar, editar, deletar)
5. **Desenvolver seção de séries** conforme necessário

---

**Impacto:** Alto - Refatoração completa da interface administrativa
**Risco:** Médio - Requer configuração do banco e variáveis de ambiente
**Dependências:** Conta Supabase e configuração adequada do ambiente

### Screenshots

*Interface antes:*
- Dashboard não funcional, assim como autenticação;
<img width="1472" height="746" alt="image" src="https://github.com/user-attachments/assets/b12cece1-04ac-486c-b12b-a3f53c8ba92a" />
<img width="1477" height="755" alt="image" src="https://github.com/user-attachments/assets/03d96c1c-fe35-4aaa-ae66-f328f49241bc" />


*Interface depois:*
- Layout limpo e focado com navegação intuitiva
- Tabela otimizada para gerenciamento de obras
![demo-refatore-supabase-omentejovem](https://github.com/user-attachments/assets/ed99d72a-4207-445b-9384-1ad87cde5876)


---

## PR #1: refactor: enhance client code clarity
- Author: luismtns
- Merged: 2025-08-23T06:39:08Z
- Link: https://github.com/luismtns/omentejovem-project/pull/1


## Summary
- extract reusable ArtDescription component for clearer rendering of art details
- centralize external link and mint date helpers in ArtContent utils
- simplify ArtInfos by using VideoProcessModal and computed media URLs

## Testing
- `npm run lint`


------
https://chatgpt.com/codex/tasks/task_e_68a3dc795814832c84132aba43357901

---

## Merge commit: Merge branch 'rib-pietro:main' into main
- Author: omjovem
- Date: 2025-05-13 15:41:11 -0700


_No description found._

---

## PR #43: Merge pull request #43 from rib-pietro/fix-owners-modal-positioning
- Author: yungwknd
- Merged: 2025-02-19 09:56:36 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/43


Fix: Owners modal positioning

---

## PR #42: Merge pull request #42 from rib-pietro/fix-artwork-size
- Author: yungwknd
- Merged: 2025-02-19 09:56:21 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/42


Fix: Artwork size on artwork page

---

## Merge commit: Merge branch 'main' into fix-artwork-size
- Author: yungwknd
- Date: 2025-02-19 09:56:04 -0800


_No description found._

---

## PR #41: Merge pull request #41 from rib-pietro/fix-sm-md-overflow-artwork-page
- Author: yungwknd
- Merged: 2025-02-19 09:55:40 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/41


Fix: Overflow on artwork page, at md and sm resolutions

---

## PR #40: Merge pull request #40 from rib-pietro/fix-menu
- Author: yungwknd
- Merged: 2025-02-06 08:53:29 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/40


Fix: Menu on mobile

---

## PR #39: Merge pull request #39 from rib-pietro/feat-youtube-button-artifacts
- Author: yungwknd
- Merged: 2025-02-06 08:13:01 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/39


Feat: Youtube button

---

## PR #38: Merge pull request #38 from rib-pietro/fix-images-about
- Author: yungwknd
- Merged: 2025-02-06 07:38:03 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/38


Fix: Images in about external links

---

## PR #37: Merge pull request #37 from rib-pietro/fix-provenance-window-size
- Author: yungwknd
- Merged: 2025-02-06 07:37:52 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/37


Fix: Provenance window size

---

## PR #36: Merge pull request #36 from rib-pietro/fix-art-slider-full-width
- Author: yungwknd
- Merged: 2025-02-05 15:09:18 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/36


Fix: Make art slider full width

---

## PR #35: Merge pull request #35 from rib-pietro/fix-artifacts-text
- Author: yungwknd
- Merged: 2025-02-05 15:09:06 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/35


Fix: Artifacts page text

---

## PR #34: Merge pull request #34 from rib-pietro/feat-omj-logo-artifa-video
- Author: yungwknd
- Merged: 2025-02-05 15:08:55 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/34


Feat: Added omj logo to the header, changed video on artifacts page

---

## Merge commit: Merge branch 'main' into feat-omj-logo-artifa-video
- Author: yungwknd
- Date: 2025-02-05 15:08:47 -0800


_No description found._

---

## PR #33: Merge pull request #33 from rib-pietro/fix-owners-modal-alignment-responsiveness
- Author: yungwknd
- Merged: 2025-02-05 15:08:08 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/33


Fix: Owners modal alignment and responsiveness

---

## PR #32: Merge pull request #32 from rib-pietro/fix-about-bio-title-mobile
- Author: yungwknd
- Merged: 2025-02-05 15:07:56 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/32


Fix: About 'Bio' title on mobile

---

## PR #31: Merge pull request #31 from rib-pietro/fix-homepage-title-mobile
- Author: yungwknd
- Merged: 2025-02-05 15:07:46 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/31


Fix: Homepage distance between title and artwork on mobile

---

## PR #30: Merge pull request #30 from rib-pietro/fix-newsletter-page-ajustments
- Author: yungwknd
- Merged: 2025-01-29 21:02:33 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/30


Fix: Newsletter page adjustments including styles, alignments and res…

---

## PR #29: Merge pull request #29 from rib-pietro/fix-artifacts-page-style-and-context
- Author: yungwknd
- Merged: 2025-01-29 20:31:18 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/29


Artifacts page: Added the description for the current artifact collec…

---

## PR #28: Merge pull request #28 from rib-pietro/fix-artwork-page-breakpoints-medium-small
- Author: yungwknd
- Merged: 2025-01-29 19:55:56 -0800
- Link: https://github.com/luismtns/omentejovem-project/pull/28


Fixed breaks and incorrect alignments on the artwork page for medium …

---

## PR #27: Merge pull request #27 from rib-pietro/fix-cache
- Author: rib-pietro
- Merged: 2024-10-22 17:03:53 +0100
- Link: https://github.com/luismtns/omentejovem-project/pull/27


Setting cache on fetch to 10min refresh

---

## PR #25: Merge pull request #25 from rib-pietro/available-purchase-fix
- Author: rib-pietro
- Merged: 2024-10-19 20:32:50 +0100
- Link: https://github.com/luismtns/omentejovem-project/pull/25


Fix DbSeeder

---

## PR #24: Merge pull request #24 from rib-pietro/available-purchase-fix
- Author: rib-pietro
- Merged: 2024-10-19 19:34:17 +0100
- Link: https://github.com/luismtns/omentejovem-project/pull/24


Available purchase fix

---

## Merge commit: Merge branch 'main' of github.com:rib-pietro/omentejovem-project
- Author: rib-pietro
- Date: 2024-10-09 22:01:33 +0100


_No description found._

---

## PR #23: Merge pull request #23 from rib-pietro/delete-nfts
- Author: rib-pietro
- Merged: 2024-10-09 21:58:35 +0100
- Link: https://github.com/luismtns/omentejovem-project/pull/23


Delete nfts

---

## Merge commit: validation fix
- Author: rib-pietro
- Date: 2024-10-08 20:58:33 +0100


_No description found._

---

## PR #21: Merge pull request #21 from rib-pietro/fix/about
- Author: Frederico S.
- Merged: 2024-10-08 18:17:27 +0100
- Link: https://github.com/luismtns/omentejovem-project/pull/21


Fix/about

---

## Merge commit: Merge branch 'main' into feedback-backend
- Author: rib-pietro
- Date: 2024-09-30 11:16:14 +0100


_No description found._

---

## Merge commit: Merge remote-tracking branch 'origin/main' into owners-modal
- Author: Frederico
- Date: 2024-09-17 13:16:18 +0100


_No description found._

---

## Merge commit: Merge branch 'main' of github.com:rib-pietro/omentejovem-project
- Author: rib-pietro
- Date: 2024-08-26 17:17:37 +0100


_No description found._

---

## Merge commit: Merge branch 'home-page-fix'
- Author: rib-pietro
- Date: 2024-08-26 16:45:34 +0100


_No description found._

---

## Merge commit: Merge branch 'home-settings-api'
- Author: rib-pietro
- Date: 2024-08-21 19:45:53 +0100


_No description found._

---

## Merge commit: Merge branch 'home-settings-api' into home-page-fix
- Author: rib-pietro
- Date: 2024-07-21 21:45:42 +0100


_No description found._

---

## PR #5: feat: add supabase-driven admin artworks page
- Author: luismtns
- Link: https://github.com/luismtns/omentejovem-project/pull/5


## Summary
- replace old dashboard with modular admin layout and artworks table
- fetch artworks from Supabase REST API
- simplify admin login redirect and cleanup legacy JSON endpoints

## Testing
- `npm run lint`

------
https://chatgpt.com/codex/tasks/task_e_68afd03fe968832ca26edb945a29c78e

---

## PR #20: feat: implement server-side rendering for newsletter page
- Author: luismtns
- Link: https://github.com/luismtns/omentejovem-project/pull/20


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

## PR #19: refactor: eliminate NFT conversion layer and standardize Artwork structure across all pages
- Author: app/copilot-swe-agent
- Link: https://github.com/luismtns/omentejovem-project/pull/19


This PR completely refactors the artwork data handling across the entire application to use the new Supabase Artwork structure directly, eliminating the unnecessary conversion layer that was mapping `Artwork` → `NFT` format for legacy compatibility.

## Problem Statement

Multiple pages (Portfolio, 1/1, Editions, Series) were using complex 70+ line `convertArtworkToNFT` functions to transform Supabase Artwork data into a legacy NFT format just to maintain compatibility with existing components. This created:

- **Unnecessary complexity**: Complex conversion logic that was hard to maintain
- **Performance overhead**: Converting data that was already in the correct format
- **Type safety issues**: Multiple format conversions prone to errors
- **Poor modularity**: Tight coupling between database format and UI components
- **Build failures**: TypeScript errors preventing deployment on Vercel

## Solution

Implemented a clean, direct approach using the new Artwork structure across all pages:

**Before:**
```typescript
// Complex conversion with 70+ lines
function convertArtworkToNFT(artwork: ArtworkWithSeries): NFT {
  // ... 70+ lines of complex mapping logic
}

// Usage in components
const nftImages: NFT[] = artworks.map(convertArtworkToNFT)
```

**After:**
```typescript
// Simple, direct processing
function processArtwork(artwork: ArtworkWithSeries): ProcessedArtwork {
  // ... 15 lines of clean transformation
}

// Usage in components  
const processedArtworks = artworks.map(processArtwork)
```

## Key Changes

### Build and Deployment Fixes
- **Package Manager**: Removed `package-lock.json` and properly configured Yarn 4.9.4 via Corepack
- **TypeScript Errors**: Fixed all compilation errors across Portfolio, 1/1, Editions, and Series pages
- **Seed Script**: Corrected import path in `/api/admin/seed/route.ts`
- **Vercel Compatibility**: Ensured successful production builds for deployment

### New Type System
- **`ProcessedArtwork`**: Clean interface designed specifically for frontend consumption
- **`ArtworkWithSeries`**: Extended Supabase type with series relationships
- **`processArtwork()`**: Lightweight conversion function focused on UI needs

### Refactored Components (All Pages)
- **Portfolio Context**: Now manages `ProcessedArtwork[]` instead of `NFT[]`
- **1/1 Context**: Updated to use consistent artwork structure
- **Editions Context**: Migrated from external API to Supabase with new structure
- **Series Context**: Standardized to match other pages
- **ArtMainContent**: Updated to work directly with artwork data across all pages

### Architecture Improvements
- **Direct Data Flow**: `Supabase → ProcessArtwork → Components` for all pages
- **Type Safety**: Eliminated conversion errors with specific TypeScript interfaces
- **Modularity**: Each component has a single, clear responsibility
- **Maintainability**: Code is now self-documenting and easier to extend
- **Consistency**: All pages follow the same data handling patterns

## Visual Compatibility

The refactoring maintains **100% visual compatibility** with the original design. All existing functionality, layouts, and user interactions remain identical across all pages - only the underlying data structure has been improved.

## Performance Impact

- **Reduced Processing**: Eliminated unnecessary data transformations across all pages
- **Faster Loading**: Direct use of database format reduces conversion overhead
- **Better Memory Usage**: Simpler data structures with less nested complexity
- **Successful Builds**: Fixed deployment issues that were blocking Vercel deployments

## Testing

- ✅ TypeScript compilation passes without errors
- ✅ ESLint validation passes
- ✅ Production build succeeds (resolves Vercel deployment issues)
- ✅ All pages (Portfolio, 1/1, Editions, Series) function correctly
- ✅ Visual regression testing confirms identical UI across all pages
- ✅ Yarn dependency management working properly

This change establishes a solid foundation for future artwork-related features while significantly improving code quality, maintainability, and deployment reliability across the entire application.

<!-- START COPILOT CODING AGENT SUFFIX -->



<!-- START COPILOT CODING AGENT TIPS -->
---

✨ Let Copilot coding agent [set things up for you](https://github.com/luismtns/omentejovem-project/issues/new?title=✨+Set+up+Copilot+instructions&body=Configure%20instructions%20for%20this%20repository%20as%20documented%20in%20%5BBest%20practices%20for%20Copilot%20coding%20agent%20in%20your%20repository%5D%28https://gh.io/copilot-coding-agent-tips%29%2E%0A%0A%3COnboard%20this%20repo%3E&assignees=copilot) — coding agent works faster and does higher quality work when set up for your repo.


---

## PR #4: Enable optimized Next.js images for Vercel Blob
- Author: luismtns
- Link: https://github.com/luismtns/omentejovem-project/pull/4


## Summary
- allow remote images from `*.blob.vercel-storage.com`
- use `next/image` for admin dashboard previews and modal images

## Testing
- `npm run lint`
- `npm run build`
- `npm start` (via `curl -I http://localhost:3000`)


------
https://chatgpt.com/codex/tasks/task_e_68ae6b0d4ea8832c89887b47b8d4be26

---

## PR #2: feat(admin): manage mint and metadata entries
- Author: luismtns
- Link: https://github.com/luismtns/omentejovem-project/pull/2


## Summary
- allow admins to add, edit and delete mint dates and token metadata
- support updating/deleting token metadata via GitHub API
- document GitHub API token and env configuration

## Testing
- `npm test` *(fails: Missing script "test")*
- `npm run lint`


------
https://chatgpt.com/codex/tasks/task_e_68ae6b057cec832ca19d5457b5971ccf

---

## Merge commit: 


_No description found._

---

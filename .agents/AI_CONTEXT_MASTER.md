# AI Context Master - Omentejovem

> **Arquivo mestre de contexto para agentes de IA**
>
> Centraliza todas as informações técnicas e padrões para desenvolvimento assistido por IA no projeto Omentejovem CMS.

---

## 📋 Índice de Contextos

### 🏗️ Arquitetura e Padrões

- [`ARCHITECTURE_PATTERNS.md`](./ARCHITECTURE_PATTERNS.md) - Padrões arquiteturais e Services
- [`TECH_STACK.md`](./TECH_STACK.md) - Stack técnica completa
- [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) - Schema Supabase e RLS

### 🛠️ Desenvolvimento

- [`DEVELOPMENT_PATTERNS.md`](./DEVELOPMENT_PATTERNS.md) - Padrões de código e convenções
- [`PERFORMANCE_OPTIMIZATIONS.md`](./PERFORMANCE_OPTIMIZATIONS.md) - Otimizações de performance

### 📁 Sistema de Dados

- [`DATA_MIGRATION_CONTEXT.md`](./DATA_MIGRATION_CONTEXT.md) - Contexto sobre migrações
- [`LEGACY_DATA_INSTRUCTIONS.md`](./LEGACY_DATA_INSTRUCTIONS.md) - Instruções dados legados
- [`BACKEND_ORIENTED_APPROACH.md`](./BACKEND_ORIENTED_APPROACH.md) - Abordagem backend-oriented

### 🔧 Deploy e Configuração

- [`DEPLOYMENT_CONTEXT.md`](./DEPLOYMENT_CONTEXT.md) - Contexto de deploy e produção
- [`SUPABASE_CLI_GUIDE.md`](./SUPABASE_CLI_GUIDE.md) - Guia do CLI Supabase

### 📝 Fluxos de Trabalho

- [`PR_GUIDELINES.md`](./PR_GUIDELINES.md) - Diretrizes para PRs

---

## 🎯 Objetivo Geral

**CMS modular e replicável** usando **Supabase** + **Next.js 14** para portfólio de NFTs (arte digital). Painel admin para gestão e páginas públicas: **Home**, **Portfolio**, **1/1**, **Series**, **Artifacts** e **Sobre**.

---

## 🚀 Status Atual

**Sistema funcional e pronto para produção**:

- ✅ Admin completo com CRUD
- ✅ Páginas públicas implementadas
- ✅ Arquitetura Services production-ready
- ✅ Upload e proxy de imagens funcionando
- ✅ Migração de dados legados concluída
- ✅ Build com 249+ páginas estáticas

---

## 🔄 Como Usar Este Contexto

### Para Agentes de IA

1. **Leia este arquivo primeiro** para entender a estrutura
2. **Consulte arquivos específicos** conforme necessário
3. **Sempre verifique padrões** antes de implementar
4. **Siga as convenções** estabelecidas nos contextos

### Para Desenvolvedores

1. **Contexto técnico** está em `.agents/`
2. **Documentação geral** está em `docs/`
3. **Setup rápido** via `ENVIRONMENT_SETUP.md`
4. **Padrões de código** via `DEVELOPMENT_PATTERNS.md`

---

## ⚠️ Diretrizes Importantes

- **Services Architecture**: Sempre usar `BaseService` como classe pai
- **Client Supabase**: Gerenciado apenas pelo `BaseService`
- **DYNAMIC_SERVER_USAGE**: Evitado através da arquitetura BaseService
- **Páginas dinâmicas**: Adicionar `export const dynamic = 'force-dynamic'`
- **Error handling**: Padronizado via `executeQuery` e `safeExecuteQuery`

---

**Última atualização**: Setembro 2025
**Branch atual**: `refactor/pages-data-fetching`
**Status**: Produção-ready após refatoração Services

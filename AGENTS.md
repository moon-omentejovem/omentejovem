# AGENTS.md — Omentejovem CMS (Supabase)

> **ARQUIVO REORGANIZADO**
>
> Este arquivo foi reorganizado em módulos menores para melhor manutenção. O contexto completo para agentes de IA agora está centralizado na pasta `.agents/`.

---

## 📋 Nova Estrutura de Documentação

### 🤖 Para Agentes de IA

**Contexto técnico completo** na pasta `.agents/`:

- **[AI_CONTEXT_MASTER.md](.agents/AI_CONTEXT_MASTER.md)** - 📋 Arquivo índice principal
- **[ARCHITECTURE_PATTERNS.md](.agents/ARCHITECTURE_PATTERNS.md)** - 🏗️ Padrões Services e BaseService
- **[TECH_STACK.md](.agents/TECH_STACK.md)** - 🛠️ Stack técnica completa
- **[DEVELOPMENT_PATTERNS.md](.agents/DEVELOPMENT_PATTERNS.md)** - 📝 Convenções de código
- **[DATABASE_SCHEMA.md](.agents/DATABASE_SCHEMA.md)** - 🗃️ Schema Supabase e RLS
- **[BACKEND_ORIENTED_APPROACH.md](.agents/BACKEND_ORIENTED_APPROACH.md)** - 🎯 Abordagem backend-oriented
- **[DATA_MIGRATION_CONTEXT.md](.agents/DATA_MIGRATION_CONTEXT.md)** - 📁 Contexto de migrações
- **[DEPLOYMENT_CONTEXT.md](.agents/DEPLOYMENT_CONTEXT.md)** - 🚀 Deploy e produção
- **[PR_GUIDELINES.md](.agents/PR_GUIDELINES.md)** - 📝 Diretrizes para PRs

### 📚 Para Desenvolvedores

**Documentação geral** na pasta `docs/`:

- **[SUPABASE-INTEGRATION.md](docs/SUPABASE-INTEGRATION.md)** - Como usar Supabase corretamente
- **[BACKEND_ORIENTED_FRONTEND.md](docs/BACKEND_ORIENTED_FRONTEND.md)** - Arquitetura backend-oriented
- **[SEED-SYSTEM.md](docs/SEED-SYSTEM.md)** - Sistema de seed automático

### 📖 Arquivo Principal

- **[README.md](README.md)** - Visão geral completa do projeto

---

## 🎯 Resumo Executivo

**Sistema funcional e pronto para produção**:

- ✅ **CMS Completo** - Admin panel com CRUD para artworks, séries e artifacts
- ✅ **Páginas Públicas** - Portfolio otimizado com 249+ páginas estáticas
- ✅ **Arquitetura Services** - BaseService pattern production-ready
- ✅ **Migração Concluída** - 95 artworks, 5 séries, 44 relacionamentos
- ✅ **Performance Otimizada** - Build sem erros DYNAMIC_SERVER_USAGE
- ✅ **Deploy Automático** - Seed system integrado ao Vercel

---

## 🔧 Status Técnico Atual

### Arquitetura Implementada

```typescript
// Padrão BaseService (Production-Ready)
export abstract class BaseService {
  protected static async getSupabaseClient() {
    // Context detection: build vs runtime
    return await createProductionClient()
  }

  protected static async executeQuery<T>(queryFn) {
    // Centralized error handling
  }
}

// Services especializados
export class ArtworkService extends BaseService {
  static getArtworks = cache(async (filters) => {
    // React cache() + error handling
  })
}
```

**Atenção:** Não existe mais campo de path de imagem no banco. Use apenas image_url ou cover_image_url para armazenar referências de imagem.

### Resultados de Build

- **✅ 249+ páginas estáticas** geradas
- **✅ Zero DYNAMIC_SERVER_USAGE** errors
- **✅ Build time** ~60-90 segundos
- **✅ Bundle size** < 2MB total

---

### 🚨 Diretrizes Importantes

### ✅ O que Usar

- **Services APENAS** - Nunca cliente Supabase direto
- **BaseService pattern** - Sempre herdar de BaseService
- **React cache()** - Automático nos Services
- **Static generation** - generateStaticParams implementado
- **Campos de imagem:** Use apenas image_url ou cover_image_url. Não crie nem utilize campos de path de imagem.

### ❌ O que Evitar

- **Cliente Supabase direto** em pages/components
- **Lógica de negócio** em utils/supabase
- **Multiple sources of truth** - Backend é única fonte
- **Páginas sem generateStaticParams** para rotas dinâmicas
- **Campos de path de imagem** - Não utilize, não crie, não migre.

---

## 📄 Migração do Contexto

Este arquivo original foi **reorganizado** para melhor manutenção:

1. **Contexto técnico para IA** → `.agents/` (9 arquivos especializados)
2. **Documentação geral** → `docs/` (3 arquivos principais)
3. **Visão geral** → `README.md` (arquivo principal)

**Benefícios**:

- ✅ Contexto modular e específico
- ✅ Manutenção mais fácil
- ✅ Melhor organização por tipo de uso
- ✅ Referências centralizadas

---

**Para acesso rápido ao contexto completo, comece por**: [`.agents/AI_CONTEXT_MASTER.md`](.agents/AI_CONTEXT_MASTER.md)

**Última reorganização**: Setembro 2025
**Status**: ✅ Produção-ready com documentação modular

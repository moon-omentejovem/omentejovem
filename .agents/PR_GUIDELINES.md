# Diretrizes para PRs - Omentejovem

> **Contexto para geração de PRs para agentes de IA**
>
> Padrões e templates para criar pull requests consistentes.

---

## 🎯 Padrões de PR

### Título (Inglês)

```
<type>: <concise description in English>
```

**Tipos Válidos**:

- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `refactor` - Refatoração sem mudança funcional
- `style` - Mudanças de estilo/formatação
- `docs` - Atualizações de documentação
- `chore` - Tarefas de manutenção
- `perf` - Melhorias de performance
- `test` - Adição/correção de testes

**Exemplos**:

- `feat: implement BaseService architecture for production-safe data fetching`
- `fix: resolve DYNAMIC_SERVER_USAGE error in series pages`
- `refactor: unify artwork hooks and simplify data fetching logic`

---

## 📝 Template de PR (Português)

```markdown
## 📋 Resumo das Alterações

[Descrição concisa das mudanças principais em português - 2-3 frases]

## ✨ Principais Funcionalidades

### 🆕 Novas Funcionalidades

- **[Funcionalidade]**: [`/caminho/para/arquivo`](caminho) - Descrição da nova funcionalidade

### 🔧 Melhorias Existentes

- **[Componente/Sistema]**: Descrição das melhorias implementadas

## 🔄 Mudanças Técnicas

### 🏗️ Arquitetura

- **[Sistema]**: Descrição das mudanças arquiteturais importantes

### 📦 Dependências (se aplicável)

- **[Pacote]**: versão anterior → nova versão - motivo da atualização

### 🗃️ Banco de Dados (se aplicável)

- **[Tabela/Schema]**: Descrição das alterações de schema/queries

## 🎯 Experiência do Usuário

### ✅ Melhorias de Performance/Interface

- **[Área]**: Descrição das melhorias na interface e interações

### 🚀 Performance

- **[Métrica]**: Resultado específico (ex: "Build time reduzido em 30%")

## 🔗 Arquivos Modificados

### 🆕 Novos Arquivos

- [`caminho/para/arquivo`](caminho) - Descrição da funcionalidade do novo arquivo

### 🔧 Arquivos Aprimorados

- [`caminho/para/arquivo`](caminho) - Descrição das melhorias específicas

### 🗑️ Arquivos Removidos (se aplicável)

- **Removido**: `caminho/para/arquivo` - Motivo da remoção e impacto

## ⚠️ Breaking Changes (se aplicável)

- **[Sistema/API]**: Descrição do breaking change
- **Migração**: Passos necessários para atualizar código dependente

## 🧪 Testes Realizados

- [x] Funcionalidade X testada e validada
- [x] Build completo executado com sucesso
- [x] Performance verificada em desenvolvimento
- [x] Compatibilidade verificada em diferentes browsers/dispositivos

## 📊 Métricas de Impacto

### 🏗️ Build & Deploy

- **Páginas estáticas geradas**: X → Y (+Z% de aumento)
- **Tempo de build**: X segundos → Y segundos
- **Bundle size**: X MB → Y MB

### 🚀 Performance

- **Lighthouse Score**: X → Y
- **Core Web Vitals**: LCP/FID/CLS improvements
- **Load time**: X ms → Y ms

## ✅ Impacto Geral

[Resumo do impacto geral das mudanças no projeto - 2-3 frases sobre como isso melhora o sistema]
```

---

## 🎨 Exemplos de PRs por Tipo

### feat: Nova Funcionalidade

```markdown
## 📋 Resumo das Alterações

Implementação da arquitetura BaseService para gerenciamento centralizado do cliente Supabase, resolvendo erros de `DYNAMIC_SERVER_USAGE` em produção e estabelecendo padrão de herança para todos os Services.

## ✨ Principais Funcionalidades

### 🆕 Novas Funcionalidades

- **BaseService**: [`src/services/base.service.ts`](src/services/base.service.ts) - Classe abstrata base para gerenciamento inteligente do cliente Supabase
- **Context Detection**: Detecção automática entre build-time e runtime para evitar erros de produção
- **Error Handling**: Sistema centralizado de tratamento de erros com fallbacks seguros

### 🔧 Melhorias Existentes

- **ArtworkService**: Refatorado para herdar de BaseService com cache automático via React cache()
- **SeriesService**: Implementação completa com generateStaticParams para static generation
- **ArtifactService**: Padronização com BaseService e métodos de busca otimizados
```

### fix: Correção de Bug

```markdown
## 📋 Resumo das Alterações

Correção do erro `DYNAMIC_SERVER_USAGE` que estava impedindo a geração estática das páginas de séries em produção, implementando context detection inteligente no cliente Supabase.

## 🔄 Mudanças Técnicas

### 🏗️ Arquitetura

- **Cliente Supabase**: Implementação de fallback automático entre createClient() e createBuildClient()
- **Static Generation**: Adição de generateStaticParams para páginas dinâmicas de séries
- **Error Handling**: Tratamento graceful de falhas de cliente durante build

## 🧪 Testes Realizados

- [x] Build completo executado sem erros DYNAMIC_SERVER_USAGE
- [x] 249 páginas estáticas geradas com sucesso
- [x] Páginas de séries funcionando corretamente em produção
```

### refactor: Refatoração

```markdown
## 📋 Resumo das Alterações

Unificação da arquitetura de data fetching através do padrão Services com herança BaseService, eliminando duplicação de código entre utils/supabase e services, e simplificando o gerenciamento de cliente Supabase.

## 🔄 Mudanças Técnicas

### 🏗️ Arquitetura

- **Services Pattern**: Implementação de herança BaseService para centralizar lógica comum
- **Code Deduplication**: Eliminação de duplicação entre utils/supabase/server.ts e services
- **Simplified Factory**: utils/supabase/server.ts agora contém apenas factory functions

## 🔗 Arquivos Modificados

### 🆕 Novos Arquivos

- [`src/services/base.service.ts`](src/services/base.service.ts) - Classe base com cliente Supabase inteligente

### 🔧 Arquivos Aprimorados

- [`src/services/artwork.service.ts`](src/services/artwork.service.ts) - Refatorado para herdar de BaseService
- [`src/services/series.service.ts`](src/services/series.service.ts) - Implementação completa com BaseService
- [`src/utils/supabase/server.ts`](src/utils/supabase/server.ts) - Simplificado para apenas factory functions
```

---

## 🔧 Guidelines para Agentes

### ✅ Sempre Incluir

1. **Resumo claro** em português do que foi alterado
2. **Arquivos modificados** com links relativos
3. **Impacto técnico** explicado de forma didática
4. **Testes realizados** com checklist
5. **Métricas** quando aplicável (build time, páginas geradas, etc.)

### 📝 Seções Opcionais

- **Breaking Changes**: Apenas quando há mudanças incompatíveis
- **Dependências**: Apenas quando há atualizações de pacotes
- **Banco de Dados**: Apenas quando há mudanças de schema
- **Performance**: Quando há melhorias mensuráveis

### 🎯 Tom e Linguagem

- **Técnico mas acessível**: Explicar conceitos para stakeholders não-técnicos
- **Orientado a resultados**: Focar no impacto das mudanças
- **Português claro**: Evitar anglicismos desnecessários
- **Emojis consistentes**: Usar para organização visual

### 📊 Métricas Importantes

- **Build metrics**: Tempo, páginas geradas, bundle size
- **Performance**: Lighthouse scores, load times
- **Code quality**: Linhas de código reduzidas, duplicação eliminada
- **Functionality**: Features implementadas, bugs corrigidos

---

## 🚨 Red Flags para Evitar

### ❌ Títulos Vagos

```
// ❌ Ruim
fix: update files

// ✅ Bom
fix: resolve DYNAMIC_SERVER_USAGE error in series pages
```

### ❌ Descrições Técnicas Demais

```markdown
// ❌ Ruim
Refatoração do padrão Composition para Inheritance no BaseService através da implementação de abstract class com protected static methods para executeQuery e safeExecuteQuery utilizando generic constraints.

// ✅ Bom
Implementação da arquitetura BaseService para centralizar o gerenciamento do cliente Supabase, resolvendo erros de produção e estabelecendo padrão consistente para todos os Services.
```

### ❌ Listas Sem Contexto

```markdown
// ❌ Ruim

- Modified src/services/artwork.service.ts
- Modified src/services/series.service.ts
- Modified src/utils/supabase/server.ts

// ✅ Bom

- [`src/services/artwork.service.ts`](src/services/artwork.service.ts) - Refatorado para herdar de BaseService com cache automático
- [`src/services/series.service.ts`](src/services/series.service.ts) - Implementação completa com generateStaticParams
- [`src/utils/supabase/server.ts`](src/utils/supabase/server.ts) - Simplificado para apenas factory functions
```

---

**Padrão Estabelecido**: Título inglês + conteúdo português
**Objetivo**: Comunicação clara com stakeholders técnicos e não-técnicos
**Status**: Template pronto para uso

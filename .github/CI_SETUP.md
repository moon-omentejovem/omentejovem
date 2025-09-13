# 🚀 CI/CD Setup - Omentejovem

## ✅ Status dos Workflows

### Problemas Corrigidos:

- ✅ **Yarn 4.9.4**: Habilitado via `corepack enable`
- ✅ **Dependências**: Usando `yarn install --immutable`
- ✅ **Build Environment**: Variáveis mock para CI
- ✅ **Seed System**: Skip automático no CI via `SKIP_SEED=true`

### Workflows Implementados:

#### 1. **CI (ci.yml)**

```yaml
Jobs:
  - lint-and-type-check # ESLint + TypeScript + Prettier
  - build # Build completo com mocks
  - test-services # Validação arquitetura Services
  - security-audit # Verificações de segurança
```

#### 2. **Lighthouse (lighthouse.yml)**

```yaml
Jobs:
  - lighthouse # Performance audit das páginas principais
```

#### 3. **Security (security.yml)**

```yaml
Jobs:
  - security-scan # yarn audit + verificação de arquivos sensíveis
  - dependency-review # Review de dependências em PRs
```

## 🔧 Como Funciona no CI

### Ambiente Mock

Os workflows usam valores mock para build quando secrets não estão disponíveis:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://mock.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
SUPABASE_SERVICE_ROLE_KEY=mock-service-role-key
ADMIN_EMAIL=admin@test.com
SKIP_SEED=true
```

### Yarn 4.9.4 Support

```yaml
- name: 🔧 Enable Corepack
  run: corepack enable

- name: 📚 Install dependencies
  run: yarn install --immutable
```

### Validação Services

```bash
# Verifica se Services seguem padrão BaseService
# Alerta sobre uso direto de Supabase client
# Permite exceções com comentário: // CI: ignore-supabase-usage
```

## 📋 Setup no GitHub

### 1. Habilitar Actions

- Settings > Actions > General
- Allow all actions and reusable workflows

### 2. Configurar Secrets (Opcional)

Se você quiser builds com dados reais:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
SUPABASE_SERVICE_ROLE_KEY=sua_service_key
ADMIN_EMAIL=seu_email
```

### 3. Branch Protection

Settings > Branches > Add rule para `main`:

- ✅ Require status checks: `lint-and-type-check`, `build`
- ✅ Require up-to-date branches
- ✅ Require pull request reviews

## 🎯 Badges Disponíveis

As badges foram adicionadas ao README.md:

- **CI**: Status dos builds e testes
- **Lighthouse**: Link para relatórios de performance
- **Security**: Status dos security scans

## ⚠️ Avisos Importantes

### 1. Yarn Version

O projeto usa **Yarn 4.9.4** via Corepack. O CI habilita automaticamente.

### 2. Build com Mocks

Builds funcionam mesmo sem secrets reais. Valores mock são usados apenas para compilação.

### 3. Seed System

- Produção: Seed automático após build
- CI: Seed desabilitado via `SKIP_SEED=true`

### 4. Validação Arquitetura

CI verifica se o código segue padrão Services/BaseService e alerta sobre uso direto de Supabase.

## 🚀 Próximos Passos

1. **Push este setup** para main
2. **Primeira PR** vai executar todos workflows
3. **Configurar secrets** (opcional mas recomendado)
4. **Configurar branch protection**
5. **Monitorar** primeiras execuções

---

**Status**: ✅ Production-ready com Yarn 4.9.4 support
**Última atualização**: Setembro 2025

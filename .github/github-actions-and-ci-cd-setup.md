# GitHub Actions & CI/CD Setup para Omentejovem

Este diretório contém a configuração completa de CI/CD para o projeto Omentejovem.

## 🎯 Workflows Implementados

### 1. **CI (Continuous Integration)** - `ci.yml`

- ✅ **Lint & Type Check**: ESLint + TypeScript + Prettier
- ✅ **Build Validation**: Build completo com fallbacks
- ✅ **Services Architecture**: Validação do padrão Services/BaseService
- ✅ **Security Audit**: Verificação básica de segurança

**Triggers:**

- Push para `main`
- Pull Requests para `main`

### 2. **Lighthouse CI** - `lighthouse.yml`

- ✅ **Performance Audit**: Score mínimo de 80%
- ✅ **Accessibility**: Score mínimo de 90%
- ✅ **SEO & Best Practices**: Score mínimo de 90%
- ✅ **Multiple Pages**: Home, Portfolio, 1-1

**Triggers:**

- Push para `main`
- Pull Requests para `main`

### 3. **Security Audit** - `security.yml`

- ✅ **Dependency Scan**: `yarn audit` com nível moderate
- ✅ **Sensitive Files**: Verificação de .env e chaves hardcoded
- ✅ **Weekly Schedule**: Execução automática semanal
- ✅ **Dependency Review**: Review automático em PRs

**Triggers:**

- Push para `main`
- Pull Requests para `main`
- Schedule: Domingos às 2h UTC

## 🔧 Configurações

### Dependabot (`dependabot.yml`)

- 📦 **npm dependencies**: Updates semanais agrupados
- 🎭 **GitHub Actions**: Updates semanais
- 👤 **Auto-assign**: Para `luismtns`
- 🏷️ **Labels**: `dependencies`, `automated`

### Lighthouse (`lighthouserc.js`)

- 🎯 **Performance**: Mínimo 80%
- ♿ **Accessibility**: Mínimo 90%
- 🔍 **SEO**: Mínimo 90%
- ⚡ **Best Practices**: Mínimo 90%

### Pull Request Template

- 📋 **Checklist completo** com validações específicas do projeto
- 🎯 **Tipos de mudança** categorizados
- ✅ **Verificações obrigatórias** incluindo padrão Services

## 🚀 Setup no GitHub

### 1. Configurar Secrets (Opcional)

Para builds mais completos, adicione no GitHub Settings > Secrets:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
ADMIN_EMAIL=admin@seudominio.com
```

**Nota**: O CI funcionará mesmo sem secrets (usando valores mock).

### 2. Habilitar Actions

- Vá em **Settings > Actions > General**
- Selecione **"Allow all actions and reusable workflows"**
- Salve as configurações

### 3. Branch Protection (Recomendado)

- Vá em **Settings > Branches**
- Adicione regra para `main`:
  - ✅ Require status checks: `lint-and-type-check`, `build`
  - ✅ Require up-to-date branches
  - ✅ Require pull request reviews

## 🏷️ Badges Disponíveis

As badges foram atualizadas no README.md:

- **CI Status**: Status do build e testes
- **Lighthouse**: Link para relatórios de performance
- **Security**: Status do security scan

## 📊 Relatórios Gerados

### CI Artifacts

- **Build artifacts**: `.next/` (3 dias de retenção)
- **Security reports**: Relatórios detalhados (30 dias)

### Lighthouse

- **Performance reports**: Publicados temporariamente
- **Comparação**: Desktop vs Mobile (se configurado)

## 🔧 Troubleshooting

### Build Fails

- Verifique se todos os secrets estão configurados
- `SKIP_SEED=true` evita problemas de seed no CI
- Build usa valores mock se secrets não estiverem disponíveis

### Security Scan Issues

- Adicione exceções no `security.yml` se necessário
- Use `# CI: ignore-supabase-usage` para exceções específicas

### Lighthouse Timeouts

- Server start tem timeout de 60s
- Ajuste o `sleep` se necessário para builds mais lentos

## 🎯 Próximos Passos

1. **Push este setup** para `main`
2. **Criar primeira PR** para testar workflows
3. **Configurar secrets** se necessário
4. **Configurar branch protection** no GitHub
5. **Monitorar** primeiras execuções

---

**Status**: ✅ Production-ready
**Última atualização**: Setembro 2025

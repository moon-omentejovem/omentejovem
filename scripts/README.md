# 🎨 Scripts Omentejovem - Sistema Organizado

Scripts organizados por categoria para manutenção e operação do sistema NFT portfolio.

## 📊 **Status Final: MIGRAÇÃO 100% CONCLUÍDA**

- ✅ **95 artworks** migrados com sucesso
- ✅ **81 NFTs** com dados essenciais
- ✅ **86 imagens** migradas para Supabase Storage
- ✅ **0 URLs externas** restantes
- ✅ **100% independência** de CDNs externos

---

## 📁 Estrutura Organizada

### 🗄️ [`legacy/`](./legacy/) - **Scripts de Migração Legacy**

Scripts para migração inicial de dados do sistema legado.

| Script                          | Status       | Função                                    |
| ------------------------------- | ------------ | ----------------------------------------- |
| `migrate-legacy-data.js`        | ✅ ESSENCIAL | Migração principal de dados (95 artworks) |
| `migrate-essential-nft-data.js` | ✅ ESSENCIAL | Metadados NFT essenciais (81 NFTs)        |

**Uso**: Executar apenas uma vez durante setup inicial.

### 🚀 [`migration/`](./migration/) - **Scripts de Migração de Conteúdo**

Scripts para migração de imagens, vídeos e páginas.

| Script                    | Status       | Função                                   |
| ------------------------- | ------------ | ---------------------------------------- |
| `migrate-images.js`       | ✅ ESSENCIAL | Migração padrão de imagens (86 migradas) |
| `migrate-large-images.js` | ✅ ESSENCIAL | Otimização agressiva (98.8% redução)     |
| `migrate-video-urls.js`   | ✅ CONCLUÍDO | Correção de URLs de vídeo                |
| `migrate-about-page.js`   | ✅ CONCLUÍDO | Migração para formato Tiptap             |

**Uso**: Para migração de conteúdo específico.

### 📊 [`analysis/`](./analysis/) - **Scripts de Análise e Relatórios**

Scripts para monitoramento e análise do sistema.

| Script                          | Status       | Função                                |
| ------------------------------- | ------------ | ------------------------------------- |
| `complete-migration-summary.js` | ✅ ESSENCIAL | Relatório completo do sistema         |
| `migration-report.js`           | ✅ ESSENCIAL | Status de migração de imagens         |
| `final-migration-check.js`      | ✅ ÚTIL      | Verificação legacy ↔ Supabase        |
| `analyze-missing-data.js`       | 📋 HISTÓRICO | Análise detalhada (usado na migração) |

**Uso**: Monitoramento contínuo e relatórios.

### 🔧 [`maintenance/`](./maintenance/) - **Scripts de Manutenção**

Scripts para limpeza, otimização e manutenção.

| Script               | Status         | Função                        |
| -------------------- | -------------- | ----------------------------- |
| `cleanup.js`         | ✅ ESSENCIAL   | Limpeza automática do sistema |
| `data-tools.js`      | 🔧 ÚTIL        | Ferramentas de verificação    |
| `enhance-data.js`    | ✅ APLICADO    | Melhoramento pós-migração     |
| `check-remaining.js` | 📋 VERIFICAÇÃO | Itens restantes para migração |

**Uso**: Manutenção semanal/mensal.

### 🐛 [`debug/`](./debug/) - **Scripts de Debug**

Scripts para troubleshooting e correção de problemas.

| Script                     | Função                          |
| -------------------------- | ------------------------------- |
| `debug-comparison.js`      | Debug de comparação de nomes    |
| `debug-name-comparison.js` | Análise de caracteres especiais |
| `fix-apostrophe.js`        | Correção de aspas curvas/retas  |
| `fix-exact-match.js`       | Força correspondência exata     |
| `test-migrate-images.js`   | Teste de migração com subset    |
| `check-missing-artwork.js` | Busca detalhada por artwork     |

**Uso**: Desenvolvimento e resolução de problemas.

### 🛠️ [`utils/`](./utils/) - **Scripts Utilitários**

Scripts para deploy, backup e operações gerais.

| Script               | Status       | Função                     |
| -------------------- | ------------ | -------------------------- |
| `vercel-seed.js`     | ✅ ESSENCIAL | Seed automático no deploy  |
| `backup-database.js` | ✅ ESSENCIAL | Backup completo do sistema |
| `health-check.js`    | ✅ ESSENCIAL | Verificação de saúde       |
| `deploy-helper.js`   | ✅ ESSENCIAL | Assistente de deploy       |
| `seed-database.sql`  | 📄 SQL       | Seed manual (SQL)          |

**Uso**: Operações diárias e deploy.

---

## 🚀 Guias de Uso Rápido

### **Setup Inicial (Novo Sistema)**

```bash
# 1. Migrar dados legacy
node scripts/legacy/migrate-legacy-data.js

# 2. Migrar metadados NFT
node scripts/legacy/migrate-essential-nft-data.js

# 3. Migrar imagens
node scripts/migration/migrate-images.js
node scripts/migration/migrate-large-images.js

# 4. Verificar resultado
node scripts/analysis/complete-migration-summary.js
```

### **Deploy Automático (Vercel)**

```json
// package.json - configuração automática
{
  "scripts": {
    "postbuild": "node scripts/utils/vercel-seed.js"
  }
}
```

### **Manutenção Semanal**

```bash
# 1. Health check
node scripts/utils/health-check.js

# 2. Limpeza (preview)
node scripts/maintenance/cleanup.js --dry-run

# 3. Aplicar limpeza se necessário
node scripts/maintenance/cleanup.js

# 4. Backup
node scripts/utils/backup-database.js
```

### **Monitoramento Contínuo**

```bash
# Status geral
node scripts/analysis/complete-migration-summary.js

# Relatório de imagens
node scripts/analysis/migration-report.js

# Verificação de integridade
node scripts/utils/health-check.js
```

---

## 📊 Métricas do Sistema

### **Database**

- **95 artworks** total
- **81 NFTs** com dados essenciais
- **5 séries** organizadas
- **44 relacionamentos** série-artwork

### **Storage**

- **92 raw files** (JPEG otimizado)
- **92 optimized files** (WebP)
- **~80% economia** vs originais
- **100% migrado** para Supabase Storage

### **Performance**

- **Conectividade**: <100ms
- **Database queries**: <200ms
- **Storage listing**: <500ms
- **Health check**: <2s

---

## 🎯 Scripts Essenciais por Situação

### **🆕 Setup Inicial**

1. `legacy/migrate-legacy-data.js` - Dados base
2. `legacy/migrate-essential-nft-data.js` - Metadados NFT
3. `migration/migrate-images.js` - Imagens
4. `utils/health-check.js` - Verificação

### **🔄 Deploy**

1. `utils/vercel-seed.js` - Automático no Vercel
2. `utils/deploy-helper.js` - Validação pós-deploy
3. `utils/health-check.js` - Confirmação

### **🧹 Manutenção**

1. `maintenance/cleanup.js` - Limpeza
2. `utils/backup-database.js` - Backup
3. `analysis/complete-migration-summary.js` - Relatório
4. `utils/health-check.js` - Saúde

### **🐛 Troubleshooting**

1. `utils/health-check.js` - Identificar problema
2. `debug/debug-*.js` - Debug específico
3. `debug/fix-*.js` - Aplicar correções
4. `analysis/final-migration-check.js` - Validar

---

## 🔗 Links Úteis

- **[Legacy README](./legacy/README.md)** - Migração de dados legados
- **[Migration README](./migration/README.md)** - Migração de conteúdo
- **[Analysis README](./analysis/README.md)** - Análise e relatórios
- **[Maintenance README](./maintenance/README.md)** - Manutenção
- **[Debug README](./debug/README.md)** - Troubleshooting
- **[Utils README](./utils/README.md)** - Utilitários

---

## ⚡ Quick Commands

```bash
# Status rápido do sistema
node scripts/analysis/complete-migration-summary.js

# Health check
node scripts/utils/health-check.js

# Backup
node scripts/utils/backup-database.js

# Limpeza
node scripts/maintenance/cleanup.js --dry-run

# Deploy helper
node scripts/utils/deploy-helper.js
```

---

## 🎉 Conquistas da Organização

- ✅ **Scripts categorizados** por função
- ✅ **READMEs detalhados** para cada categoria
- ✅ **Documentação completa** de uso
- ✅ **Comandos essenciais** identificados
- ✅ **Workflows estabelecidos** para cada situação
- ✅ **Sistema pronto** para produção

**Sistema totalmente organizado e documentado** 🚀

**Sistema totalmente organizado e documentado** 🚀

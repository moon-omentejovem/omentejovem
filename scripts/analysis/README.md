# 📊 Scripts de Análise

Scripts para análise, verificação e relatórios do sistema.

## 📁 Scripts Disponíveis

### `complete-migration-summary.js` ✅ ESSENCIAL

**Relatório completo do status da migração**

Gera visão geral de todo o sistema:

- Status de migração por categoria
- Distribuição por blockchain/coleção
- Contagem de artworks/NFTs
- Artworks com vídeos
- Issues detectadas

```bash
# Relatório completo
node scripts/analysis/complete-migration-summary.js
```

**Saída exemplo**:

```
📊 RELATÓRIO FINAL DA MIGRAÇÃO
========================================

📈 DADOS ESSENCIAIS NFT MIGRADOS:
✅ Total de artworks com contract_address: 81
📝 Artworks sem dados NFT: 14

🌐 DISTRIBUIÇÃO POR BLOCKCHAIN:
   ethereum: 75 NFTs
   tezos: 6 NFTs

🎨 DISTRIBUIÇÃO POR COLEÇÃO:
   superrare: 23 NFTs
   omentejovem: 15 NFTs
   stories-on-circles: 10 NFTs
```

### `migration-report.js` ✅ ESSENCIAL

**Relatório detalhado de migração de imagens**

Analisa status da migração de imagens:

- URLs por domínio de origem
- Estatísticas de storage
- Progresso da migração
- Arquivos pendentes

```bash
# Relatório de imagens
node scripts/analysis/migration-report.js

# Apenas falhas
node scripts/analysis/migration-report.js --failed

# Por domínio específico
node scripts/analysis/migration-report.js --domain="ipfs"
```

### `final-migration-check.js` ✅ ÚTIL

**Verificação final da correspondência legacy ↔ Supabase**

Compara dados entre sistema legacy e Supabase:

- Correspondência de nomes/títulos
- Tokens não encontrados
- Campos essenciais populados
- Estatísticas de conversão

```bash
# Verificação final
node scripts/analysis/final-migration-check.js
```

### `analyze-missing-data.js` 📋 HISTÓRICO

**Análise detalhada de dados faltantes (usado durante migração)**

Script usado durante processo de migração para identificar gaps:

- Estrutura de dados legacy
- Campos não migrados
- Metadados ricos preservados
- Estatísticas detalhadas

```bash
# Análise completa (histórico)
node scripts/analysis/analyze-missing-data.js
```

## 🔄 Uso Recomendado

### Verificação Pós-Deploy

```bash
# 1. Status geral do sistema
node scripts/analysis/complete-migration-summary.js

# 2. Health check
node scripts/utils/health-check.js

# 3. Verificar migração de imagens
node scripts/analysis/migration-report.js
```

### Troubleshooting

```bash
# Verificar correspondência de dados
node scripts/analysis/final-migration-check.js

# Análise detalhada (se necessário)
node scripts/analysis/analyze-missing-data.js
```

### Monitoramento Contínuo

```bash
# Relatório semanal
node scripts/analysis/complete-migration-summary.js > reports/weekly-$(date +%Y%m%d).txt

# Check de saúde diário
node scripts/utils/health-check.js
```

## 📊 Tipos de Relatório

### 🎯 **Status Summary**

- Contagens gerais do sistema
- Distribuições por categoria
- Percentuais de sucesso
- Issues conhecidas

### 📁 **Migration Report**

- Status de migração por origem
- Estatísticas de storage
- Performance da migração
- Arquivos problemáticos

### 🔍 **Health Check**

- Conectividade com Supabase
- Integridade do banco
- Storage funcionando
- Performance básica

### 📋 **Legacy Analysis**

- Correspondência de dados
- Campos não migrados
- Estrutura preservada
- Metadados ricos

## 📈 Outputs Típicos

### Distribuição por Blockchain

```
🌐 DISTRIBUIÇÃO POR BLOCKCHAIN:
   ethereum: 75 NFTs (92.6%)
   tezos: 6 NFTs (7.4%)
```

### Coleções Principais

```
🎨 DISTRIBUIÇÃO POR COLEÇÃO:
   superrare: 23 NFTs (28.4%)
   omentejovem: 15 NFTs (18.5%)
   stories-on-circles: 10 NFTs (12.3%)
   shapesncolors: 10 NFTs (12.3%)
```

### Storage Status

```
📁 STORAGE STATUS:
   ✅ Raw files: 92
   ✅ Optimized files: 92
   📊 Total migrated: 86 images
   🎯 Success rate: 100%
```

## 🔧 Automação

### Scripts Programáticos

```bash
# Verificação automática (CI/CD)
if node scripts/analysis/complete-migration-summary.js | grep -q "✅"; then
    echo "Sistema healthy"
else
    echo "Issues detectadas"
    exit 1
fi
```

### Cron Jobs

```bash
# Verificação diária (crontab)
0 9 * * * cd /app && node scripts/utils/health-check.js >> logs/health-$(date +%Y%m).log
```

## 📊 Métricas Importantes

### **Performance**

- Query time < 100ms
- Storage listing < 500ms
- Health check < 2s

### **Integridade**

- 100% artworks com image_url válida
- 0 relacionamentos órfãos
- 0 arquivos não utilizados

### **Cobertura**

- 81/95 artworks com dados NFT (85.3%)
- 86/95 imagens migradas (90.5%)
- 0 URLs externas restantes (100%)

## ⚠️ Alertas

### 🚨 **Críticos**

- Conectividade Supabase falhou
- Banco inacessível
- Storage indisponível

### ⚠️ **Atenção**

- Performance degradada (>2s)
- Arquivos órfãos detectados
- Relacionamentos inconsistentes

### 💡 **Informativos**

- Novos artworks sem NFT data
- Cache miss alto
- Storage quota >80%

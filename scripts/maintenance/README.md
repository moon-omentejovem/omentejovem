# 🔧 Scripts de Manutenção

Scripts para manutenção, otimização e limpeza do sistema.

## 📁 Scripts Disponíveis

### `cleanup.js` ✅ ESSENCIAL

**Limpeza automática do sistema**

Remove dados desnecessários e otimiza o banco:

- ❌ **Relacionamentos órfãos** em `series_artworks`
- 📁 **Arquivos não utilizados** no storage
- 🔄 **Relacionamentos duplicados**
- 🧹 **Otimização geral** do sistema

```bash
# Análise sem alterações
node scripts/maintenance/cleanup.js --dry-run

# Limpeza completa
node scripts/maintenance/cleanup.js

# Verificar resultado
node scripts/analysis/complete-migration-summary.js
```

**Saída exemplo**:

```
🧹 Iniciando limpeza do sistema...

🔍 Verificando relacionamentos órfãos...
✅ Nenhum relacionamento órfão encontrado

📁 Verificando arquivos não utilizados...
❌ Encontrados 3 arquivos não utilizados
   Raw: 2, Optimized: 1

📊 RESUMO DA LIMPEZA
=====================
🔗 Relacionamentos órfãos: 0
📁 Arquivos não utilizados: 3
🔄 Relacionamentos duplicados: 0
✅ Total de itens limpos: 3
```

### `data-tools.js` 🔧 ÚTIL

**Ferramentas para verificação e manutenção de dados**

Comandos para manutenção avançada:

- 🔍 **Verify**: Verificar integridade dos dados
- 🧹 **Clean**: Limpar dados duplicados
- 💾 **Export**: Exportar backup dos dados

```bash
# Verificar integridade
node scripts/maintenance/data-tools.js verify

# Limpar duplicatas
node scripts/maintenance/data-tools.js clean

# Exportar backup
node scripts/maintenance/data-tools.js export

# Ver comandos disponíveis
node scripts/maintenance/data-tools.js --help
```

### `enhance-data.js` ✅ APLICADO

**Melhoramento e enriquecimento de dados**

Aplica melhorias pós-migração:

- ✅ **Padronização de slugs**
- ✅ **Otimização de metadados**
- ✅ **Validação de relacionamentos**
- ✅ **Normalização de dados**

```bash
# Aplicar melhorias
node scripts/maintenance/enhance-data.js

# Preview das melhorias
node scripts/maintenance/enhance-data.js --dry-run
```

### `check-remaining.js` 📋 VERIFICAÇÃO

**Verificação de itens restantes para migração**

Identifica dados que ainda precisam ser migrados:

- URLs externas não migradas
- Campos vazios ou nulos
- Relacionamentos faltantes
- Inconsistências de dados

```bash
# Verificar itens restantes
node scripts/maintenance/check-remaining.js

# Relatório detalhado
node scripts/maintenance/check-remaining.js --detailed
```

## 🔄 Rotinas Recomendadas

### Manutenção Semanal

```bash
# 1. Limpeza preventiva
node scripts/maintenance/cleanup.js --dry-run

# 2. Se encontrar issues, aplicar limpeza
node scripts/maintenance/cleanup.js

# 3. Verificar integridade
node scripts/maintenance/data-tools.js verify

# 4. Health check
node scripts/utils/health-check.js
```

### Manutenção Mensal

```bash
# 1. Backup completo
node scripts/utils/backup-database.js

# 2. Análise completa
node scripts/analysis/complete-migration-summary.js

# 3. Verificar arquivos órfãos
node scripts/maintenance/cleanup.js --dry-run

# 4. Otimizar se necessário
node scripts/maintenance/enhance-data.js
```

### Pós-Deploy

```bash
# 1. Deploy helper
node scripts/utils/deploy-helper.js

# 2. Verificação de dados
node scripts/maintenance/check-remaining.js

# 3. Limpeza preventiva
node scripts/maintenance/cleanup.js --dry-run
```

## 🎯 Objetivos da Manutenção

### 🧹 **Limpeza**

- Remover dados órfãos e duplicados
- Otimizar storage utilizado
- Manter relacionamentos consistentes
- Reduzir overhead desnecessário

### 🔍 **Verificação**

- Validar integridade dos dados
- Identificar inconsistências
- Monitorar performance
- Detectar problemas precocemente

### 📈 **Otimização**

- Melhorar performance de queries
- Normalizar estruturas de dados
- Atualizar índices e estatísticas
- Aplicar best practices

### 💾 **Backup**

- Preservar dados críticos
- Permitir rollback seguro
- Documentar estado do sistema
- Facilitar disaster recovery

## 📊 Tipos de Limpeza

### 🔗 **Relacionamentos Órfãos**

```sql
-- Detecta relacionamentos que apontam para registros inexistentes
SELECT sa.* FROM series_artworks sa
LEFT JOIN artworks a ON sa.artwork_id = a.id
LEFT JOIN series s ON sa.series_id = s.id
WHERE a.id IS NULL OR s.id IS NULL;
```

### 📁 **Arquivos Não Utilizados**

```bash
# Storage files que não são referenciados em artworks.image_url
supabase/storage/media/artworks/raw/unused-file.jpg
supabase/storage/media/artworks/optimized/unused-file.webp
```

### 🔄 **Duplicatas**

```sql
-- Relacionamentos duplicados artwork-series
SELECT artwork_id, series_id, COUNT(*) as count
FROM series_artworks
GROUP BY artwork_id, series_id
HAVING COUNT(*) > 1;
```

## ⚡ Performance Tips

### **Índices Importantes**

```sql
-- Verificar se existem
CREATE INDEX IF NOT EXISTS idx_artworks_contract ON artworks(contract_address);
CREATE INDEX IF NOT EXISTS idx_series_artworks_artwork ON series_artworks(artwork_id);
CREATE INDEX IF NOT EXISTS idx_series_artworks_series ON series_artworks(series_id);
```

### **Query Optimization**

```sql
-- Sempre usar WHERE clauses específicas
-- Evitar SELECT * em queries grandes
-- Usar LIMIT quando apropriado
-- Preferir EXISTS over IN para subqueries
```

## 🚨 Alertas e Monitoramento

### **Alertas Críticos**

- ❌ Relacionamentos órfãos > 0
- 📁 Storage usage > 90%
- 🔄 Duplicatas > 5
- ⚡ Query time > 1s

### **Alertas de Atenção**

- ⚠️ Arquivos não utilizados > 10
- 📊 Database size crescendo >20%/mês
- 🔍 Verificações falhando
- 💾 Backup há >7 dias

### **Métricas de Saúde**

```bash
# Executar periodicamente
node -e "
const metrics = {
  totalArtworks: 95,
  artworksWithNFTData: 81,
  storageFiles: 184,
  relationshipsCount: 44
};
console.log('Métricas:', metrics);
"
```

## 🔧 Automação

### **Cron Jobs Sugeridos**

```bash
# Limpeza semanal (domingo 2h)
0 2 * * 0 cd /app && node scripts/maintenance/cleanup.js >> logs/cleanup.log

# Backup mensal (1º dia 3h)
0 3 1 * * cd /app && node scripts/utils/backup-database.js >> logs/backup.log

# Health check diário (9h)
0 9 * * * cd /app && node scripts/utils/health-check.js >> logs/health.log
```

### **CI/CD Integration**

```yaml
# GitHub Actions exemplo
- name: Database Maintenance
  run: |
    node scripts/maintenance/cleanup.js --dry-run
    node scripts/utils/health-check.js
```

## ⚠️ Precauções

### **Antes da Limpeza**

- ✅ Fazer backup dos dados
- ✅ Executar em modo `--dry-run` primeiro
- ✅ Verificar período de baixo tráfego
- ✅ Ter rollback plan preparado

### **Durante a Execução**

- 📊 Monitorar logs em tempo real
- ⏱️ Verificar performance do sistema
- 🚨 Estar preparado para interromper se necessário
- 📱 Ter alertas configurados

### **Após a Limpeza**

- ✅ Executar health check
- 📊 Verificar métricas de performance
- 🔍 Validar integridade dos dados
- 📝 Documentar resultados

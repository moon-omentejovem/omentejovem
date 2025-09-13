# 🗂️ Scripts Temporários

Esta pasta contém scripts que foram usados durante o desenvolvimento e migrações específicas, mas não são mais necessários para operação normal do sistema.

## 📁 Conteúdo

### 🔧 Scripts de Migração Raw Image URL (Setembro 2025)

- `apply-raw-image-url-migration.js` - Aplicação da migração SQL para adicionar campo raw_image_url
- `populate-raw-image-urls.js` - População inicial dos URLs de imagem raw
- `fix-raw-image-urls.js` - Correção de URLs 404 devido a estrutura incorreta do bucket
- `investigate-bucket-structure.js` - Investigação da estrutura real do bucket Supabase

### 🐛 Scripts de Debug Legacy

- `debug-comparison.js` - Debug de comparação de nomes durante migração
- `debug-name-comparison.js` - Análise de caracteres especiais e encoding
- `debug-missing-token.js` - Investigação de tokens não migrados
- `debug-stories-tokens.js` - Debug específico da coleção Stories on Circles
- `check-missing-artwork.js` - Busca detalhada por artworks específicos

### 🔧 Scripts de Correção Específica

- `fix-apostrophe.js` - Correção de problemas com aspas curvas/retas
- `fix-to-curved-apostrophe.js` - Conversão específica para aspas curvas
- `fix-exact-match.js` - Força correspondência exata de nomes
- `fix-missing-artwork.js` - Correção manual de artworks específicos

### 🧪 Scripts de Teste e Desenvolvimento

- `test-migrate-images.js` - Teste de migração com subset de imagens
- `test-all-scripts.js` - Teste automatizado de todos os scripts
- `test-connection.js` - Teste básico de conectividade Supabase
- `show-structure.js` - Exibição da estrutura organizada dos scripts

### 📊 Scripts de Análise Histórica

- `analyze-missing-data.js` - Análise detalhada de dados faltantes (usado na migração inicial)
- `quick-analysis.js` - Análise rápida de status do sistema

## ⚠️ Importante

### ⛔ **NÃO EXECUTE esses scripts em produção**

Estes scripts foram criados para situações específicas e já cumpriram seu propósito. Executá-los novamente pode:

- Duplicar dados
- Corromper informações existentes
- Causar inconsistências no banco
- Impactar performance

### 🗃️ **Propósito da Preservação**

Mantemos estes scripts para:

- **Referência histórica** - Entender como problemas foram resolvidos
- **Debugging futuro** - Adaptar soluções para novos problemas similares
- **Documentação** - Exemplo de como implementar correções específicas
- **Rollback** - Em caso de necessidade de reverter mudanças

### 🧹 **Limpeza Futura**

Esta pasta pode ser removida após:

- ✅ Confirmação de que todas as migrações estão estáveis
- ✅ Sistema em produção sem problemas relacionados
- ✅ Documentação adequada das soluções implementadas
- ✅ Período de 6+ meses sem necessidade de referência

## 📚 Como Usar para Referência

### 🔍 **Para Debug de Problemas Similares**

1. **Problema de caracteres especiais**: Consulte `debug-name-comparison.js`
2. **Migração de imagens falhando**: Consulte `test-migrate-images.js`
3. **URLs de storage incorretas**: Consulte `investigate-bucket-structure.js`
4. **Correspondência de nomes**: Consulte `debug-comparison.js`

### 🛠️ **Para Desenvolvimento de Novas Correções**

1. Copie o padrão de um script similar
2. Adapte para o novo problema
3. Teste em ambiente de desenvolvimento
4. Documente a solução
5. Move o script para `tmp/` após uso

### 📖 **Para Entender Decisões Técnicas**

- **Por que usar bucket artworks/raw/?** → `investigate-bucket-structure.js`
- **Como corrigir caracteres especiais?** → `fix-apostrophe.js`
- **Como testar migrações?** → `test-migrate-images.js`
- **Como fazer correspondência de nomes?** → `debug-comparison.js`

## 🎯 Scripts Ativos Recomendados

Para operações normais, use os scripts das pastas principais:

```bash
# Verificação de saúde
node scripts/utils/health-check.js

# Relatório do sistema
node scripts/analysis/complete-migration-summary.js

# Backup
node scripts/utils/backup-database.js

# Limpeza
node scripts/maintenance/cleanup.js --dry-run
```

## 🚨 Avisos de Segurança

### ⚠️ Scripts Potencialmente Destrutivos

- `fix-*` scripts podem alterar dados sem backup
- `populate-*` scripts podem duplicar informações
- `apply-*` scripts podem alterar estrutura do banco

### ✅ Scripts Seguros para Consulta

- `debug-*` scripts apenas fazem análise
- `investigate-*` scripts apenas coletam informações
- `test-connection.js` apenas testa conectividade
- `show-structure.js` apenas exibe informações

---

**💡 Dica**: Sempre faça backup antes de executar qualquer script de correção, mesmo os da pasta `tmp/`!

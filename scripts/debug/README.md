# 🐛 Scripts de Debug

Scripts para debug, correção de problemas e desenvolvimento.

## 📁 Scripts Disponíveis

### 🔍 **Scripts de Debug Específicos**

#### `debug-comparison.js`

**Debug de comparação de nomes entre legacy e Supabase**

Analisa diferenças na comparação de títulos:

- Comparação caractere por caractere
- Detecção de caracteres especiais
- Algoritmos de busca
- Encoding issues

```bash
node scripts/debug/debug-comparison.js
```

#### `debug-name-comparison.js`

**Análise detalhada de nomes problemáticos**

Identifica problemas específicos de nomenclatura:

- Caracteres Unicode vs ASCII
- Aspas curvas vs retas
- Espaçamentos inconsistentes
- Case sensitivity

```bash
node scripts/debug/debug-name-comparison.js
```

#### `debug-stories-tokens.js`

**Debug específico da coleção Stories on Circles**

Analisa tokens de uma coleção específica:

- Listagem de todos os tokens
- Verificação de contratos
- Identificação de missing tokens

```bash
node scripts/debug/debug-stories-tokens.js
```

#### `debug-missing-token.js`

**Debug de tokens não encontrados**

Investiga tokens que não foram migrados:

- Busca em diferentes formatos
- Verificação de variações de nome
- Análise de estrutura de dados

```bash
node scripts/debug/debug-missing-token.js
```

### 🔧 **Scripts de Correção**

#### `fix-apostrophe.js`

**Correção de problemas com aspas**

Corrige inconsistências de caracteres de aspas:

- Aspas retas vs curvas
- Unicode normalization
- Character encoding fixes

```bash
node scripts/debug/fix-apostrophe.js
```

#### `fix-to-curved-apostrophe.js`

**Conversão para aspas curvas**

Converte aspas retas para curvas quando necessário:

- Correspondência com dados legacy
- Preservação de formatação original

```bash
node scripts/debug/fix-to-curved-apostrophe.js
```

#### `fix-exact-match.js`

**Correção de correspondência exata**

Força correspondência exata copiando dados do legacy:

- Copia título exato do legacy
- Resolve discrepâncias de encoding
- Garante match perfeito

```bash
node scripts/debug/fix-exact-match.js
```

#### `fix-missing-artwork.js`

**Correção de artwork específico faltante**

Corrige dados específicos de artwork não migrado:

- Atualização de campos essenciais
- Correção de relacionamentos
- Validação pós-correção

```bash
node scripts/debug/fix-missing-artwork.js
```

### 🧪 **Scripts de Teste**

#### `test-migrate-images.js`

**Teste de migração de imagens com subset**

Testa migração com pequeno conjunto de imagens:

- Validação de processo
- Debug de erros específicos
- Performance testing

```bash
# Teste com 5 imagens
node scripts/debug/test-migrate-images.js --limit=5

# Teste dry-run
node scripts/debug/test-migrate-images.js --dry-run
```

#### `check-missing-artwork.js`

**Verificação de artwork específico**

Busca detalhada por artwork específico:

- Múltiplas estratégias de busca
- Análise de variações de nome
- Debug de queries

```bash
node scripts/debug/check-missing-artwork.js
```

## 🔄 Workflow de Debug

### **1. Identificação do Problema**

```bash
# Verificar status geral
node scripts/analysis/complete-migration-summary.js

# Identificar issues específicas
node scripts/analysis/final-migration-check.js
```

### **2. Debug Específico**

```bash
# Para problemas de nome/comparação
node scripts/debug/debug-comparison.js

# Para tokens específicos
node scripts/debug/debug-missing-token.js

# Para coleções específicas
node scripts/debug/debug-stories-tokens.js
```

### **3. Aplicação de Correções**

```bash
# Correções de caracteres
node scripts/debug/fix-apostrophe.js

# Correções de correspondência
node scripts/debug/fix-exact-match.js

# Correções de dados específicos
node scripts/debug/fix-missing-artwork.js
```

### **4. Validação**

```bash
# Verificar se problema foi resolvido
node scripts/analysis/final-migration-check.js

# Health check geral
node scripts/utils/health-check.js
```

## 🎯 Casos de Uso Comuns

### **Problema: Token não encontrado**

```bash
# 1. Investigar o token
node scripts/debug/debug-missing-token.js

# 2. Verificar variações de nome
node scripts/debug/debug-name-comparison.js

# 3. Aplicar correção se necessário
node scripts/debug/fix-missing-artwork.js
```

### **Problema: Caracteres especiais**

```bash
# 1. Analisar diferenças
node scripts/debug/debug-comparison.js

# 2. Aplicar correção de aspas
node scripts/debug/fix-apostrophe.js

# 3. Forçar match exato se necessário
node scripts/debug/fix-exact-match.js
```

### **Problema: Migração de imagens falhando**

```bash
# 1. Testar com subset
node scripts/debug/test-migrate-images.js --limit=3

# 2. Analisar logs específicos
node scripts/debug/test-migrate-images.js --debug

# 3. Aplicar correções na migração principal
```

## 📊 Padrões de Problemas

### **Encoding Issues**

```javascript
// Caracteres problemáticos comuns
const issues = {
  apostrophe: { ascii: "'", unicode: "'" }, // 39 vs 8217
  quotes: { ascii: '"', unicode: '"' }, // 34 vs 8220/8221
  dash: { ascii: '-', unicode: '—' } // 45 vs 8212
}
```

### **Nome Variations**

```javascript
// Variações de busca comuns
const variations = [
  original,
  original.toLowerCase(),
  original.replace(/['']/g, "'"),
  original.replace(/[""]/g, '"'),
  original.trim()
]
```

### **Contract Address Issues**

```javascript
// Problemas de contrato comuns
const contractIssues = {
  missing: 'contract_address IS NULL',
  invalid: 'LENGTH(contract_address) != 42',
  wrong_format: 'NOT contract_address LIKE "0x%"'
}
```

## 🛠️ Ferramentas de Debug

### **Character Analysis**

```javascript
// Analisar caracteres de uma string
function analyzeString(str) {
  return str.split('').map((char, i) => ({
    position: i,
    char: char,
    code: char.charCodeAt(0),
    unicode: char.codePointAt(0)
  }))
}
```

### **Database Queries**

```sql
-- Buscar artworks problemáticos
SELECT title, slug, contract_address
FROM artworks
WHERE contract_address IS NULL
   OR title LIKE '%''%'  -- aspas curvas
   OR title LIKE '%"%';  -- aspas especiais
```

### **Storage Verification**

```javascript
// Verificar se arquivo existe no storage
async function checkStorageFile(path) {
  const { data, error } = await supabase.storage
    .from('media')
    .list(path.split('/').slice(0, -1).join('/'))

  const filename = path.split('/').pop()
  return data?.find((file) => file.name === filename)
}
```

## ⚡ Performance Tips

### **Debug Eficiente**

- 🎯 Use scripts específicos para problemas específicos
- 🔍 Analise logs em modo verbose quando necessário
- 📊 Compare antes/depois das correções
- 🚀 Execute em ambiente de desenvolvimento primeiro

### **Batch Processing**

```javascript
// Processar em lotes para evitar timeout
async function processBatch(items, batchSize = 10) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.all(batch.map(processItem))

    // Delay entre lotes
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}
```

## ⚠️ Precauções

### **Antes de Executar**

- ✅ Fazer backup dos dados
- ✅ Testar em ambiente de desenvolvimento
- ✅ Entender o impacto da correção
- ✅ Ter plan de rollback

### **Durante Execução**

- 📊 Monitorar logs em tempo real
- 🚨 Estar preparado para interromper
- 📱 Verificar integridade dos dados
- ⏱️ Monitorar performance

### **Após Execução**

- ✅ Validar correções aplicadas
- 📊 Executar verificações de integridade
- 📝 Documentar soluções encontradas
- 🔄 Atualizar scripts principais se necessário

## 📚 Referências

### **Character Encoding**

- [Unicode Character Database](https://unicode.org/ucd/)
- [JavaScript String methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

### **Supabase APIs**

- [Database API](https://supabase.com/docs/guides/database)
- [Storage API](https://supabase.com/docs/guides/storage)

### **Debug Patterns**

- Console.log com JSON.stringify para objetos complexos
- Process.exit(0) para interromper execução controlada
- Try/catch com logs detalhados para error handling

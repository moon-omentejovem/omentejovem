# 🗄️ Scripts Legacy

Scripts para migração de dados do sistema legado para o novo sistema Supabase.

## 📁 Scripts Disponíveis

### `migrate-legacy-data.js` ✅ ESSENCIAL

**Principal script de migração de dados legados**

Migra todos os dados do `public/token-metadata.json` para o Supabase:

- ✅ 95 artworks migrados
- ✅ 5 séries criadas automaticamente
- ✅ 44 relacionamentos série-artwork
- ✅ Descrições convertidas para Tiptap
- ✅ Slugs únicos gerados

```bash
# Execução principal (uma vez apenas)
node scripts/legacy/migrate-legacy-data.js

# Verificar antes de executar
node scripts/legacy/migrate-legacy-data.js --dry-run
```

### `migrate-essential-nft-data.js` ✅ ESSENCIAL

**Migração de metadados NFT essenciais**

Popula campos essenciais NFT no banco:

- `contract_address` - Endereço do contrato
- `blockchain` - Ethereum/Tezos
- `collection_slug` - Identificador da coleção

```bash
# Executar após migrate-legacy-data.js
node scripts/legacy/migrate-essential-nft-data.js
```

**Resultados**: 81 artworks com dados NFT essenciais

## 🔄 Ordem de Execução

### Primeira Migração (Sistema Novo)

```bash
# 1. Migrar dados base
node scripts/legacy/migrate-legacy-data.js

# 2. Migrar metadados NFT
node scripts/legacy/migrate-essential-nft-data.js

# 3. Verificar resultado
node scripts/analysis/complete-migration-summary.js
```

### Re-execução (se necessário)

⚠️ **ATENÇÃO**: Estes scripts verificam dados existentes e **NÃO** duplicam informações.

## 📊 Dados Migrados

### De: `public/token-metadata.json`

- **78 tokens NFT** com metadata completa
- **Attributes, tags, URLs** preservados no legacy
- **Contratos, blockchains** mapeados

### Para: **Supabase Database**

- **Campos essenciais** para performance
- **Relacionamentos** otimizados
- **Dados ricos** acessíveis via API futura

## 🏗️ Arquitetura

### **Database (Essencial)**

```sql
-- Campos migrados
contract_address VARCHAR   -- Para identificação
blockchain VARCHAR        -- ethereum/tezos
collection_slug VARCHAR   -- Agrupamento
title, description        -- Dados base
slug, image_url          -- Frontend
```

### **Legacy (Rico)**

```json
// Preservado em public/token-metadata.json
{
  "attributes": [...],    // Metadata NFT completa
  "tags": [...],         // Classificações
  "tokenUri": "...",     // URI original
  "image": { ... },      // URLs originais
  "contract": { ... }    // Dados detalhados
}
```

## 🎯 Benefícios

### ✅ **Performance**

- Queries rápidas com campos indexados
- Relacionamentos otimizados no banco
- Dados ricos via API quando necessário

### ✅ **Escalabilidade**

- Schema lean no banco principal
- Metadata rica preservada no legacy
- Arquitetura preparada para API

### ✅ **Manutenibilidade**

- Scripts idempotentes (re-executáveis)
- Verificações de integridade automáticas
- Logs detalhados para debugging

## ⚠️ Importante

- **Executar apenas uma vez** em produção
- **Backup antes** de re-executar em dev
- **Verificar logs** para possíveis issues
- **Dados ricos** permanecem no legacy para API futura

## 📈 Status Final

- ✅ **100% migração concluída**
- ✅ **81 NFTs** com dados essenciais
- ✅ **95 artworks** total no sistema
- ✅ **Correspondência perfeita** legacy ↔ Supabase

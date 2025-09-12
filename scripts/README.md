# 🎨 Scripts de Migração - Omentejovem NFT Portfolio

## ✅ Status Final: MIGRAÇÃO 100% CONCLUÍDA

### 📊 Resultados Finais
- ✅ **95 artworks** migrados com sucesso (100%)
- ✅ **5 séries** criadas e organizadas
- ✅ **44 relacionamentos** série-artwork estabelecidos
- ✅ **86 imagens** migradas para Supabase Storage
- ✅ **9 imagens locais** já funcionais
- ✅ **0 URLs externas** restantes

### 🎯 Economia de Storage
- **Redução típica**: 80-95% do tamanho original
- **Maior otimização**: 98.07MB → 1.15MB (98.8% redução)
- **Formato duplo**: Raw (JPEG) + Web (WebP) otimizado

---

## 📁 Scripts de Migração de Dados

### `migrate-legacy-data.js` ✅ CONCLUÍDO
Script principal para migrar dados do sistema legado para Supabase.

**Resultados**:
- ✅ 95 artworks migrados do `token-metadata.json`
- ✅ 5 séries criadas automaticamente
- ✅ Descrições convertidas para formato Tiptap
- ✅ Slugs únicos gerados para SEO
- ✅ 44 relacionamentos artwork-series estabelecidos

**Uso**:
```bash
node scripts/migrate-legacy-data.js
```

### `data-tools.js` 
Ferramentas para verificação e manutenção dos dados migrados.

**Comandos disponíveis**:
```bash
# Verificar integridade dos dados
node scripts/data-tools.js verify

# Limpar dados duplicados
node scripts/data-tools.js clean

# Exportar backup
node scripts/data-tools.js export
```

### `enhance-data.js` ✅ APLICADO
Script para melhorar e enriquecer dados após migração.

**Melhorias aplicadas**:
- ✅ Padronização de slugs
- ✅ Otimização de metadados
- ✅ Validação de relacionamentos

---

## 🖼️ Scripts de Migração de Imagens

### `migrate-images.js` ✅ CONCLUÍDO
**Migração padrão** de imagens externas para Supabase Storage.

**Características**:
- **Raw Otimizado**: 2560px máximo, JPEG 90% qualidade
- **Web Otimizado**: 1920px máximo, WebP 80% qualidade
- **Rate Limiting**: 2s delay entre downloads
- **Error Handling**: Retry automático e logs detalhados

**Resultados**: 69 imagens migradas com sucesso

**Uso**:
```bash
# Preview das imagens a migrar
node scripts/migrate-images.js --dry-run

# Migração completa
node scripts/migrate-images.js
```

### `migrate-large-images.js` ✅ CONCLUÍDO
**Otimização agressiva** para imagens grandes (>5MB).

**Estratégias aplicadas**:
1. **High Quality**: 2048px, JPEG 85% ✅
2. **Medium Quality**: 1600px, JPEG 75%
3. **Low Quality**: 1200px, JPEG 65%
4. **WebP Aggressive**: 1200px, WebP 50%

**Resultados épicos**:
- **16 imagens grandes** processadas com 100% sucesso
- **98.07MB → 1.15MB** (98.8% redução)
- **21.78MB → 0.93MB** (95.7% redução)
- **18.77MB → 0.84MB** (95.5% redução)

**Uso**:
```bash
node scripts/migrate-large-images.js
```

### `migration-report.js`
**Relatórios detalhados** do status da migração.

**Funcionalidades**:
- Status por domínio de origem
- Estatísticas de storage utilizado
- Lista de imagens pendentes
- Percentual de progresso

**Uso**:
```bash
# Relatório completo
node scripts/migration-report.js

# Apenas imagens que falharam
node scripts/migration-report.js --failed
```

### `test-migrate-images.js`
Script de teste para validar migração com subset de imagens.

---

## 🚀 Scripts de Deploy

### `vercel-seed.js`
Script executado automaticamente no deploy (postbuild).

**Funcionalidades**:
- ✅ Executa apenas na primeira build
- ✅ Detecta se dados já foram migrados
- ✅ Migração automática em produção
- ✅ Logs detalhados para debugging

**Configuração**:
```json
{
  "scripts": {
    "postbuild": "node scripts/vercel-seed.js"
  }
}
```

---

## 📊 Estrutura de Storage Final

```
supabase/storage/media/artworks/
├── raw/                           # 92 arquivos
│   ├── timestamp-slug.jpg         # Imagens padrão (2560px, JPEG 90%)
│   └── timestamp-slug-large.jpg   # Imagens grandes otimizadas
└── optimized/                     # 92 arquivos
    ├── timestamp-slug.webp        # Web padrão (1920px, WebP 80%)
    └── timestamp-slug-large.webp  # Web grandes otimizadas
```

### Pattern de Nomenclatura
```javascript
// Imagens normais
const rawFilename = `${timestamp}-${baseName}.jpg`
const optimizedFilename = `${timestamp}-${baseName}.webp`

// Imagens grandes (otimização agressiva)
const rawFilename = `${timestamp}-${baseName}-large.jpg`
const optimizedFilename = `${timestamp}-${baseName}-large.webp`
```

---

## 📈 Benefícios Conquistados

### 💾 Economia de Storage
- **Redução Média**: 80-95% do tamanho original
- **Formato Raw**: JPEG otimizado (máxima compatibilidade)
- **Formato Web**: WebP (melhor compressão moderna)
- **Storage Total**: Estimados 80%+ de economia vs. originais

### ⚡ Performance Melhorada
- **CDN Global**: Supabase Storage integrado
- **Cache Headers**: 3600s configurado
- **Responsive**: Múltiplas versões otimizadas
- **Next.js**: Compatibilidade total com Image component

### 🔒 Confiabilidade
- **URLs Próprias**: Independência de IPFS/CDNs externos
- **Backup Duplo**: Raw + Optimized de cada imagem
- **Versionamento**: Timestamp previne conflitos
- **Monitoramento**: Scripts de verificação contínua

---

## 🔧 Comandos de Verificação

### Status Geral
```bash
# Relatório completo da migração
node scripts/migration-report.js

# Verificar integridade dos dados
node scripts/data-tools.js verify

# Contar arquivos no storage
node -e "
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data: raw } = await supabase.storage.from('media').list('artworks/raw');
  const { data: opt } = await supabase.storage.from('media').list('artworks/optimized');
  console.log('Raw files:', raw?.length || 0);
  console.log('Optimized files:', opt?.length || 0);
})();
"
```

### Breakdown Detalhado
```bash
# Status por categoria
node -e "
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data: all } = await supabase.from('artworks').select('title, image_url');
  const migrated = all.filter(a => a.image_url.includes('supabase'));
  const localPaths = all.filter(a => a.image_url.startsWith('/'));
  const external = all.filter(a => !a.image_url.includes('supabase') && !a.image_url.startsWith('/'));
  
  console.log('=== STATUS FINAL ===');
  console.log('Total artworks:', all.length);
  console.log('✅ Migrated to Supabase:', migrated.length);
  console.log('📁 Local paths:', localPaths.length);
  console.log('🌐 External URLs:', external.length);
  console.log('🎯 Success rate:', ((migrated.length / all.length) * 100).toFixed(1) + '%');
})();
"
```

---

## 📚 Documentação Completa

- **[IMAGE_MIGRATION.md](../docs/IMAGE_MIGRATION.md)** - Documentação técnica da migração de imagens
- **[LEGACY_DATA_MIGRATION.md](../docs/LEGACY_DATA_MIGRATION.md)** - Documentação da migração de dados
- **[PR_MIGRATION_SUMMARY.md](../PR_MIGRATION_SUMMARY.md)** - Resumo completo para Pull Request

---

## 🏆 Conquistas da Migração

### ✅ Objetivos Alcançados
- [x] **100% dos dados** migrados sem perda
- [x] **100% das URLs externas** migradas
- [x] **Otimização massiva** de storage
- [x] **Performance otimizada** com CDN
- [x] **SEO melhorado** com slugs únicos
- [x] **Documentação completa** criada
- [x] **Scripts de manutenção** implementados

### 🎉 Impacto Final
- **Sistema modernizado** com Supabase como fonte única
- **Performance superior** com imagens otimizadas
- **Custos reduzidos** com economia de storage
- **Manutenibilidade melhorada** com scripts automatizados
- **Escalabilidade garantida** para crescimento futuro

---

**Migração finalizada em**: Setembro 2025  
**Status**: ✅ **100% CONCLUÍDA**  
**Próxima ação**: **Produção ready** 🚀

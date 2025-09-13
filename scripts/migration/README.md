# 🚀 Scripts de Migração

Scripts para migração de conteúdo específico (imagens, vídeos, páginas).

## 📁 Scripts Disponíveis

### `migrate-images.js` ✅ ESSENCIAL

**Migração padrão de imagens externas para Supabase Storage**

Migra imagens de URLs externas (IPFS, CDNs) para storage próprio:

- **Raw**: 2560px máximo, JPEG 90% qualidade
- **Optimized**: 1920px máximo, WebP 80% qualidade
- **Rate limiting**: 2s delay entre downloads
- **Error handling**: Retry automático

```bash
# Preview sem alterações
node scripts/migration/migrate-images.js --dry-run

# Migração completa
node scripts/migration/migrate-images.js

# Apenas URLs específicas
node scripts/migration/migrate-images.js --filter="ipfs"
```

**Resultados**: 69 imagens migradas com sucesso

### `migrate-large-images.js` ✅ ESSENCIAL

**Otimização agressiva para imagens grandes (>5MB)**

Estratégias de compressão para imagens grandes:

1. **High Quality**: 2048px, JPEG 85%
2. **Medium Quality**: 1600px, JPEG 75%
3. **Low Quality**: 1200px, JPEG 65%
4. **WebP Aggressive**: 1200px, WebP 50%

```bash
# Processar imagens grandes
node scripts/migration/migrate-large-images.js

# Ver estratégias disponíveis
node scripts/migration/migrate-large-images.js --strategies
```

**Resultados épicos**:

- **98.07MB → 1.15MB** (98.8% redução)
- **21.78MB → 0.93MB** (95.7% redução)
- **18.77MB → 0.84MB** (95.5% redução)

### `migrate-video-urls.js` ✅ CONCLUÍDO

**Correção de URLs de vídeo misturadas com imagens**

Corrige gambiarras onde `video_url` estava sendo usado para imagens:

- Identifica patterns problemáticos
- Move URLs para campos corretos
- Valida integridade dos dados

```bash
# Executar correção
node scripts/migration/migrate-video-urls.js
```

### `migrate-about-page.js` ✅ CONCLUÍDO

**Migração da página About para Tiptap**

Converte conteúdo HTML/Markdown para formato Tiptap:

- Estrutura hierárquica preservada
- Formatação rica mantida
- Compatibilidade com editor

```bash
# Migrar about page
node scripts/migration/migrate-about-page.js
```

## 🔄 Ordem de Execução Recomendada

### Migração Completa

```bash
# 1. Corrigir vídeos (se necessário)
node scripts/migration/migrate-video-urls.js

# 2. Migrar imagens padrão
node scripts/migration/migrate-images.js

# 3. Otimizar imagens grandes
node scripts/migration/migrate-large-images.js

# 4. Migrar about page
node scripts/migration/migrate-about-page.js

# 5. Verificar resultado
node scripts/analysis/migration-report.js
```

### Re-execução Segura

✅ Todos os scripts verificam estado atual e **NÃO duplicam** dados

## 📊 Estrutura de Storage

### Pattern de Nomenclatura

```
supabase/storage/media/artworks/
├── raw/                           # Versões otimizadas
│   ├── 20240912120000-title.jpg   # Padrão
│   └── 20240912120000-title-large.jpg  # Grandes otimizadas
└── optimized/                     # Versões web
    ├── 20240912120000-title.webp  # Padrão
    └── 20240912120000-title-large.webp # Grandes otimizadas
```

### Estratégias de Compressão

| Tipo       | Tamanho | Raw Format      | Web Format      | Uso                  |
| ---------- | ------- | --------------- | --------------- | -------------------- |
| **Padrão** | <5MB    | 2560px JPEG 90% | 1920px WebP 80% | Maioria dos casos    |
| **Grande** | >5MB    | 2048px JPEG 85% | 1200px WebP 50% | Otimização agressiva |

## 🎯 Benefícios Conquistados

### 💾 **Economia de Storage**

- **Redução típica**: 80-95% do tamanho original
- **Maior economia**: 98.8% em casos extremos
- **Formato duplo**: Compatibilidade + Performance

### ⚡ **Performance**

- **CDN Global**: Supabase Storage integrado
- **Cache**: Headers otimizados (3600s)
- **Responsive**: Múltiplas versões disponíveis
- **Next.js**: Compatibilidade total com Image

### 🔒 **Confiabilidade**

- **URLs Próprias**: Independência de IPFS/CDNs
- **Backup Duplo**: Raw + Optimized
- **Versionamento**: Timestamp previne conflitos
- **Monitoramento**: Scripts de verificação

## 📈 Status Atual

### ✅ **Migração Completa**

- **86 imagens** migradas para Supabase Storage
- **9 imagens locais** já funcionais
- **0 URLs externas** restantes
- **100% independência** de CDNs externos

### 📊 **Estatísticas**

- **Raw files**: 92 arquivos
- **Optimized files**: 92 arquivos
- **Storage total**: ~80% economia vs originais
- **Success rate**: 100%

## 🔧 Comandos de Verificação

### Status de Migração

```bash
# Relatório completo
node scripts/analysis/migration-report.js

# Contagem de arquivos
node -e "
const { createClient } = require('@supabase/supabase-js');
// ... código de verificação
"
```

### Limpeza e Manutenção

```bash
# Verificar arquivos órfãos
node scripts/maintenance/cleanup.js --dry-run

# Aplicar limpeza
node scripts/maintenance/cleanup.js
```

## ⚠️ Notas Importantes

- **Rate Limiting**: Respeita limites de API (2s delay)
- **Error Handling**: Retry automático para falhas temporárias
- **Progress Tracking**: Logs detalhados do progresso
- **Storage Quotas**: Monitora uso do Supabase Storage
- **Rollback**: Sempre possível via backup das URLs originais

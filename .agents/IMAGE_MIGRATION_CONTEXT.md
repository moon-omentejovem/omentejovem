# Image Migration Documentation

## Overview

Sistema completo de migração de imagens externas para Supabase Storage com otimização agressiva para economizar dados e melhorar performance.

## Scripts de Migração

### 1. `migrate-images.js` - Migração Principal
**Função**: Migra imagens externas para Supabase Storage com otimização dupla

**Características**:
- **Raw Optimizado**: Comprime para 2560px máximo, JPEG 90% qualidade
- **Web Optimizado**: Redimensiona para 1920px, WebP 80% qualidade
- **Timeouts**: 30s por download com retry automático
- **Rate Limiting**: 2s de delay entre imagens
- **Storage**: Organizado em `artworks/raw/` e `artworks/optimized/`

**Uso**:
```bash
# Preview das imagens a migrar
node scripts/migrate-images.js --dry-run

# Migração completa
node scripts/migrate-images.js
```

### 2. `migrate-large-images.js` - Otimização Agressiva
**Função**: Processa imagens que falharam por serem muito grandes

**Estratégias de Otimização**:
1. **High Quality**: 2048px, JPEG 85% qualidade
2. **Medium Quality**: 1600px, JPEG 75% qualidade  
3. **Low Quality**: 1200px, JPEG 65% qualidade
4. **WebP Aggressive**: 1200px, WebP 50% qualidade

**Resultados Típicos**:
- Imagens 4K (18-21MB) → 0.8-1.0MB (95%+ redução)
- Timeout estendido: 60s por download
- Delay aumentado: 5s entre imagens

**Uso**:
```bash
node scripts/migrate-large-images.js
```

### 3. `migration-report.js` - Relatórios
**Função**: Gera relatórios detalhados do status da migração

**Recursos**:
- Contagem de imagens migradas vs pendentes
- Agrupamento por domínio de origem
- Estatísticas de storage utilizado
- Lista de URLs localhost para upload manual
- Percentual de progresso da migração

**Uso**:
```bash
# Relatório completo
node scripts/migration-report.js

# Apenas imagens que falharam
node scripts/migration-report.js --failed
```

## Estrutura de Storage

```
supabase/storage/media/
├── artworks/
│   ├── raw/                    # Versões "originais" otimizadas
│   │   ├── timestamp-slug.jpg  # 2560px, JPEG 90%
│   │   └── ...
│   └── optimized/              # Versões web otimizadas  
│       ├── timestamp-slug.webp # 1920px, WebP 80%
│       └── ...
```

## Pattern de Nomenclatura

```javascript
const timestamp = Date.now()
const baseName = slug || title.toLowerCase().replace(/[^a-z0-9]/g, '-')

// Arquivos normais
const rawFilename = `${timestamp}-${baseName}.jpg`
const optimizedFilename = `${timestamp}-${baseName}.webp`

// Arquivos grandes (com sufixo)
const rawFilename = `${timestamp}-${baseName}-large.jpg`
const optimizedFilename = `${timestamp}-${baseName}-large.webp`
```

## Benefícios da Otimização

### Economia de Storage
- **Antes**: URLs externas (IPFS, Alchemy CDN, Arweave)
- **Depois**: Supabase Storage otimizado
- **Redução Típica**: 80-95% do tamanho original
- **Formato Raw**: JPEG otimizado (compatibilidade máxima)
- **Formato Web**: WebP (melhor compressão para browsers modernos)

### Performance Melhorada
- **CDN**: Supabase Storage tem CDN global integrado
- **Cache**: Headers de cache configurados (3600s)
- **Responsive**: Múltiplas versões para diferentes usos
- **Lazy Loading**: Compatível com Next.js Image

### Confiabilidade
- **Backup Duplo**: Raw + Optimized de cada imagem
- **Versionamento**: Timestamp previne conflitos
- **Error Handling**: Retry automático e logs detalhados
- **Fallback**: Mantém URLs originais em caso de falha

## Status da Migração

### Resultados Atuais (Setembro 2025)
```
📊 Artworks Totais: 95
✅ Migradas: 85+ (89%+)
🌐 Pendentes: <10
🏠 Localhost: 1 (upload manual)
```

### Domínios Migrados
- ✅ **IPFS** (`ipfs.io`): Todas migradas
- ✅ **Alchemy CDN** (`nft-cdn.alchemy.com`): Maioria migrada
- ✅ **Arweave** (`arweave.net`): Todas migradas  
- ✅ **Google Images** (`lh3.googleusercontent.com`): Migradas
- ⚠️ **Localhost**: Requer upload manual via admin

### Economia de Dados
- **Imagem Típica**: 2-5MB → 200-800KB
- **Imagem Grande**: 15-25MB → 0.8-1.2MB
- **Economia Total**: Estimada em 80%+ de redução

## Troubleshooting

### Imagens que Falham
```bash
# Verificar imagens que falharam
node scripts/migration-report.js --failed

# Tentar migração com otimização agressiva
node scripts/migrate-large-images.js
```

### Erros Comuns
1. **"Object exceeded maximum size"**
   - Solução: Usar `migrate-large-images.js`
   
2. **"Download timeout"**
   - Solução: URLs IPFS podem ser lentas, script tem retry automático
   
3. **"File already exists"**
   - Comportamento: Script pula e continua (não é erro)

### Verificação Manual
```bash
# Ver artworks ainda externos
node -e "
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data } = await supabase.from('artworks').select('title, image_url').not('image_url', 'like', '%supabase%').not('image_url', 'like', '/%');
  console.log('External URLs:', data?.length || 0);
  data?.forEach(a => console.log(a.title, '→', new URL(a.image_url).hostname));
})();
"
```

## Próximos Passos

1. **Finalizar Migração**: Processar últimas imagens pendentes
2. **Upload Manual**: Migrar imagem localhost via admin panel
3. **Cleanup**: Verificar se todas URLs foram atualizadas
4. **Monitoramento**: Configurar alertas de storage usage
5. **Backup**: Considerar backup das URLs originais em coluna separada

## Scripts de Manutenção

### Limpeza de Storage
```bash
# Listar arquivos órfãos (sem referência no DB)
node scripts/cleanup-storage.js --dry-run

# Remover arquivos órfãos
node scripts/cleanup-storage.js --delete
```

### Reprocessamento
```bash
# Reprocessar imagens com nova estratégia de otimização
node scripts/reprocess-images.js --strategy=aggressive
```

### Monitoramento
```bash
# Verificar uso de storage
node scripts/storage-usage.js

# Gerar relatório de performance
node scripts/performance-report.js
```

---

**Documentação atualizada**: Setembro 2025  
**Responsável**: Sistema de migração automatizado  
**Próxima revisão**: Após finalização completa da migração

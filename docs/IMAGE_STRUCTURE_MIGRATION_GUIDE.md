# Guia de Migração - Nova Estrutura de Imagens

## 📋 Resumo das Mudanças

### Estrutura Antiga
```
{scaffold}/{compression}/{filename}.{ext}
artworks/optimized/my-artwork.webp
artworks/raw/my-artwork-raw.jpg
```

### Nova Estrutura
```
{scaffold}/{id}/[raw|optimized]/{filename}.{ext}
artworks/01234567-89ab-cdef-0123-456789abcde6/optimized/my-artwork.webp
artworks/01234567-89ab-cdef-0123-456789abcde6/raw/my-artwork.jpg
```

> 🔁 Utilize o diretório `optimized` apenas quando existir uma versão otimizada do arquivo original. Caso contrário, mantenha apen
as o diretório `raw`.

## 🔄 Mudanças no Código

### 1. ImageUploadService
- `uploadImageBySlug()` → `uploadImageById()`
- Agora requer ID e filename em vez de slug

### 2. Storage Utils
- `getImageUrlFromSlug()` → `getImageUrlFromId()`
- Nova função requer ID e filename

### 3. Auditoria e limpeza
- Auditoria com `node scripts/migrate-image-structure.js --verify-only`
- Limpeza opcional de scaffolds antigos com `--purge-unknown`

## 📝 Próximos Passos

1. **Testar migração** em ambiente de desenvolvimento (`--dry-run`)
2. **Atualizar componentes** para usar nova estrutura (sem fallbacks por slug)
3. **Executar migração** de arquivos no bucket
4. **Auditar estrutura** com `--verify-only` e limpar scaffolds antigos
5. **Garantir seeds/migrations** preenchendo `image_filename`

## ⚠️ Importante

- Faça backup antes de executar a migração
- Teste em ambiente de desenvolvimento primeiro
- Use a auditoria para garantir que apenas `{scaffold}/{id}/...` permaneceu no bucket
- Monitore logs para identificar problemas

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

### 3. Camada de Compatibilidade
- `getImageUrlFromSlugCompat()` para migração gradual
- Cache de mapeamento slug → ID

## 📝 Próximos Passos

1. **Testar migração** em ambiente de desenvolvimento
2. **Atualizar componentes** para usar nova estrutura
3. **Executar migração** de arquivos no bucket
4. **Remover arquivos antigos** após validação
5. **Remover camada de compatibilidade** após migração completa

## ⚠️ Importante

- Faça backup antes de executar a migração
- Teste em ambiente de desenvolvimento primeiro
- Mantenha a camada de compatibilidade durante a transição
- Monitore logs para identificar problemas

# 🖼️ Migração da Estrutura de Imagens

## 📋 Visão Geral

Este documento descreve a migração da estrutura de imagens do sistema de **slug-based** para **ID-based** no bucket Supabase Storage.

### Estrutura Atual (Antiga)

```
{scaffold}/{compression}/{filename}.{ext}
artworks/optimized/my-artwork.webp
artworks/raw/my-artwork-raw.jpg
```

### Nova Estrutura (Desejada)

```
{scaffold}/{id}/{compression}/{filename}.{ext}
artworks/01234567-89ab-cdef-0123-456789abcde6/optimized/my-artwork.webp
artworks/01234567-89ab-cdef-0123-456789abcde6/raw/my-artwork.jpg
```

## 🎯 Benefícios da Nova Estrutura

- **Organização melhor**: Arquivos agrupados por ID
- **Escalabilidade**: Suporte a múltiplas versões por ID
- **Manutenção**: Mais fácil de gerenciar e limpar
- **Performance**: Melhor cache e CDN
- **Flexibilidade**: Suporte a diferentes formatos por ID

## 📊 Impacto da Migração

### Arquivos no Bucket

- **Artworks**: ~95 arquivos (raw + optimized)
- **Series**: ~5 arquivos (raw + optimized)
- **Artifacts**: ~44 arquivos (raw + optimized)
- **Total**: ~144 arquivos para migrar

### Código Afetado

- `src/services/image-upload.service.ts` - Função `generatePaths()`
- `src/utils/storage.ts` - Função `generateImagePath()`
- `src/lib/supabase/config.ts` - Constantes de pastas
- 64 ocorrências de `getImageUrlFromSlug()` no código

## 🛠️ Scripts de Migração

### 1. `scripts/migrate-image-structure.js`

**Função**: Migra arquivos do bucket para nova estrutura

```bash
# Teste (dry run)
node scripts/migrate-image-structure.js --dry-run

# Execução real
node scripts/migrate-image-structure.js
```

**Recursos**:

- ✅ Mapeia slug/ID automaticamente
- ✅ Cria backup antes da migração
- ✅ Suporte a dry-run
- ✅ Log detalhado de operações
- ✅ Validação de integridade

### 2. `scripts/update-services-for-new-structure.js`

**Função**: Atualiza código para nova estrutura

```bash
node scripts/update-services-for-new-structure.js
```

**Mudanças**:

- `uploadImageBySlug()` → `uploadImageById()`
- `getImageUrlFromSlug()` → `getImageUrlFromId()`
- Cria camada de compatibilidade
- Gera guia de migração

### 3. `scripts/test-image-migration.js`

**Função**: Testa nova estrutura em desenvolvimento

```bash
node scripts/test-image-migration.js
```

**Testes**:

- ✅ Upload com nova estrutura
- ✅ Download e URLs públicas
- ✅ Mapeamento de dados
- ✅ Compatibilidade com estrutura antiga

### 4. `scripts/execute-image-migration.js`

**Função**: Executa migração completa

```bash
node scripts/execute-image-migration.js
```

**Fluxo**:

1. Cria backup de segurança
2. Testa nova estrutura
3. Atualiza services
4. Migra arquivos (com confirmação)
5. Valida migração
6. Gera relatório final

## 🚀 Processo de Migração

### Fase 1: Preparação

```bash
# 1. Testar nova estrutura
node scripts/test-image-migration.js

# 2. Atualizar services
node scripts/update-services-for-new-structure.js

# 3. Revisar mudanças
git diff
```

### Fase 2: Migração

```bash
# 1. Executar migração completa
node scripts/execute-image-migration.js

# 2. Verificar relatórios
ls reports/migration-*

# 3. Testar aplicação
npm run dev
```

### Fase 3: Validação

```bash
# 1. Verificar se imagens carregam
# 2. Testar upload de novas imagens
# 3. Verificar performance
# 4. Monitorar logs
```

### Fase 4: Limpeza

```bash
# 1. Remover arquivos antigos (após validação)
# 2. Remover camada de compatibilidade
# 3. Atualizar documentação
```

## ⚠️ Considerações Importantes

### Backup e Segurança

- ✅ Backup automático antes da migração
- ✅ Suporte a rollback via backup
- ✅ Validação de integridade
- ✅ Logs detalhados

### Compatibilidade

- ✅ Camada de compatibilidade durante transição
- ✅ Fallback para estrutura antiga
- ✅ Migração gradual de componentes

### Performance

- ✅ Migração em lotes para evitar timeout
- ✅ Validação de URLs após migração
- ✅ Cache de mapeamento slug → ID

## 🔍 Monitoramento

### Logs de Migração

- `reports/migration-log-*.json` - Log detalhado
- `reports/test-migration-*.json` - Resultados de teste
- `reports/migration-execution-*.json` - Relatório final

### Validação Pós-Migração

- Verificar se todas as imagens carregam
- Testar upload de novas imagens
- Monitorar erros 404 de imagens
- Verificar performance do site

## 🆘 Resolução de Problemas

### Problema: Imagem não carrega

**Solução**: Verificar se migração foi concluída e se ID está correto

### Problema: Erro de upload

**Solução**: Verificar se services foram atualizados corretamente

### Problema: URLs quebradas

**Solução**: Verificar se camada de compatibilidade está ativa

### Rollback de Emergência

```bash
# 1. Restaurar arquivos do backup
cp src/services/image-upload.service.ts.backup src/services/image-upload.service.ts
cp src/utils/storage.ts.backup src/utils/storage.ts

# 2. Reverter migração do bucket (manual)
# 3. Reiniciar aplicação
```

## 📝 Checklist de Migração

### Antes da Migração

- [ ] Backup do banco de dados
- [ ] Backup do bucket
- [ ] Teste em ambiente de desenvolvimento
- [ ] Revisão do código
- [ ] Notificação da equipe

### Durante a Migração

- [ ] Executar testes
- [ ] Monitorar logs
- [ ] Verificar progresso
- [ ] Validar cada etapa

### Após a Migração

- [ ] Testar aplicação
- [ ] Verificar todas as imagens
- [ ] Monitorar performance
- [ ] Documentar mudanças
- [ ] Remover arquivos antigos (após validação)

## 📚 Referências

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Migration Best Practices](https://supabase.com/docs/guides/database/migrations)

---

**Última atualização**: Setembro 2025
**Status**: ✅ Pronto para execução

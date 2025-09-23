# TODO - Migração de Dados Legacy

> **Status**: ⚠️ **Pendente** - Migração ainda não 100% concluída
> 
> **Data**: Setembro 2025
> 
> **Contexto**: Ainda existem dados legacy que precisam ser migrados completamente antes da limpeza final dos scripts.

---

## 🔄 **Pendências de Migração**

### 📂 **Scripts Legacy (NÃO REMOVER ainda)**

#### 📁 `scripts/legacy/`
- **`migrate-essential-nft-data.js`** - ⚠️ Pode ainda ser necessário
- **`migrate-legacy-data.js`** - ⚠️ Migração principal ainda em uso
- **`README.md`** - Documentação do processo

#### 📁 `scripts/migration/`
- **`migrate-about-page.js`** - ⚠️ Verificar se about page está 100% migrada
- **`migrate-images.js`** - ⚠️ Imagens podem precisar remigração
- **`migrate-large-images.js`** - ⚠️ Imagens grandes ainda podem precisar
- **`migrate-video-urls.js`** - ⚠️ URLs de vídeo podem precisar ajustes

#### 📁 `scripts/analysis/`
- **Manter temporariamente** - Úteis para debugging pós-migração
- **`final-migration-check.js`** - Para validação final
- **`verify-data-consistency.js`** - Para verificação contínua

### 📂 **Dados Legacy (NÃO REMOVER ainda)**

#### 📁 `public/legacy_data/`
- **`mint-dates.json`** - ⚠️ Pode conter datas ainda não migradas
- **`nfts.json`** - ⚠️ Dados NFT podem ter informações faltantes
- **`tezos-data.json`** - ⚠️ Dados Tezos específicos
- **`token-metadata.json`** - ⚠️ Metadados de tokens

#### 📁 `public/new_series/`
- **Imagens da nova série** - ⚠️ Podem ainda não estar 100% no Supabase
- **`videos/`** - ⚠️ Vídeos podem precisar de migração

---

## ✅ **Critérios para Limpeza Segura**

### 🔍 **Antes de Remover Scripts Legacy**

1. **Verificar migração completa**:
   ```bash
   node scripts/analysis/final-migration-check.js
   node scripts/analysis/verify-data-consistency.js
   ```

2. **Confirmar todos os dados no Supabase**:
   - ✅ Todos artworks migrados
   - ✅ Todas séries migradas  
   - ✅ Todos relacionamentos criados
   - ✅ Todas imagens acessíveis
   - ✅ Todos vídeos funcionando

3. **Testar funcionalidade completa**:
   - ✅ Admin panel funcionando 100%
   - ✅ Páginas públicas carregando corretamente
   - ✅ Imagens sendo exibidas
   - ✅ Vídeos reproduzindo

### 🔍 **Antes de Remover Dados Legacy**

1. **Backup de segurança**:
   ```bash
   # Criar backup dos dados legacy
   cp -r public/legacy_data/ backups/legacy_data_backup/
   ```

2. **Confirmação no banco**:
   - ✅ Todos mint_dates migrados
   - ✅ Todos metadados NFT importados
   - ✅ Dados Tezos preservados onde necessário
   - ✅ Token metadata completo

---

## 🎯 **Plano de Ação Futuro**

### Fase 1: Validação Completa
- [ ] Executar scripts de verificação
- [ ] Validar 100% dos dados migrados
- [ ] Testar todas as funcionalidades

### Fase 2: Backup de Segurança
- [ ] Criar backups dos dados legacy
- [ ] Documentar estado atual da migração
- [ ] Confirmar rollback procedures

### Fase 3: Limpeza Gradual
- [ ] Remover scripts de migração obsoletos
- [ ] Remover dados legacy confirmadamente migrados
- [ ] Manter apenas essencial para manutenção

### Fase 4: Limpeza Final
- [ ] Remover backups desnecessários
- [ ] Consolidar documentação final
- [ ] Marcar migração como 100% concluída

---

## ⚠️ **Avisos Importantes**

- **NÃO remover** scripts legacy até validação 100%
- **NÃO remover** public/legacy_data até confirmação total
- **SEMPRE fazer backup** antes de qualquer remoção
- **TESTAR em staging** antes de produção

---

**Última atualização**: Setembro 2025  
**Responsável**: Aguardando validação completa da migração  
**Status**: 🔄 Migração em andamento - limpeza postponed
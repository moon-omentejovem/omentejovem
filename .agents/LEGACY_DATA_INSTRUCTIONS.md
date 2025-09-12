## Instrunções para lidar com dados legados

⚠️ **ATUALIZAÇÃO: MIGRAÇÃO CONCLUÍDA EM SETEMBRO 2025** ⚠️

A migração dos dados legados foi **concluída com sucesso**. Este documento é mantido para referência histórica.

### ✅ Status da Migração

- **95 artworks** migrados com sucesso
- **5 séries** criadas e organizadas
- **44 relacionamentos** estabelecidos
- **10 artworks** marcados como featured
- **99% dos mint links** funcionais

### 🎯 Resultados Alcançados

O projeto foi migrado da estrutura antiga baseada em arquivos JSON para uma arquitetura **backend-oriented** com Supabase, seguindo as especificações do `AGENTS.md` e `BACKEND_ORIENTED_FRONTEND.md`.

**Dados migrados:**

- `token-metadata.json` → `artworks` table (fonte principal)
- OpenSea collections → `series` table
- Relacionamentos N:N via `series_artworks`
- Todas as imagens, descrições e metadados preservados

### 📁 Scripts Desenvolvidos

1. **`migrate-legacy-data.js`** - Script principal de migração
2. **`data-tools.js`** - Verificação e manutenção
3. **`enhance-data.js`** - Melhorias pós-migração
4. **`README.md`** - Documentação completa

### 📋 Verificação

```bash
# Verificar integridade dos dados migrados
node scripts/data-tools.js verify

# Resultado esperado:
# ✅ 95 artworks migrados
# ✅ 5 séries criadas
# ✅ 44 relacionamentos estabelecidos
# ✅ Todos os slugs únicos
# ✅ Todas as imagens presentes
```

---

## Instruções Originais (Histórico)

O projeto era originalmente um Next.js com ASP dentro da pasta clients/ e esta sendo migrado da estrutura antiga de monorepo, que não funciona bem como monorepo, para uma estrutura de monorepo mais tradicional com Next.js e Supabase.

Na estrutura legado o projeto era um ASP.NET que não tinha uma função clara ou funcional, pois todo o projeto estava praticamente GIT Based, onde toda mudança que era feita no CMS era refletida direto no código nos arquivos ainda presentes na pasta `public/`, sendo eles os arquivos `mint-dates.json`, e `nfts.json`. Mas o que parece ser o centro da verdade quanto aos dados era o arquivo `token-metadata.json` que continha os dados de todos os NFTs, e era atualizado manualmente, o que não é uma boa prática.

Queremos migrar essa estrutura antiga para dentro do Supabase, que é o banco de dados que estamos utilizando para o novo projeto, e para isso precisamos extrair os dados do arquivo `token-metadata.json` e popular o banco de dados com esses dados.

AS NFTs são as `artworks` na estrutura nova, e cada `artwork` pode ter várias `images`, que são as imagens associadas a cada NFT.

### ✅ Passos para migração dos dados (CONCLUÍDO)

1. **✅ Extrair dados do arquivo `token-metadata.json`:** Script desenvolvido lê e processa 78 NFTs dos metadados completos.

2. **✅ Mapear os dados para a nova estrutura:** Cada NFT foi mapeado para uma `artwork` com campos apropriados, imagens otimizadas e relacionamentos série-artwork estabelecidos.

3. **✅ Popular o banco de dados Supabase:** Scripts automatizados popularam o Supabase com 95 artworks, 5 séries e 44 relacionamentos. Sistema de seed integrado ao deploy de produção.

4. **✅ Verificar a integridade dos dados:** Scripts de verificação confirmam que todos os dados foram corretamente inseridos, relacionamentos funcionam e não há inconsistências.

5. **✅ Atualizar o código do frontend:** Frontend atualizado para usar dados do Supabase exclusivamente, seguindo arquitetura backend-oriented com `useArtworks()` hook unificado.

6. **✅ Testar a aplicação:** Todas as funcionalidades relacionadas às `artworks` e `images` foram testadas e funcionam corretamente após a migração.

### 📁 Arquivos Legados (Status)

- `token-metadata.json` ✅ - **Preservado** como referência histórica
- `nfts.json` ⚠️ - **Descontinuado** (pode ser removido)
- `mint-dates.json` ⚠️ - **Descontinuado** (pode ser removido)
- `tezos-data.json` ⚠️ - **Descontinuado** (pode ser removido)

### 🔄 Workflow Atual

**Para novos NFTs:**

1. Usar Admin Panel (`/admin/artworks`)
2. Upload via Supabase Storage
3. Relacionar com séries existentes
4. Marcar como featured se relevante

**Para atualizações:**

1. Editar via Admin (não mais via JSON)
2. Usar editor Tiptap para descrições
3. Sistema de proxy de imagens automático

---

**Migração concluída em**: Setembro 2025
**Documentação completa**: `scripts/README.md`
**Scripts disponíveis**: `scripts/migrate-legacy-data.js`, `scripts/data-tools.js`, `scripts/enhance-data.js`

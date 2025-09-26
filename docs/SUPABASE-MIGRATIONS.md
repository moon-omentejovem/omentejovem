# Supabase Migrations - Guia CLI

## 🎯 **Workflow de Migrations**

### **1. Criar Nova Migration**

```bash
# Criar migration com nome descritivo
supabase migration new add_video_url_to_artworks

# Isso cria: supabase/migrations/YYYYMMDDHHMMSS_add_video_url_to_artworks.sql
```

### **2. Editar o Arquivo SQL**

```sql
-- Exemplo: supabase/migrations/20250912123456_add_video_url_to_artworks.sql
ALTER TABLE artworks
ADD COLUMN video_url TEXT;

COMMENT ON COLUMN artworks.video_url IS 'URL do vídeo/animação do NFT (migrado de animation_url)';
```

### **3. Aplicar Migration**

```bash
# Aplicar todas as migrations pendentes
supabase db push

# Ou aplicar migration específica
supabase db push --include-all
```

### **4. Regenerar Tipos TypeScript**

```bash
# Regenerar tipos após mudanças no schema
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

## 🔄 **Comandos Úteis**

### **Status das Migrations**

```bash
# Ver status das migrations
supabase migration list

# Ver diferenças com o banco remoto
supabase db diff
```

### **Reset/Rollback (Cuidado!)**

```bash
# Reset completo do banco local (apenas desenvolvimento)
supabase db reset

# Aplicar seed após reset
supabase db reset --db-url $DATABASE_URL
```

### **Desenvolvimento Local**

```bash
# Iniciar instância local do Supabase
supabase start

# Parar instância local
supabase stop
```

## 📁 **Estrutura de Arquivos**

```
supabase/
├── migrations/
│   ├── 20250912120000_initial_schema.sql
│   ├── 20250912123456_add_video_url_to_artworks.sql
│   └── ...
├── seed.sql
└── config.toml
```

## ⚠️ **Boas Práticas**

1. **Nomes descritivos**: Use nomes claros para migrations
2. **Rollback-safe**: Sempre considere como reverter uma migration
3. **Backup antes**: Faça backup antes de migrations grandes
4. **Teste local**: Teste migrations localmente antes de aplicar em produção
5. **Regenerar tipos**: Sempre regenere os tipos após mudanças no schema

## 🚀 **Workflow Completo de Desenvolvimento**

```bash
# 1. Criar migration
supabase migration new minha_mudanca

# 2. Editar arquivo SQL gerado
# 3. Aplicar migration
supabase db push

# 4. Regenerar tipos
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts

# 5. Atualizar código TypeScript conforme necessário
# 6. Testar aplicação
yarn dev
```

## 🔁 **Clonar dados entre projetos**

Consulte [`supabase/README.md`](../supabase/README.md) para o passo a passo
completo. Resumo dos scripts disponíveis:

- `node scripts/migration/export-supabase-data.js` – gera backup JSON + manifesto
  dos buckets `media` e `cached-images`.
- `node scripts/migration/import-supabase-data.js --input=... --truncate` –
  restaura o backup no novo projeto preservando UUIDs.

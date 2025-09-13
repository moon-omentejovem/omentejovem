# Supabase CLI Guide - Omentejovem

## 📋 Visão Geral

Este guia documenta o uso do Supabase CLI para gerenciar migrations, tipos e outras operações do banco de dados no projeto Omentejovem.

## � **Configuração de Environment**

Adicione no seu `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## �🚀 Scripts Disponíveis

### **Setup Inicial**

```bash
# Inicializar projeto Supabase (já feito)
yarn supabase:init

# Login no Supabase (necessário uma vez)
yarn supabase:login

# Conectar ao projeto remoto
yarn supabase:link
```

### **Migrations**

```bash
# Criar nova migration
yarn supabase:migration:new <nome_da_migration>

# Aplicar migrations pendentes
yarn supabase:migration:up

# Push para o banco remoto
yarn supabase:db:push

# Pull do banco remoto
yarn supabase:db:pull
```

### **Tipos TypeScript**

```bash
# Regenerar tipos do Supabase (requer SUPABASE_PROJECT_ID no .env)
yarn supabase:types
```

**Importante**: O script usa a variável `$SUPABASE_PROJECT_ID` do environment para segurança.

### **Status**

```bash
# Verificar status da conexão
yarn supabase:status
```

## 🔧 Configuração do Projeto

### **Project Reference**

- Project ID: `vhetqzjpjqcqzxlsonax`
- URL: `https://vhetqzjpjqcqzxlsonax.supabase.co`

### **Variáveis de Ambiente**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vhetqzjpjqcqzxlsonax.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 📁 Estrutura de Arquivos

```
supabase/
├── config.toml          # Configuração do projeto
├── seed.sql             # Dados iniciais
└── migrations/          # Arquivos de migration
    ├── 20240101_initial.sql
    └── ...
```

## 🎯 Workflow Típico

### **1. Criar Nova Migration**

```bash
# Exemplo: adicionar campo video_url
yarn supabase:migration:new add_video_url_to_artworks
```

### **2. Editar Migration**

Editar o arquivo gerado em `supabase/migrations/[timestamp]_add_video_url_to_artworks.sql`:

```sql
-- Adicionar campo video_url à tabela artworks
ALTER TABLE artworks
ADD COLUMN video_url TEXT;

COMMENT ON COLUMN artworks.video_url IS 'URL do vídeo/animação do NFT';
```

### **3. Aplicar Migration**

```bash
# Push para o banco remoto
yarn supabase:db:push
```

### **4. Regenerar Tipos**

```bash
# Atualizar tipos TypeScript
yarn supabase:types
```

## ⚠️ **Importante**

1. **Sempre criar migrations**: Nunca edite o banco diretamente via dashboard
2. **Commit migrations**: Versione os arquivos de migration no Git
3. **Teste localmente**: Use ambiente local antes de aplicar em produção
4. **Backup**: Sempre faça backup antes de migrations grandes

## 🔍 **Troubleshooting**

### **Erro de Login**

```bash
# Re-fazer login
yarn supabase:login
```

### **Erro de Link**

```bash
# Re-conectar ao projeto
yarn supabase:link --project-ref vhetqzjpjqcqzxlsonax
```

### **Migration Falhou**

```bash
# Verificar status
yarn supabase:status

# Ver logs
npx supabase logs
```

## 🎯 **Próximos Passos**

1. **Adicionar campo video_url**: Migration para artworks
2. **Script de migração de dados**: Popular video_url com dados legados
3. **Atualizar Services**: Incluir video_url nos services
4. **Atualizar frontend**: Usar video_url nos componentes

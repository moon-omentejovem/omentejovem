# 🚀 Guia de Configuração - Omentejovem CMS

## 📋 Pré-requisitos

- Conta no Supabase (gratuita)
- Node.js 18+ instalado
- Yarn ou npm

## 1️⃣ Configurar Supabase

### Passo 1: Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie um novo projeto:
   - Nome: `omentejovem-cms`
   - Database Password: (anote a senha)
   - Região: escolha a mais próxima

### Passo 2: Configurar Banco de Dados

1. Aguarde o projeto ser criado (2-3 minutos)
2. Vá para **SQL Editor** no dashboard
3. Cole e execute o conteúdo do arquivo `supabase-setup.sql`
4. Verifique se todas as tabelas foram criadas na aba **Table Editor**

### Passo 3: Obter Chaves de API

1. Vá para **Settings** → **API**
2. Copie:
   - **Project URL**
   - **anon public** key
   - **service_role** key (mantenha segura!)

## 2️⃣ Configurar Aplicação

### Passo 1: Variáveis de Ambiente

1. Na pasta `client/`, copie `.env.local.example` para `.env.local`
2. Preencha com suas chaves do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

### Passo 2: Instalar Dependências

```bash
cd client
yarn install
```

### Passo 3: Executar Aplicação

```bash
yarn dev
```

## 3️⃣ Acessar Sistema

- **Site público:** http://localhost:3001
- **Admin:** http://localhost:3001/admin
- **Login admin:** Use magic link (email) configurado no Supabase

## 4️⃣ Popular Dados de Exemplo

### Opção 1: Via API (Recomendado)

```bash
curl -X POST http://localhost:3001/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

### Opção 2: Via Interface Admin

1. Acesse `/admin`
2. Faça login com email
3. Use as páginas para criar:
   - Séries (Collections)
   - Artworks
   - Artifacts
   - About Page

## 5️⃣ Configurar Autenticação (Admin)

### Passo 1: Email Authentication

1. No Supabase: **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:3001`
3. Em **Redirect URLs**, adicione: `http://localhost:3001/admin`

### Passo 2: Adicionar Admin User

1. **Authentication** → **Users**
2. Clique "Add user" → "Create new user"
3. Adicione seu email
4. User role: `authenticated`

## 🎯 Estrutura da Aplicação

```
├── /admin              # Interface administrativa
├── /admin/artworks     # Gerenciar obras de arte
├── /admin/series       # Gerenciar séries/coleções
├── /admin/artifacts    # Gerenciar conteúdo adicional
├── /admin/about        # Editar página sobre
├── /api/admin/*        # APIs CRUD
├── /api/images/proxy   # Cache de imagens
├── /api/admin/seed     # Importar dados de exemplo
├── /                   # Homepage
├── /portfolio          # Galeria de artworks
├── /portfolio/[slug]   # Detalhes de artwork
└── /series/[slug]      # Páginas de séries
```

## 🛠️ Funcionalidades

### ✅ Implementadas

- ✅ CRUD completo para artworks, séries, artifacts
- ✅ Editor de texto rico (Tiptap)
- ✅ Sistema de upload/proxy de imagens
- ✅ Filtros avançados
- ✅ Páginas públicas responsivas
- ✅ Sistema de autenticação
- ✅ Validação de dados (Zod)
- ✅ Cache de imagens

### 🔄 Para Desenvolver

- [ ] Upload direto de imagens
- [ ] Sistema de backup
- [ ] Analytics
- [ ] SEO avançado
- [ ] PWA

## 🚨 Troubleshooting

### Erro "Table not found"

- ✅ Execute o `supabase-setup.sql`
- ✅ Verifique se as tabelas existem no Table Editor
- ✅ Confirme as variáveis de ambiente

### Erro de autenticação

- ✅ Verifique se o email está cadastrado no Supabase
- ✅ Confirme as URLs de redirect
- ✅ Use uma aba anônima para testar

### Erro do Tiptap SSR

- ✅ **RESOLVIDO!** Adicionado `immediatelyRender: false`

### Imagens não carregam

- ✅ Verifique se o bucket `image-cache` existe
- ✅ Confirme as políticas de storage
- ✅ Teste URLs diretas das imagens

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do console do navegador
2. Confira os logs do terminal do servidor
3. Teste as APIs individualmente
4. Verifique se o Supabase está configurado corretamente

## 🎉 Pronto!

Seu CMS Omentejovem está configurado e funcionando!

- Interface moderna e responsiva
- Sistema robusto de gerenciamento de conteúdo
- Cache inteligente de imagens
- Arquitetura escalável com Supabase

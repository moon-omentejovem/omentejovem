# Sistema de Seed Automático

> **Documentação do sistema de seed para produção**
>
> Como o sistema popula automaticamente o banco de dados a cada deploy.

---

## 🎯 Visão Geral

Sistema automático que popula o banco de dados Supabase a cada deploy na Vercel com dados essenciais do projeto, garantindo que a aplicação sempre tenha conteúdo base disponível.

## ⚙️ Configuração

### Variáveis de Ambiente Necessárias

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_key_aqui
```

### Integração com Deploy

O sistema roda automaticamente após cada build via hook `postbuild` no `package.json`:

```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "node scripts/vercel-seed.js"
  }
}
```

## 🚀 Como Funciona

### Fluxo de Deploy Automático

1. **Build Next.js** - Aplicação é compilada
2. **Execução do Seed** - Script roda automaticamente
3. **Verificação Inteligente** - Só popula se necessário
4. **Deploy Finalizado** - Sem interrupções no processo

### Dados Populados Automaticamente

- ✅ **3 Séries** principais com covers de exemplo
- ✅ **4 Artworks** essenciais com metadados completos
- ✅ **2 Artifacts** de coleções para demonstração
- ✅ **About page** com conteúdo base em Tiptap JSON

## 🔧 Arquivos do Sistema

### Script Principal

```
scripts/
└── vercel-seed.js        # Script de seed para produção
```

### API para Teste Manual

```
src/app/api/admin/seed/
└── route.ts             # Endpoint para teste em desenvolvimento
```

### Documentação

```
docs/
└── SEED-SYSTEM.md       # Esta documentação
```

## 🧪 Teste e Uso

### Teste Manual via API

Durante desenvolvimento, você pode testar o seed manualmente:

```bash
# Via POST request
curl -X POST http://localhost:3000/api/admin/seed

# Ou acessar via browser
http://localhost:3000/api/admin/seed
```

### Teste Local via Script

```bash
# Executar localmente
cd scripts && node vercel-seed.js
```

## ⚡ Características Técnicas

### Graceful Failure

- **Nunca quebra o deploy** - Se o seed falhar, o deploy continua
- **Error handling robusto** - Logs detalhados sem interromper processo
- **Fallback seguro** - Aplicação funciona mesmo sem seed

### Smart Seeding

- **Verifica dados existentes** antes de popular
- **Evita duplicatas** - Não popula se já existe conteúdo
- **Conditional seeding** - Baseado no estado atual do banco

### Configuração por Ambiente

- **Environment-based** - Funciona em produção e desenvolvimento
- **Service role usage** - Usa chave de admin para operações
- **Zero configuration** - Funciona automaticamente após setup

## 📋 Dados de Exemplo Populados

### Séries Base

1. **Coleção Demo** - Série principal de demonstração
2. **1/1 Exclusives** - Peças únicas de exemplo
3. **Limited Editions** - Edições limitadas para showcase

### Artworks Essenciais

1. **Demo Artwork 1** - Artwork destacado
2. **Demo Artwork 2** - Peça única
3. **Demo Edition** - Edição exemplo
4. **Featured Piece** - Artwork em destaque

### Conteúdo Adicional

1. **Artifact Collection** - Coleção de demonstração
2. **Video Showcase** - Artifact com vídeo exemplo

### About Page

- **Conteúdo Base** - Texto de exemplo em formato Tiptap JSON
- **Estrutura Completa** - Parágrafos, links e formatação

## 📊 Monitoramento

### Logs de Execução

O sistema gera logs detalhados durante a execução:

```
🚀 Starting seed process...
📊 Checking existing data...
✅ Database already populated, skipping seed
⏱️  Seed completed in 1.2s
```

### Verificação de Status

```bash
# Verificar se seed foi executado
grep "seed" .vercel/output/static/_logs/*
```

## 🎯 Vantagens

### Para Desenvolvimento

- **Setup instantâneo** - Novos ambientes têm dados imediatamente
- **Consistent state** - Todos os ambientes têm mesma base
- **Zero manual work** - Não requer intervenção manual

### Para Produção

- **Always ready** - Deploy sempre tem conteúdo
- **Reliable deploys** - Nunca falha por falta de dados
- **Self-healing** - Se dados forem perdidos, próximo deploy restaura

### Para Demonstração

- **Show-ready** - Sempre tem conteúdo para apresentar
- **Professional look** - Não aparece vazio para visitantes
- **Complete experience** - Todas as funcionalidades testáveis

---

**Status**: ✅ Funcional e pronto para produção
**Compatibilidade**: Vercel, Next.js 14+, Supabase
**Manutenção**: Zero - Totalmente automático
**Última validação**: Setembro 2025

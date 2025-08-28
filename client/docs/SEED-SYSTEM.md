# Sistema de Seed Automático

## 🎯 Visão Geral

Sistema automático que popula o banco de dados Supabase a cada deploy na Vercel com dados essenciais do projeto.

## ⚙️ Configuração

### Variáveis de Ambiente (.env.local)
```bash
# Credenciais Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_key_aqui
```

### Deploy Automático
O sistema roda automaticamente após cada build via hook `postbuild` no package.json:
```json
{
  "scripts": {
    "postbuild": "node scripts/vercel-seed.js"
  }
}
```

## 🚀 Funcionamento

### Fluxo de Deploy
1. **Build completo** do Next.js
2. **Execução automática** do seed script  
3. **Verificação inteligente** - só popula se necessário
4. **Deploy finalizado** sem interrupções

### Dados Populados
- ✅ **3 Séries** principais com covers
- ✅ **4 Artworks** essenciais com metadados  
- ✅ **2 Artifacts** de coleções
- ✅ **About page** com conteúdo base

## 🔧 Estrutura de Arquivos

```
client/
├── scripts/
│   └── vercel-seed.js        # Script principal de seed
├── src/app/api/admin/seed/
│   └── route.ts             # Endpoint manual para testes
└── docs/
    └── README.md            # Esta documentação
```

## 🧪 Teste Manual

### Via API (desenvolvimento)
```bash
POST /api/admin/seed
```

### Via Script (local)
```bash
cd scripts && node vercel-seed.js
```

## ⚡ Características Técnicas

- **Graceful failure**: Nunca quebra o deploy
- **Smart seeding**: Verifica dados existentes antes de popular
- **Environment-based**: Configurável via ENV
- **Zero maintenance**: Funciona automaticamente

## 📋 Checklist de Deploy

- [ ] ✅ Environment variables configuradas
- [ ] ✅ Service role key válida
- [ ] ✅ Hook postbuild ativo
- [ ] ✅ Script executando sem erros

---

**Status**: ✅ Funcional e pronto para produção
**Compatibilidade**: Vercel, Next.js 14+, Supabase
**Manutenção**: Zero - totalmente automático

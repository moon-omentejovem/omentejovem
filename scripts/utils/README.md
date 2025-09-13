# 🛠️ Scripts Utilitários

Scripts utilitários para deploy, backup e operações gerais.

## 📁 Scripts Disponíveis

### `vercel-seed.js` ✅ ESSENCIAL

**Script de seed automático para deploy Vercel**

Executado automaticamente no postbuild do Vercel:

- ✅ Detecta se é primeira build
- ✅ Verifica se dados já existem
- ✅ Executa migração automática se necessário
- ✅ Logs detalhados para debugging

```bash
# Execução manual (para teste)
node scripts/utils/vercel-seed.js

# Configurado em package.json
"scripts": {
  "postbuild": "node scripts/utils/vercel-seed.js"
}
```

**Comportamento**:

- Se banco vazio → Executa migração completa
- Se banco populado → Skip (não duplica)
- Se erro → Logs detalhados para debug

### `backup-database.js` ✅ ESSENCIAL

**Sistema de backup completo**

Cria backup JSON de todos os dados:

- 💾 **Database**: Todas as tabelas
- 📁 **Storage**: Lista de arquivos
- 🏷️ **Metadata**: Timestamp, versão
- 📊 **Estatísticas**: Contagens e métricas

```bash
# Backup completo
node scripts/utils/backup-database.js

# Backup será salvo em: backups/backup-YYYY-MM-DD-HH-MM-SS.json
```

**Estrutura do backup**:

```json
{
  "timestamp": "2025-09-12T10:30:00.000Z",
  "version": "1.0.0",
  "data": {
    "artworks": [...],
    "series": [...],
    "series_artworks": [...],
    "about_page": [...],
    "user_roles": [...]
  },
  "storage": {
    "raw": [...],
    "optimized": [...]
  }
}
```

### `health-check.js` ✅ ESSENCIAL

**Sistema de health check**

Verifica integridade completa do sistema:

- 🔌 **Conectividade**: Supabase acessível
- 💾 **Database**: Tabelas e dados íntegros
- 📁 **Storage**: Arquivos acessíveis
- 🔍 **Integridade**: Dados consistentes
- ⚡ **Performance**: Tempos de resposta

```bash
# Health check completo
node scripts/utils/health-check.js

# Uso em CI/CD
if node scripts/utils/health-check.js; then
  echo "Sistema saudável"
else
  echo "Issues detectadas"
  exit 1
fi
```

**Saída exemplo**:

```
🏥 Sistema de Health Check - Omentejovem
========================================

🔌 Testando conectividade...
✅ Conectividade OK (45ms)

💾 Testando integridade do banco...
✅ Database OK
   📊 artworks: 95
   📚 series: 5
   🔗 series_artworks: 44

📁 Testando storage...
✅ Storage OK (120ms)
   📁 Raw files: 92
   🚀 Optimized files: 92

🎯 Status Geral: ✅ SAUDÁVEL
```

### `deploy-helper.js` ✅ ESSENCIAL

**Assistente de deploy**

Automações para deploy e pós-deploy:

- 🔍 **Verificação**: Se migração é necessária
- 🚀 **Execução**: Migração automática se primeiro deploy
- 🏥 **Validação**: Health check pós-deploy
- ✅ **Confirmação**: Sistema ready para produção

```bash
# Executar após deploy
node scripts/utils/deploy-helper.js

# Uso em CI/CD
- name: Post-deploy validation
  run: node scripts/utils/deploy-helper.js
```

### `seed-database.sql` 📄 SQL

**Script SQL de seed manual**

Dados iniciais em formato SQL:

- Estrutura de tabelas
- Dados básicos
- Configurações iniciais

```bash
# Executar via psql (se necessário)
psql $DATABASE_URL -f scripts/utils/seed-database.sql
```

## 🔄 Workflows Recomendados

### **Deploy Automático (Vercel)**

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "postbuild": "node scripts/utils/vercel-seed.js"
  }
}
```

### **Deploy Manual**

```bash
# 1. Build da aplicação
yarn build

# 2. Deploy helper
node scripts/utils/deploy-helper.js

# 3. Verificação final
node scripts/utils/health-check.js

# 4. Backup pós-deploy
node scripts/utils/backup-database.js
```

### **CI/CD Pipeline**

```yaml
# GitHub Actions exemplo
name: Deploy
jobs:
  deploy:
    steps:
      - name: Build
        run: yarn build

      - name: Deploy Helper
        run: node scripts/utils/deploy-helper.js

      - name: Health Check
        run: node scripts/utils/health-check.js

      - name: Backup
        run: node scripts/utils/backup-database.js
```

## 🎯 Casos de Uso

### **Primeiro Deploy**

```bash
# Vercel fará automaticamente:
1. Build da aplicação
2. Execução do postbuild (vercel-seed.js)
3. Migração automática se banco vazio
4. Deploy completo
```

### **Deploy Subsequente**

```bash
# Vercel fará automaticamente:
1. Build da aplicação
2. Verificação no postbuild (dados existem)
3. Skip da migração (não duplica)
4. Deploy apenas do código
```

### **Troubleshooting**

```bash
# 1. Verificar saúde do sistema
node scripts/utils/health-check.js

# 2. Fazer backup antes de correções
node scripts/utils/backup-database.js

# 3. Aplicar correções necessárias
# ...

# 4. Validar pós-correção
node scripts/utils/deploy-helper.js
```

### **Disaster Recovery**

```bash
# 1. Restore do backup mais recente
# (processo manual via Supabase dashboard)

# 2. Verificar integridade
node scripts/utils/health-check.js

# 3. Re-executar migrações se necessário
node scripts/utils/deploy-helper.js
```

## 📊 Monitoramento

### **Métricas Importantes**

```bash
# Performance thresholds
- Conectividade: < 100ms
- Database queries: < 200ms
- Storage listing: < 500ms
- Health check total: < 2s
```

### **Alertas Críticos**

```bash
# Falhas que requerem ação imediata
- Conectividade Supabase: FALHOU
- Database inacessível: FALHOU
- Storage indisponível: FALHOU
- Integridade comprometida: FALHOU
```

### **Alertas de Atenção**

```bash
# Issues que requerem monitoramento
- Performance degradada (>2s)
- Arquivos órfãos detectados
- Relacionamentos inconsistentes
- Storage quota >80%
```

## 🔧 Automação

### **Cron Jobs Sugeridos**

```bash
# Backup diário (3h da manhã)
0 3 * * * cd /app && node scripts/utils/backup-database.js

# Health check de hora em hora
0 * * * * cd /app && node scripts/utils/health-check.js >> logs/health.log

# Limpeza semanal (domingo 2h)
0 2 * * 0 cd /app && node scripts/maintenance/cleanup.js
```

### **Webhooks**

```javascript
// Webhook para monitoramento externo
app.post('/webhook/health', async (req, res) => {
  const results = await healthCheck()

  if (
    results.connectivity &&
    results.database &&
    results.storage &&
    results.integrity
  ) {
    res.json({ status: 'healthy', results })
  } else {
    res.status(500).json({ status: 'unhealthy', results })
  }
})
```

## 📁 Estrutura de Backups

### **Organização**

```
backups/
├── backup-2025-09-12-10-30-00.json  # Backup diário
├── backup-2025-09-11-10-30-00.json
├── backup-2025-09-10-10-30-00.json
└── weekly/
    ├── backup-week-37-2025.json     # Backup semanal
    └── backup-week-36-2025.json
```

### **Retenção Sugerida**

- **Diários**: 30 dias
- **Semanais**: 12 semanas
- **Mensais**: 12 meses
- **Anuais**: Permanente

## ⚡ Performance

### **Otimizações**

- Queries específicas (não SELECT \*)
- Conexões reutilizadas
- Batch processing quando possível
- Rate limiting para APIs externas

### **Monitoramento**

```bash
# Verificar tempos de resposta
time node scripts/utils/health-check.js

# Monitorar uso de memória
node --max-old-space-size=512 scripts/utils/backup-database.js
```

## ⚠️ Segurança

### **Variáveis de Ambiente**

```bash
# Obrigatórias
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Opcional (para backups externos)
BACKUP_WEBHOOK_URL=...
MONITORING_API_KEY=...
```

### **Permissões**

- Scripts requerem `SUPABASE_SERVICE_ROLE_KEY`
- Backups podem conter dados sensíveis
- Health checks são seguros para CI/CD
- Deploy helper é idempotente

### **Best Practices**

- ✅ Sempre validar env vars antes da execução
- ✅ Logs não devem conter secrets
- ✅ Backups devem ser armazenados com segurança
- ✅ Health checks devem ter timeout configurado

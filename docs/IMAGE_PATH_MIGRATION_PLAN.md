# Plano de Refatoração e Migração — Sistema de Imagens

## Padrão Final

- Estrutura: `/media/{scaffold}/{slug}/{type?}/{nome-original}.{ext}`
  - `{type}`: opcional, apenas para series, artworks, artifacts
  - `{slug}`: pasta principal, nunca nome do arquivo
  - `{nome-original}.{ext}`: nome do arquivo preservado

## Etapas do Plano

### 1. Refatoração Global do Código

- [x] Refatorar serviço de upload para usar slug como pasta e nome original do arquivo
- [x] Refatorar helpers de URL pública para refletir o novo padrão
- [ ] Corrigir todos os componentes, hooks e pages para usar slug como pasta e nome original do arquivo
- [ ] Validar TipTapEditor, About e ArtContent para garantir compatibilidade

### 2. Migração dos Dados no Supabase Storage

- [ ] Mapear arquivos existentes na estrutura antiga
- [ ] Gerar script de migração para mover arquivos para o novo padrão de pasta/nome
- [ ] Validar migração e remover arquivos antigos

### 3. Testes e Validação

- [ ] Testar upload, exibição e obtenção de URL pública em todos os fluxos (admin, público, editor)
- [ ] Validar que não há mais dependências do padrão antigo

## Observações

- O nome do arquivo nunca deve ser substituído pelo slug/id
- O slug/id serve apenas para organizar a pasta
- O campo `{type}` é opcional e só existe para artworks, series, artifacts
- Atualizar documentação e exemplos após migração

---

## Progresso

- Refatoração dos serviços e helpers: **Concluída**
- Correção dos componentes/hooks: **Em andamento**
- Migração dos dados: **A iniciar**

---

## Próximos Passos

1. Corrigir todos os componentes/hooks para novo padrão
2. Gerar e executar script de migração dos arquivos no Supabase
3. Testar todos os fluxos e atualizar documentação

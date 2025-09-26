# Refatoração de Imagens — Frontend Público (2025-09)

## Resumo do Plano de Simplificação

- **Remover helpers de montagem de URL de imagem**: Eliminar `getImageUrlFromId`, `getImageUrlWithFallback`, `processArtworksForDisplay` e similares. Usar apenas o campo `imageurl` retornado do banco em todos os componentes/pages.
- **Refatorar páginas e componentes**: Atualizar páginas e componentes públicos para consumir `imageurl` diretamente, inclusive para SEO/OG. Garantir fallback para placeholder se não houver imagem.
- **Remover endpoint `/api/images/proxy`**: Excluir rota e código relacionado, pois não é mais necessário.
- **Remover código morto**: Excluir arquivos/funções de helpers antigos e utils de compatibilidade.
- **Testar**: Validar exibição de imagens e SEO/OG no frontend público.

## Status

- [x] Mapeamento dos pontos de uso de imagem
- [x] Planejamento da simplificação
- [ ] Refatoração dos componentes/pages públicos para uso direto de `imageurl`
- [ ] Remoção do endpoint `/api/images/proxy`
- [ ] Remoção de helpers/utils antigos
- [ ] Testes finais

---

## Início da refatoração: Público

1. Refatorar `src/app/series/[slug]/[artwork]/page.tsx` e `src/app/series/[slug]/page.tsx` para consumir apenas `imageurl`.
2. Atualizar SEO/OG para usar `imageurl`.
3. Remover importações e uso de helpers antigos nessas páginas.
4. Garantir fallback para placeholder.

(Os próximos commits seguirão este checklist, descendo para outros componentes/pages públicos e depois admin.)

## Instrunções para lidar com dados legados

O projeto era originalmente um Next.js com ASP dentro da pasta clients/ e esta sendo migrado da estrutura antiga de monorepo, que não funciona bem como monorepo, para uma estrutura de monorepo mais tradicional com Next.js e Supabase.

Na estrutura legado o projeto era um ASP.NET que não tinha uma função clara ou funcional, pois todo o projeto estava praticamente GIT Based, onde toda mudança que era feita no CMS era refletida direto no código nos arquivos ainda presentes na pasta `public/`, sendo eles os arquivos `mint-dates.json`, e `nfts.json`. Mas o que parece ser o centro da verdade quanto aos dados era o arquivo `token-metadata.json` que continha os dados de todos os NFTs, e era atualizado manualmente, o que não é uma boa prática.

Queremos migrar essa estrutura antiga para dentro do Supabase, que é o banco de dados que estamos utilizando para o novo projeto, e para isso precisamos extrair os dados do arquivo `token-metadata.json` e popular o banco de dados com esses dados.

AS NFTs são as `artworks` na estrutura nova, e cada `artwork` pode ter várias `images`, que são as imagens associadas a cada NFT.

### Passos para migração dos dados

1. **Extrair dados do arquivo `token-metadata.json`:** Ler o arquivo e extrair os dados relevantes para cada NFT, como título, descrição, data de criação, e URLs das imagens.
2. **Mapear os dados para a nova estrutura:** Cada NFT deve ser mapeado para uma `artwork` na nova estrutura, e as imagens associadas devem ser mapeadas para `images`.
3. **Popular o banco de dados Supabase:** Utilizar a API do Supabase para inserir os dados extraídos na tabela `artworks` e `images`. Certificar-se de que as relações entre `artworks` e `images` estão corretamente estabelecidas. Criar um seed script para automatizar esse processo tanto em local quanto em produção. Verificar como já é feito o seed do banco de dados no projeto.
4. **Verificar a integridade dos dados:** Após a migração, verificar se todos os dados foram corretamente inseridos no banco de dados e se as relações entre `artworks` e `images` estão funcionando como esperado.
5. **Atualizar o código do frontend:** Garantir que o frontend está utilizando os dados do Supabase corretamente, substituindo qualquer referência direta aos arquivos JSON legados.
6. **Testar a aplicação:** Realizar testes para garantir que todas as funcionalidades relacionadas às `artworks` e `images` estão funcionando corretamente após a migração dos dados.

const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')
const {  fileURLToPath  } = require('url')

// Configure environment


const projectRoot = path.resolve(__dirname, '../..')
dotenv.config({ path: path.join(projectRoot, '.env') })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Análise de Integridade de Token ID
 * Compara dados do token-metadata.json com Supabase
 */

function generateSlug(name) {
  if (!name) return null
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractContractInfo(metadata) {
  // Para Ethereum
  if (metadata.contract?.address) {
    return {
      blockchain: 'ethereum',
      contract_address: metadata.contract.address,
      collection_slug: metadata.collection?.slug || null
    }
  }
  
  // Para Tezos (formato diferente)
  if (metadata.contract?.address?.startsWith('KT1')) {
    return {
      blockchain: 'tezos',
      contract_address: metadata.contract.address,
      collection_slug: null
    }
  }
  
  return null
}

function buildMintLink(metadata) {
  const contractInfo = extractContractInfo(metadata)
  if (!contractInfo || !metadata.tokenId) return null
  
  const { blockchain, contract_address } = contractInfo
  const tokenId = metadata.tokenId
  
  if (blockchain === 'ethereum') {
    return `https://opensea.io/assets/ethereum/${contract_address}/${tokenId}`
  } else if (blockchain === 'tezos') {
    return `https://objkt.com/asset/${contract_address}/${tokenId}`
  }
  
  return null
}

async function analyzeTokenIdIntegrity() {
  console.log('🔍 ANÁLISE DE INTEGRIDADE DE TOKEN ID')
  console.log('=====================================\n')
  
  try {
    // 1. Ler dados do token-metadata.json
    console.log('📖 Lendo token-metadata.json...')
    const tokenMetadataPath = path.join(projectRoot, 'public', 'token-metadata.json')
    const tokenMetadata = JSON.parse(fs.readFileSync(tokenMetadataPath, 'utf8'))
    
    console.log(`✅ Encontrados ${tokenMetadata.length} NFTs no arquivo\n`)
    
    // 2. Buscar todos os artworks do Supabase
    console.log('🗄️ Buscando artworks do Supabase...')
    const { data: supabaseArtworks, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      throw new Error(`Erro ao buscar artworks: ${error.message}`)
    }
    
    console.log(`✅ Encontrados ${supabaseArtworks.length} artworks no Supabase\n`)
    
    // 3. Analisar dados por NFT
    const analysis = {
      total_nfts: tokenMetadata.length,
      total_artworks: supabaseArtworks.length,
      matched: [],
      missing_token_id: [],
      incorrect_token_id: [],
      missing_mint_link: [],
      incorrect_mint_link: [],
      missing_in_supabase: [],
      extra_in_supabase: []
    }
    
    // Criar mapa de artworks por slug para busca rápida
    const artworkMap = new Map()
    supabaseArtworks.forEach(artwork => {
      if (artwork.slug) {
        artworkMap.set(artwork.slug, artwork)
      }
    })
    
    console.log('🔍 Analisando correspondências...\n')
    
    // Analisar cada NFT do metadata
    tokenMetadata.forEach((nft, index) => {
      if (!nft.name) {
        console.log(`⚠️  NFT ${index + 1}: Nome ausente, pulando...`)
        return
      }
      
      const slug = generateSlug(nft.name)
      const artwork = artworkMap.get(slug)
      const contractInfo = extractContractInfo(nft)
      const expectedMintLink = buildMintLink(nft)
      
      if (!artwork) {
        analysis.missing_in_supabase.push({
          name: nft.name,
          slug,
          token_id: nft.tokenId,
          contract: contractInfo?.contract_address,
          blockchain: contractInfo?.blockchain
        })
        return
      }
      
      // Marcar como encontrado
      artworkMap.delete(slug)
      
      const issues = []
      
      // Verificar token_id
      if (!artwork.token_id && nft.tokenId) {
        analysis.missing_token_id.push({
          slug,
          name: nft.name,
          expected_token_id: nft.tokenId,
          current_token_id: artwork.token_id
        })
        issues.push('token_id ausente')
      } else if (artwork.token_id && nft.tokenId && artwork.token_id !== nft.tokenId) {
        analysis.incorrect_token_id.push({
          slug,
          name: nft.name,
          expected_token_id: nft.tokenId,
          current_token_id: artwork.token_id
        })
        issues.push('token_id incorreto')
      }
      
      // Verificar mint_link
      if (!artwork.mint_link && expectedMintLink) {
        analysis.missing_mint_link.push({
          slug,
          name: nft.name,
          expected_mint_link: expectedMintLink,
          current_mint_link: artwork.mint_link
        })
        issues.push('mint_link ausente')
      } else if (artwork.mint_link && expectedMintLink && artwork.mint_link !== expectedMintLink) {
        analysis.incorrect_mint_link.push({
          slug,
          name: nft.name,
          expected_mint_link: expectedMintLink,
          current_mint_link: artwork.mint_link
        })
        issues.push('mint_link incorreto')
      }
      
      if (issues.length === 0) {
        analysis.matched.push({
          slug,
          name: nft.name,
          token_id: artwork.token_id,
          mint_link: artwork.mint_link
        })
      } else {
        console.log(`⚠️  ${nft.name}: ${issues.join(', ')}`)
      }
    })
    
    // Artworks extras no Supabase (não encontrados no metadata)
    artworkMap.forEach((artwork, slug) => {
      analysis.extra_in_supabase.push({
        slug,
        name: artwork.title,
        token_id: artwork.token_id,
        mint_link: artwork.mint_link
      })
    })
    
    // 4. Gerar relatório
    console.log('\n📊 RELATÓRIO DE INTEGRIDADE')
    console.log('===========================\n')
    
    console.log(`✅ Total de NFTs (metadata): ${analysis.total_nfts}`)
    console.log(`✅ Total de artworks (Supabase): ${analysis.total_artworks}`)
    console.log(`✅ Correspondências corretas: ${analysis.matched.length}`)
    console.log(`❌ Token ID ausente: ${analysis.missing_token_id.length}`)
    console.log(`❌ Token ID incorreto: ${analysis.incorrect_token_id.length}`)
    console.log(`❌ Mint link ausente: ${analysis.missing_mint_link.length}`)
    console.log(`❌ Mint link incorreto: ${analysis.incorrect_mint_link.length}`)
    console.log(`❌ Ausentes no Supabase: ${analysis.missing_in_supabase.length}`)
    console.log(`❌ Extras no Supabase: ${analysis.extra_in_supabase.length}`)
    
    console.log('\n🔍 DETALHES DOS PROBLEMAS')
    console.log('========================\n')
    
    if (analysis.missing_token_id.length > 0) {
      console.log('📋 TOKEN IDs AUSENTES:')
      analysis.missing_token_id.forEach(item => {
        console.log(`   • ${item.name} (${item.slug}) - Deveria ter: ${item.expected_token_id}`)
      })
      console.log('')
    }
    
    if (analysis.incorrect_token_id.length > 0) {
      console.log('📋 TOKEN IDs INCORRETOS:')
      analysis.incorrect_token_id.forEach(item => {
        console.log(`   • ${item.name} (${item.slug})`)
        console.log(`     Atual: ${item.current_token_id} | Deveria ser: ${item.expected_token_id}`)
      })
      console.log('')
    }
    
    if (analysis.missing_mint_link.length > 0) {
      console.log('📋 MINT LINKS AUSENTES:')
      analysis.missing_mint_link.forEach(item => {
        console.log(`   • ${item.name} (${item.slug})`)
        console.log(`     Deveria ter: ${item.expected_mint_link}`)
      })
      console.log('')
    }
    
    if (analysis.incorrect_mint_link.length > 0) {
      console.log('📋 MINT LINKS INCORRETOS:')
      analysis.incorrect_mint_link.forEach(item => {
        console.log(`   • ${item.name} (${item.slug})`)
        console.log(`     Atual: ${item.current_mint_link}`)
        console.log(`     Deveria ser: ${item.expected_mint_link}`)
      })
      console.log('')
    }
    
    if (analysis.missing_in_supabase.length > 0) {
      console.log('📋 NFTs AUSENTES NO SUPABASE:')
      analysis.missing_in_supabase.forEach(item => {
        console.log(`   • ${item.name} (${item.slug}) - Token: ${item.token_id}`)
      })
      console.log('')
    }
    
    if (analysis.extra_in_supabase.length > 0) {
      console.log('📋 ARTWORKS EXTRAS NO SUPABASE (sem NFT correspondente):')
      analysis.extra_in_supabase.forEach(item => {
        console.log(`   • ${item.name} (${item.slug})`)
      })
      console.log('')
    }
    
    // 5. Salvar resultado da análise
    const analysisPath = path.join(projectRoot, 'scripts', 'analysis', 'token-id-analysis-result.json')
    console.log(`💾 Salvando análise detalhada em: ${analysisPath}`)
    
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2))
    
    console.log('\n🎯 PRÓXIMOS PASSOS')
    console.log('=================')
    console.log('1. Revisar os problemas identificados acima')
    console.log('2. Executar script de correção: node scripts/maintenance/fix-token-id-data.js')
    console.log('3. Executar verificação final: node scripts/analysis/verify-data-consistency.js')
    
    return analysis
    
  } catch (error) {
    console.error('❌ Erro na análise:', error.message)
    throw error
  }
}

// Executar automaticamente
analyzeTokenIdIntegrity()
  .then(() => {
    console.log('\n✅ Análise concluída!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Falha na análise:', error.message)
    process.exit(1)
  })

module.exports = analyzeTokenIdIntegrity

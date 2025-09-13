import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Configure environment
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')
dotenv.config({ path: path.join(projectRoot, '.env') })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Correção de Token ID e Mint Link
 * Corrige dados baseado na análise do token-metadata.json
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

async function fixTokenIdData(dryRun = false) {
  console.log('🔧 CORREÇÃO DE TOKEN ID E MINT LINK')
  console.log('==================================\n')
  
  if (dryRun) {
    console.log('🏃‍♂️ MODO DRY-RUN - Apenas simulação, sem alterações no banco\n')
  }
  
  try {
    // 1. Ler dados do token-metadata.json
    console.log('📖 Lendo token-metadata.json...')
    const tokenMetadataPath = path.join(projectRoot, 'public', 'token-metadata.json')
    console.log(`Path do metadata: ${tokenMetadataPath}`)
    
    const tokenMetadata = JSON.parse(readFileSync(tokenMetadataPath, 'utf8'))
    
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
    
    // 3. Criar mapa de artworks por slug
    const artworkMap = new Map()
    supabaseArtworks.forEach(artwork => {
      if (artwork.slug) {
        artworkMap.set(artwork.slug, artwork)
      }
    })
    
    // 4. Processar correções
    const fixes = {
      token_id_added: [],
      token_id_corrected: [],
      mint_link_added: [],
      mint_link_corrected: [],
      contract_info_added: [],
      errors: []
    }
    
    console.log('🔍 Processando correções...\n')
    
    for (const nft of tokenMetadata) {
      if (!nft.name) continue
      
      const slug = generateSlug(nft.name)
      const artwork = artworkMap.get(slug)
      
      if (!artwork) {
        console.log(`⚠️  Artwork não encontrado para: ${nft.name} (${slug})`)
        continue
      }
      
      const contractInfo = extractContractInfo(nft)
      const expectedMintLink = buildMintLink(nft)
      
      const updates = {}
      let needsUpdate = false
      
      // Correção do token_id
      if (!artwork.token_id && nft.tokenId) {
        updates.token_id = nft.tokenId
        needsUpdate = true
        fixes.token_id_added.push({
          slug,
          name: nft.name,
          token_id: nft.tokenId
        })
        console.log(`✅ Adicionando token_id: ${nft.name} -> ${nft.tokenId}`)
      } else if (artwork.token_id && nft.tokenId && artwork.token_id !== nft.tokenId) {
        updates.token_id = nft.tokenId
        needsUpdate = true
        fixes.token_id_corrected.push({
          slug,
          name: nft.name,
          old_token_id: artwork.token_id,
          new_token_id: nft.tokenId
        })
        console.log(`✅ Corrigindo token_id: ${nft.name} (${artwork.token_id} -> ${nft.tokenId})`)
      }
      
      // Correção do mint_link
      if (!artwork.mint_link && expectedMintLink) {
        updates.mint_link = expectedMintLink
        needsUpdate = true
        fixes.mint_link_added.push({
          slug,
          name: nft.name,
          mint_link: expectedMintLink
        })
        console.log(`✅ Adicionando mint_link: ${nft.name}`)
      } else if (artwork.mint_link && expectedMintLink && artwork.mint_link !== expectedMintLink) {
        updates.mint_link = expectedMintLink
        needsUpdate = true
        fixes.mint_link_corrected.push({
          slug,
          name: nft.name,
          old_mint_link: artwork.mint_link,
          new_mint_link: expectedMintLink
        })
        console.log(`✅ Corrigindo mint_link: ${nft.name}`)
      }
      
      // Correção de informações de contrato
      if (contractInfo) {
        if (!artwork.contract_address && contractInfo.contract_address) {
          updates.contract_address = contractInfo.contract_address
          needsUpdate = true
        }
        
        if (!artwork.blockchain && contractInfo.blockchain) {
          updates.blockchain = contractInfo.blockchain
          needsUpdate = true
        }
        
        if (!artwork.collection_slug && contractInfo.collection_slug) {
          updates.collection_slug = contractInfo.collection_slug
          needsUpdate = true
        }
        
        if (updates.contract_address || updates.blockchain || updates.collection_slug) {
          fixes.contract_info_added.push({
            slug,
            name: nft.name,
            contract_address: contractInfo.contract_address,
            blockchain: contractInfo.blockchain,
            collection_slug: contractInfo.collection_slug
          })
        }
      }
      
      // Aplicar atualizações
      if (needsUpdate && !dryRun) {
        try {
          const { error: updateError } = await supabase
            .from('artworks')
            .update(updates)
            .eq('slug', slug)
          
          if (updateError) {
            throw updateError
          }
        } catch (error) {
          fixes.errors.push({
            slug,
            name: nft.name,
            error: error.message
          })
          console.error(`❌ Erro ao atualizar ${nft.name}: ${error.message}`)
        }
      }
    }
    
    // 5. Gerar relatório de correções
    console.log('\n📊 RELATÓRIO DE CORREÇÕES')
    console.log('=========================\n')
    
    console.log(`✅ Token IDs adicionados: ${fixes.token_id_added.length}`)
    console.log(`✅ Token IDs corrigidos: ${fixes.token_id_corrected.length}`)
    console.log(`✅ Mint links adicionados: ${fixes.mint_link_added.length}`)
    console.log(`✅ Mint links corrigidos: ${fixes.mint_link_corrected.length}`)
    console.log(`✅ Informações de contrato adicionadas: ${fixes.contract_info_added.length}`)
    console.log(`❌ Erros encontrados: ${fixes.errors.length}`)
    
    if (fixes.errors.length > 0) {
      console.log('\n❌ ERROS DETALHADOS:')
      fixes.errors.forEach(error => {
        console.log(`   • ${error.name} (${error.slug}): ${error.error}`)
      })
    }
    
    // 6. Salvar resultado das correções
    const fixesPath = path.join(projectRoot, 'scripts', 'maintenance', 'token-id-fixes-result.json')
    console.log(`\n💾 Salvando resultado das correções em: ${fixesPath}`)
    
    import('fs').then(fs => {
      fs.writeFileSync(fixesPath, JSON.stringify(fixes, null, 2))
    })
    
    if (dryRun) {
      console.log('\n🏃‍♂️ MODO DRY-RUN CONCLUÍDO')
      console.log('Para aplicar as correções, execute:')
      console.log('node scripts/maintenance/fix-token-id-data.js --apply')
    } else {
      console.log('\n🎯 PRÓXIMOS PASSOS')
      console.log('=================')
      console.log('1. Verificar se as correções foram aplicadas corretamente')
      console.log('2. Executar verificação final: node scripts/analysis/verify-data-consistency.js')
      console.log('3. Executar relatório final: node scripts/analysis/complete-migration-summary.js')
    }
    
    return fixes
    
  } catch (error) {
    console.error('❌ Erro na correção:', error.message)
    throw error
  }
}

// Executar automaticamente
const args = process.argv.slice(2)
const dryRun = !args.includes('--apply')

if (dryRun) {
  console.log('💡 Para aplicar as correções, use: --apply\n')
}

fixTokenIdData(dryRun)
  .then(() => {
    console.log('\n✅ Correção concluída!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Falha na correção:', error.message)
    process.exit(1)
  })

export default fixTokenIdData

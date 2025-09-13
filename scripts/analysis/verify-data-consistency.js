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
 * Verificação de Consistência de Dados
 * Valida integridade completa dos dados NFT
 */

function validateUrl(url) {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function validateTokenId(tokenId) {
  if (!tokenId) return false
  return /^[0-9]+$/.test(tokenId.toString())
}

function validateContractAddress(address, blockchain) {
  if (!address) return false
  
  if (blockchain === 'ethereum') {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  } else if (blockchain === 'tezos') {
    return /^KT1[a-zA-Z0-9]{33}$/.test(address)
  }
  
  return false
}

function validateMintLink(mintLink, blockchain, contractAddress, tokenId) {
  if (!mintLink || !blockchain || !contractAddress || !tokenId) return false
  
  if (blockchain === 'ethereum') {
    const expectedPattern = `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`
    return mintLink === expectedPattern
  } else if (blockchain === 'tezos') {
    const expectedPattern = `https://objkt.com/asset/${contractAddress}/${tokenId}`
    return mintLink === expectedPattern
  }
  
  return false
}

async function verifyDataConsistency() {
  console.log('✅ VERIFICAÇÃO DE CONSISTÊNCIA DE DADOS')
  console.log('======================================\n')
  
  try {
    // 1. Buscar todos os artworks
    console.log('🗄️ Buscando todos os artworks...')
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      throw new Error(`Erro ao buscar artworks: ${error.message}`)
    }
    
    console.log(`✅ Encontrados ${artworks.length} artworks\n`)
    
    // 2. Ler dados de referência (token-metadata.json)
    console.log('📖 Lendo dados de referência...')
    const tokenMetadataPath = path.join(projectRoot, 'public', 'token-metadata.json')
    const tokenMetadata = JSON.parse(readFileSync(tokenMetadataPath, 'utf8'))
    
    console.log(`✅ Encontrados ${tokenMetadata.length} NFTs de referência\n`)
    
    // 3. Análise de consistência
    const validation = {
      total_artworks: artworks.length,
      validation_results: {
        valid: [],
        invalid: []
      },
      summary: {
        with_token_id: 0,
        without_token_id: 0,
        with_mint_link: 0,
        without_mint_link: 0,
        with_contract_address: 0,
        without_contract_address: 0,
        with_blockchain: 0,
        without_blockchain: 0,
        valid_token_ids: 0,
        invalid_token_ids: 0,
        valid_mint_links: 0,
        invalid_mint_links: 0,
        valid_contract_addresses: 0,
        invalid_contract_addresses: 0
      },
      issues: {
        missing_token_id: [],
        invalid_token_id: [],
        missing_mint_link: [],
        invalid_mint_link: [],
        missing_contract_address: [],
        invalid_contract_address: [],
        missing_blockchain: [],
        inconsistent_data: []
      }
    }
    
    console.log('🔍 Validando cada artwork...\n')
    
    for (const artwork of artworks) {
      const issues = []
      
      // Validação do token_id
      if (artwork.token_id) {
        validation.summary.with_token_id++
        if (validateTokenId(artwork.token_id)) {
          validation.summary.valid_token_ids++
        } else {
          validation.summary.invalid_token_ids++
          issues.push('Token ID inválido')
          validation.issues.invalid_token_id.push({
            slug: artwork.slug,
            name: artwork.title,
            token_id: artwork.token_id
          })
        }
      } else {
        validation.summary.without_token_id++
        issues.push('Token ID ausente')
        validation.issues.missing_token_id.push({
          slug: artwork.slug,
          name: artwork.title
        })
      }
      
      // Validação do mint_link
      if (artwork.mint_link) {
        validation.summary.with_mint_link++
        if (validateUrl(artwork.mint_link)) {
          if (validateMintLink(artwork.mint_link, artwork.blockchain, artwork.contract_address, artwork.token_id)) {
            validation.summary.valid_mint_links++
          } else {
            validation.summary.invalid_mint_links++
            issues.push('Mint link inconsistente')
            validation.issues.invalid_mint_link.push({
              slug: artwork.slug,
              name: artwork.title,
              mint_link: artwork.mint_link,
              expected_format: artwork.blockchain === 'ethereum' 
                ? `https://opensea.io/assets/ethereum/${artwork.contract_address}/${artwork.token_id}`
                : `https://objkt.com/asset/${artwork.contract_address}/${artwork.token_id}`
            })
          }
        } else {
          validation.summary.invalid_mint_links++
          issues.push('Mint link inválido')
          validation.issues.invalid_mint_link.push({
            slug: artwork.slug,
            name: artwork.title,
            mint_link: artwork.mint_link,
            reason: 'URL malformada'
          })
        }
      } else {
        validation.summary.without_mint_link++
        issues.push('Mint link ausente')
        validation.issues.missing_mint_link.push({
          slug: artwork.slug,
          name: artwork.title
        })
      }
      
      // Validação do contract_address
      if (artwork.contract_address) {
        validation.summary.with_contract_address++
        if (validateContractAddress(artwork.contract_address, artwork.blockchain)) {
          validation.summary.valid_contract_addresses++
        } else {
          validation.summary.invalid_contract_addresses++
          issues.push('Contract address inválido')
          validation.issues.invalid_contract_address.push({
            slug: artwork.slug,
            name: artwork.title,
            contract_address: artwork.contract_address,
            blockchain: artwork.blockchain
          })
        }
      } else {
        validation.summary.without_contract_address++
        issues.push('Contract address ausente')
        validation.issues.missing_contract_address.push({
          slug: artwork.slug,
          name: artwork.title
        })
      }
      
      // Validação do blockchain
      if (artwork.blockchain) {
        validation.summary.with_blockchain++
        if (!['ethereum', 'tezos'].includes(artwork.blockchain)) {
          issues.push('Blockchain inválida')
          validation.issues.missing_blockchain.push({
            slug: artwork.slug,
            name: artwork.title,
            blockchain: artwork.blockchain
          })
        }
      } else {
        validation.summary.without_blockchain++
        issues.push('Blockchain ausente')
        validation.issues.missing_blockchain.push({
          slug: artwork.slug,
          name: artwork.title
        })
      }
      
      // Verificar consistência entre campos
      if (artwork.token_id && artwork.contract_address && artwork.blockchain && artwork.mint_link) {
        const expectedMintLink = artwork.blockchain === 'ethereum'
          ? `https://opensea.io/assets/ethereum/${artwork.contract_address}/${artwork.token_id}`
          : `https://objkt.com/asset/${artwork.contract_address}/${artwork.token_id}`
        
        if (artwork.mint_link !== expectedMintLink) {
          issues.push('Dados inconsistentes')
          validation.issues.inconsistent_data.push({
            slug: artwork.slug,
            name: artwork.title,
            current_mint_link: artwork.mint_link,
            expected_mint_link: expectedMintLink
          })
        }
      }
      
      // Classificar artwork
      if (issues.length === 0) {
        validation.validation_results.valid.push({
          slug: artwork.slug,
          name: artwork.title,
          token_id: artwork.token_id,
          mint_link: artwork.mint_link
        })
        console.log(`✅ ${artwork.title} - Todos os dados válidos`)
      } else {
        validation.validation_results.invalid.push({
          slug: artwork.slug,
          name: artwork.title,
          issues: issues
        })
        console.log(`❌ ${artwork.title} - Problemas: ${issues.join(', ')}`)
      }
    }
    
    // 4. Gerar relatório final
    console.log('\n📊 RELATÓRIO FINAL DE CONSISTÊNCIA')
    console.log('==================================\n')
    
    console.log('📈 ESTATÍSTICAS GERAIS:')
    console.log(`   Total de artworks: ${validation.total_artworks}`)
    console.log(`   ✅ Artworks válidos: ${validation.validation_results.valid.length}`)
    console.log(`   ❌ Artworks com problemas: ${validation.validation_results.invalid.length}`)
    console.log(`   📊 Taxa de sucesso: ${((validation.validation_results.valid.length / validation.total_artworks) * 100).toFixed(1)}%`)
    
    console.log('\n📋 ANÁLISE POR CAMPO:')
    console.log(`   Token ID:`)
    console.log(`     ✅ Presentes: ${validation.summary.with_token_id} (${validation.summary.valid_token_ids} válidos)`)
    console.log(`     ❌ Ausentes: ${validation.summary.without_token_id}`)
    console.log(`     ❌ Inválidos: ${validation.summary.invalid_token_ids}`)
    
    console.log(`   Mint Link:`)
    console.log(`     ✅ Presentes: ${validation.summary.with_mint_link} (${validation.summary.valid_mint_links} válidos)`)
    console.log(`     ❌ Ausentes: ${validation.summary.without_mint_link}`)
    console.log(`     ❌ Inválidos: ${validation.summary.invalid_mint_links}`)
    
    console.log(`   Contract Address:`)
    console.log(`     ✅ Presentes: ${validation.summary.with_contract_address} (${validation.summary.valid_contract_addresses} válidos)`)
    console.log(`     ❌ Ausentes: ${validation.summary.without_contract_address}`)
    console.log(`     ❌ Inválidos: ${validation.summary.invalid_contract_addresses}`)
    
    console.log(`   Blockchain:`)
    console.log(`     ✅ Presentes: ${validation.summary.with_blockchain}`)
    console.log(`     ❌ Ausentes: ${validation.summary.without_blockchain}`)
    
    // 5. Detalhes dos problemas
    console.log('\n🔍 PROBLEMAS DETALHADOS')
    console.log('=======================')
    
    Object.entries(validation.issues).forEach(([issueType, items]) => {
      if (items.length > 0) {
        console.log(`\n📋 ${issueType.toUpperCase().replace(/_/g, ' ')} (${items.length}):`)
        items.slice(0, 10).forEach(item => { // Limitar a 10 itens para não sobrecarregar
          console.log(`   • ${item.name} (${item.slug})`)
          if (item.reason) console.log(`     Motivo: ${item.reason}`)
          if (item.expected_format) console.log(`     Formato esperado: ${item.expected_format}`)
        })
        if (items.length > 10) {
          console.log(`   ... e mais ${items.length - 10} itens`)
        }
      }
    })
    
    // 6. Salvar relatório completo
    const reportPath = path.join(projectRoot, 'scripts', 'analysis', 'data-consistency-report.json')
    console.log(`\n💾 Salvando relatório completo em: ${reportPath}`)
    
    import('fs').then(fs => {
      fs.writeFileSync(reportPath, JSON.stringify(validation, null, 2))
    })
    
    // 7. Recomendações
    console.log('\n🎯 RECOMENDAÇÕES')
    console.log('===============')
    
    if (validation.validation_results.invalid.length === 0) {
      console.log('🎉 Parabéns! Todos os dados estão consistentes!')
      console.log('   O sistema está pronto para produção.')
    } else {
      console.log('⚠️  Ainda existem problemas nos dados:')
      
      if (validation.issues.missing_token_id.length > 0) {
        console.log('   1. Execute novamente a correção de Token ID')
      }
      
      if (validation.issues.missing_mint_link.length > 0) {
        console.log('   2. Execute novamente a correção de Mint Link')
      }
      
      if (validation.issues.inconsistent_data.length > 0) {
        console.log('   3. Verifique dados inconsistentes manualmente')
      }
      
      console.log('   4. Execute este script novamente após as correções')
    }
    
    return validation
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message)
    throw error
  }
}

// Executar automaticamente
verifyDataConsistency()
  .then(() => {
    console.log('\n✅ Verificação concluída!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Falha na verificação:', error.message)
    process.exit(1)
  })

export default verifyDataConsistency

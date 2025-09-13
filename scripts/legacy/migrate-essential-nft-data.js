/**
 * Script para migrar campos essenciais NFT do legacy para Supabase
 *
 * Migra apenas os campos essenciais para identificação NFT:
 * - contract_address
 * - blockchain
 * - collection_slug
 *
 * Outros dados ficam no legacy para API futura
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Carregar variáveis de ambiente
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment variables required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Lê os dados legacy
 */
function readLegacyData() {
  const filePath = path.join(__dirname, '../public/token-metadata.json')
  const tezosPath = path.join(__dirname, '../public/tezos-data.json')

  const ethData = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
    : []
  const tezosData = fs.existsSync(tezosPath)
    ? JSON.parse(fs.readFileSync(tezosPath, 'utf8'))
    : []

  return { ethData, tezosData }
}

/**
 * Mapeia blockchain do token
 */
function getBlockchain(token) {
  if (token.tokenType === 'FA2') return 'tezos'
  return 'ethereum'
}

/**
 * Migra campos essenciais NFT
 */
async function migrateEssentialNftData() {
  console.log('🔗 Iniciando migração de dados essenciais NFT...\n')

  try {
    // 1. Ler dados legacy
    const { ethData, tezosData } = readLegacyData()
    const allTokens = [...ethData, ...tezosData]

    console.log(`📁 Total de tokens encontrados: ${allTokens.length}`)
    console.log(`📁 Ethereum: ${ethData.length}`)
    console.log(`📁 Tezos: ${tezosData.length}`)

    // 2. Buscar artworks existentes no Supabase
    const { data: artworks, error: fetchError } = await supabase
      .from('artworks')
      .select(
        'id, slug, title, token_id, contract_address, blockchain, collection_slug'
      )

    if (fetchError) {
      throw new Error(`❌ Erro ao buscar artworks: ${fetchError.message}`)
    }

    console.log(`🎨 Encontrados ${artworks.length} artworks no Supabase`)

    // 3. Processar tokens e fazer updates
    let updated = 0
    let skipped = 0
    let errors = 0

    for (const token of allTokens) {
      const tokenName = token.name
      const artwork = artworks.find(
        (a) => a.title.toLowerCase() === tokenName.toLowerCase()
      )

      if (!artwork) {
        console.log(`⚠️  Artwork não encontrado: "${tokenName}"`)
        skipped++
        continue
      }

      // Verificar se já tem os dados essenciais
      if (
        artwork.contract_address &&
        artwork.blockchain &&
        artwork.collection_slug
      ) {
        console.log(`⏭️  ${artwork.slug} já tem dados NFT completos`)
        skipped++
        continue
      }

      // Preparar dados para update
      const updateData = {
        contract_address: token.contract.address,
        blockchain: getBlockchain(token),
        collection_slug:
          token.contract.openSeaMetadata?.collectionSlug ||
          token.collection?.slug ||
          null
      }

      console.log(`🔄 Atualizando ${artwork.slug}:`)
      console.log(`   - Contract: ${updateData.contract_address}`)
      console.log(`   - Blockchain: ${updateData.blockchain}`)
      console.log(`   - Collection: ${updateData.collection_slug || 'N/A'}`)

      // Fazer update
      const { error: updateError } = await supabase
        .from('artworks')
        .update(updateData)
        .eq('id', artwork.id)

      if (updateError) {
        console.error(
          `❌ Erro ao atualizar ${artwork.slug}: ${updateError.message}`
        )
        errors++
      } else {
        updated++
      }
    }

    // 4. Relatório final
    console.log('\n📊 Relatório da migração de dados essenciais NFT:')
    console.log(`✅ Atualizados: ${updated}`)
    console.log(`⏭️  Ignorados: ${skipped}`)
    console.log(`❌ Erros: ${errors}`)
    console.log('\n🎉 Migração de dados essenciais NFT concluída!')
    console.log(
      '\n💡 Outros dados NFT (attributes, tags, etc.) permanecem no legacy'
    )
    console.log('   e serão acessados via API quando necessário no futuro.')
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message)
    process.exit(1)
  }
}

// Executar migração
migrateEssentialNftData()

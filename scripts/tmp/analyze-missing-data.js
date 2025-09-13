/**
 * Script para analisar dados faltantes da migração legacy
 *
 * Compara os dados legacy com os dados do Supabase para identificar
 * quais campos/informações ainda não foram migrados
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
  console.error(
    '❌ Environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Lê os dados legacy
 */
function readLegacyData() {
  const filePath = path.join(__dirname, '../public/token-metadata.json')
  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ File not found: ${filePath}`)
  }
  const data = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(data)
}

/**
 * Analisa campos disponíveis nos dados legacy
 */
function analyzeLegacyFields(tokens) {
  const sampleToken = tokens[0]
  console.log('📊 Estrutura de dados legacy disponível:')
  console.log('=====================================')

  // Campos principais do token
  console.log('\n🎨 Campos do Token:')
  console.log(`- tokenId: ${sampleToken.tokenId}`)
  console.log(`- name: ${sampleToken.name}`)
  console.log(`- description: ${sampleToken.description}`)
  console.log(`- tokenUri: ${sampleToken.tokenUri}`)
  console.log(`- tokenType: ${sampleToken.tokenType}`)

  // Campos do contrato
  console.log('\n📝 Dados do Contrato:')
  console.log(`- address: ${sampleToken.contract.address}`)
  console.log(`- name: ${sampleToken.contract.name}`)
  console.log(`- symbol: ${sampleToken.contract.symbol}`)
  console.log(`- totalSupply: ${sampleToken.contract.totalSupply}`)
  console.log(`- contractDeployer: ${sampleToken.contract.contractDeployer}`)
  console.log(
    `- deployedBlockNumber: ${sampleToken.contract.deployedBlockNumber}`
  )

  // Metadados do OpenSea
  console.log('\n🌊 OpenSea Metadata:')
  console.log(
    `- collectionName: ${sampleToken.contract.openSeaMetadata.collectionName}`
  )
  console.log(
    `- collectionSlug: ${sampleToken.contract.openSeaMetadata.collectionSlug}`
  )
  console.log(
    `- floorPrice: ${sampleToken.contract.openSeaMetadata.floorPrice}`
  )

  // Imagens e mídia
  console.log('\n🖼️ Dados de Imagem:')
  console.log(`- originalUrl: ${sampleToken.image.originalUrl}`)
  console.log(`- cachedUrl: ${sampleToken.image.cachedUrl}`)
  console.log(`- thumbnailUrl: ${sampleToken.image.thumbnailUrl}`)
  console.log(`- contentType: ${sampleToken.image.contentType}`)
  console.log(`- size: ${sampleToken.image.size}`)

  // Dados de animação/vídeo
  console.log('\n🎬 Dados de Animação:')
  console.log(`- animation.originalUrl: ${sampleToken.animation.originalUrl}`)
  console.log(
    `- raw.metadata.animation_url: ${sampleToken.raw.metadata.animation_url || 'null'}`
  )

  // Atributos NFT
  console.log('\n🏷️ Atributos NFT:')
  if (sampleToken.raw.metadata.attributes) {
    sampleToken.raw.metadata.attributes.forEach((attr, i) => {
      console.log(`  - ${attr.trait_type}: ${attr.value}`)
    })
  }

  // Tags
  console.log('\n🏷️ Tags:')
  if (sampleToken.raw.metadata.tags) {
    console.log(`  - ${sampleToken.raw.metadata.tags.join(', ')}`)
  }

  // Mídia adicional
  console.log('\n📱 Media Info:')
  if (sampleToken.raw.metadata.media) {
    console.log(`- mimeType: ${sampleToken.raw.metadata.media.mimeType}`)
    console.log(`- dimensions: ${sampleToken.raw.metadata.media.dimensions}`)
    console.log(`- uri: ${sampleToken.raw.metadata.media.uri}`)
  }

  return {
    totalTokens: tokens.length,
    tokensWithAnimation: tokens.filter((t) => t.raw?.metadata?.animation_url)
      .length,
    tokensWithAttributes: tokens.filter(
      (t) => t.raw?.metadata?.attributes?.length > 0
    ).length,
    tokensWithTags: tokens.filter((t) => t.raw?.metadata?.tags?.length > 0)
      .length,
    uniqueContractAddresses: [
      ...new Set(tokens.map((t) => t.contract.address))
    ],
    uniqueCollections: [...new Set(tokens.map((t) => t.contract.name))]
  }
}

/**
 * Verifica dados faltantes no Supabase
 */
async function checkMissingDataInSupabase(legacyTokens) {
  console.log('\n🔍 Verificando dados faltantes no Supabase...')
  console.log('===============================================')

  // Buscar todos os artworks no Supabase
  const { data: artworks, error } = await supabase.from('artworks').select('*')

  if (error) {
    throw new Error(`❌ Erro ao buscar artworks: ${error.message}`)
  }

  console.log(`📊 Total no Supabase: ${artworks.length} artworks`)
  console.log(`📊 Total no Legacy: ${legacyTokens.length} tokens`)

  // Campos que podem estar faltando
  const fieldsAnalysis = {
    missingContractAddress: 0,
    missingTokenUri: 0,
    missingOriginalImageUrl: 0,
    missingThumbnailUrl: 0,
    missingAttributes: 0,
    missingTags: 0,
    missingCollectionInfo: 0,
    tokensNotFoundInSupabase: 0
  }

  // Tokens que não foram encontrados no Supabase
  const missingTokens = []

  // Analisar cada token legacy
  for (const token of legacyTokens) {
    const tokenName = token.name
    const artwork = artworks.find(
      (a) => a.title.toLowerCase() === tokenName.toLowerCase()
    )

    if (!artwork) {
      fieldsAnalysis.tokensNotFoundInSupabase++
      missingTokens.push({
        name: tokenName,
        tokenId: token.tokenId,
        contract: token.contract.address
      })
      continue
    }

    // Verificar campos faltantes
    if (!artwork.token_id && token.tokenId) {
      fieldsAnalysis.missingContractAddress++
    }

    // Adicionar mais verificações conforme necessário
  }

  console.log('\n📈 Análise de dados faltantes:')
  console.log(
    `❌ Tokens não encontrados no Supabase: ${fieldsAnalysis.tokensNotFoundInSupabase}`
  )

  if (missingTokens.length > 0) {
    console.log('\n🔍 Tokens não encontrados no Supabase:')
    missingTokens.slice(0, 10).forEach((token) => {
      console.log(`  - "${token.name}" (${token.contract}:${token.tokenId})`)
    })
    if (missingTokens.length > 10) {
      console.log(`  ... e mais ${missingTokens.length - 10} tokens`)
    }
  }

  return fieldsAnalysis
}

/**
 * Executa a análise completa
 */
async function analyzeData() {
  try {
    console.log('🔍 Iniciando análise de dados faltantes...\n')

    // 1. Ler dados legacy
    const legacyTokens = readLegacyData()

    // 2. Analisar estrutura legacy
    const legacyStats = analyzeLegacyFields(legacyTokens)
    console.log('\n📊 Estatísticas dos dados legacy:')
    console.log(`- Total de tokens: ${legacyStats.totalTokens}`)
    console.log(`- Tokens com animação: ${legacyStats.tokensWithAnimation}`)
    console.log(`- Tokens com atributos: ${legacyStats.tokensWithAttributes}`)
    console.log(`- Tokens com tags: ${legacyStats.tokensWithTags}`)
    console.log(
      `- Contratos únicos: ${legacyStats.uniqueContractAddresses.length}`
    )
    console.log(`- Coleções únicas: ${legacyStats.uniqueCollections.length}`)

    // 3. Verificar dados faltantes no Supabase
    await checkMissingDataInSupabase(legacyTokens)

    console.log('\n✅ Análise concluída!')
  } catch (error) {
    console.error('❌ Erro durante a análise:', error.message)
    process.exit(1)
  }
}

// Executar análise
analyzeData()

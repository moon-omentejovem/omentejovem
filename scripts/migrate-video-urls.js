/**
 * Script para migrar video URLs dos dados legacy para o Supabase
 *
 * Este script:
 * 1. Lê o token-metadata.json
 * 2. Extrai os animation_url dos NFTs
 * 3. Atualiza o campo video_url na tabela artworks
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
 * Lê os dados legacy do token-metadata.json
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
 * Migra os video URLs para o Supabase
 */
async function migrateVideoUrls() {
  console.log('🎬 Iniciando migração dos video URLs...\n')

  try {
    // 1. Ler dados legacy
    const legacyTokens = readLegacyData()
    console.log(`📁 Lidos ${legacyTokens.length} tokens do arquivo legacy`)

    // 2. Filtrar tokens que têm animation_url
    const tokensWithVideo = legacyTokens.filter(
      (token) => token.raw?.metadata?.animation_url
    )
    console.log(
      `🎥 Encontrados ${tokensWithVideo.length} tokens com animation_url`
    )

    if (tokensWithVideo.length === 0) {
      console.log(
        'ℹ️  Nenhum token com animation_url encontrado. Migração concluída.'
      )
      return
    }

    // 3. Buscar artworks existentes no Supabase
    const { data: artworks, error: fetchError } = await supabase
      .from('artworks')
      .select('id, slug, title, video_url')

    if (fetchError) {
      throw new Error(`❌ Erro ao buscar artworks: ${fetchError.message}`)
    }

    console.log(`🎨 Encontrados ${artworks.length} artworks no Supabase`)

    // 4. Mapear tokens para artworks e atualizar
    let updated = 0
    let skipped = 0
    let errors = 0

    for (const token of tokensWithVideo) {
      const tokenName = token.raw.metadata.name
      const animationUrl = token.raw.metadata.animation_url

      // Encontrar artwork correspondente pelo title
      const artwork = artworks.find(
        (a) => a.title.toLowerCase() === tokenName.toLowerCase()
      )

      if (!artwork) {
        console.log(`⚠️  Artwork não encontrado para: "${tokenName}"`)
        skipped++
        continue
      }

      // Se já tem video_url, pular
      if (artwork.video_url) {
        console.log(`⏭️  Artwork ${artwork.slug} já tem video_url`)
        skipped++
        continue
      }

      // Atualizar o video_url
      console.log(
        `🔄 Atualizando ${artwork.slug} com video_url: ${animationUrl}`
      )

      const { error: updateError } = await supabase
        .from('artworks')
        .update({ video_url: animationUrl })
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

    // 5. Relatório final
    console.log('\n📊 Relatório da migração:')
    console.log(`✅ Atualizados: ${updated}`)
    console.log(`⏭️  Ignorados: ${skipped}`)
    console.log(`❌ Erros: ${errors}`)
    console.log('\n🎉 Migração de video URLs concluída!')
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message)
    process.exit(1)
  }
}

// Executar migração
migrateVideoUrls()

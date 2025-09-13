/**
 * Script para popular o campo raw_image_url nas artworks existentes
 *
 * Este script:
 * 1. Busca todas as artworks que têm image_url mas não têm raw_image_url
 * 2. Extrai o filename da image_url atual
 * 3. Gera a raw_image_url usando a pasta 'raw' do bucket
 * 4. Atualiza os registros no banco
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Extrai filename da URL atual
 */
function extractFilenameFromUrl(url) {
  if (!url) return null

  const urlParts = url.split('/')
  const filename = urlParts[urlParts.length - 1]

  // Remover query parameters se existirem
  return filename.split('?')[0]
}

/**
 * Gera URL para pasta raw do bucket
 */
function generateRawImageUrl(filename) {
  if (!filename) return null

  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(`raw/${filename}`)

  return data.publicUrl
}

/**
 * Processa uma artwork para adicionar raw_image_url
 */
async function processArtwork(artwork) {
  const { id, image_url, title } = artwork

  if (!image_url) {
    console.warn(`⚠️  Artwork "${title}" (ID: ${id}) não tem image_url`)
    return false
  }

  const filename = extractFilenameFromUrl(image_url)
  if (!filename) {
    console.warn(`⚠️  Não foi possível extrair filename da URL: ${image_url}`)
    return false
  }

  const rawImageUrl = generateRawImageUrl(filename)

  // Atualizar no banco
  const { error } = await supabase
    .from('artworks')
    .update({ raw_image_url: rawImageUrl })
    .eq('id', id)

  if (error) {
    console.error(
      `❌ Erro ao atualizar artwork "${title}" (ID: ${id}):`,
      error.message
    )
    return false
  }

  console.log(`✅ Atualizada artwork "${title}" (ID: ${id})`)
  console.log(`   Optimized: ${image_url}`)
  console.log(`   Raw: ${rawImageUrl}`)
  return true
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando população do campo raw_image_url...\n')

  try {
    // Buscar artworks que precisam ser atualizadas
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, image_url, raw_image_url')
      .is('raw_image_url', null)
      .not('image_url', 'is', null)

    if (error) {
      throw error
    }

    if (!artworks || artworks.length === 0) {
      console.log('✅ Todas as artworks já possuem raw_image_url configurada!')
      return
    }

    console.log(`📊 Encontradas ${artworks.length} artworks para processar\n`)

    let successCount = 0
    let errorCount = 0

    // Processar cada artwork
    for (const artwork of artworks) {
      const success = await processArtwork(artwork)
      if (success) {
        successCount++
      } else {
        errorCount++
      }

      // Pausa pequena para não sobrecarregar
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log('\n📊 Resumo da execução:')
    console.log(`✅ Sucessos: ${successCount}`)
    console.log(`❌ Erros: ${errorCount}`)
    console.log(`📊 Total processado: ${successCount + errorCount}`)

    if (successCount > 0) {
      console.log(
        '\n🎉 População do campo raw_image_url concluída com sucesso!'
      )
    }
  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message)
    process.exit(1)
  }
}

// Executar script
main()

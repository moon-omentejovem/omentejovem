/**
 * Script para verificar e corrigir URLs de raw_image_url
 *
 * Este script:
 * 1. Verifica se as raw_image_url existem (não retornam 404)
 * 2. Lista arquivos disponíveis na pasta raw/ do bucket
 * 3. Tenta fazer match por nome do arquivo (ignorando hash/timestamp)
 * 4. Atualiza URLs corretas ou limpa URLs inválidas
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
 * Verifica se uma URL retorna 404
 */
async function checkUrlExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    console.warn(`⚠️ Erro ao verificar URL ${url}:`, error.message)
    return false
  }
}

/**
 * Lista todos os arquivos na pasta artworks/raw do bucket
 */
async function listRawFiles() {
  try {
    const { data, error } = await supabase.storage
      .from('media')
      .list('artworks/raw', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error) {
      throw error
    }

    return data?.map((file) => file.name) || []
  } catch (error) {
    console.error('❌ Erro ao listar arquivos raw:', error.message)
    return []
  }
}

/**
 * Gera URL pública para arquivo na pasta artworks/raw
 */
function generateRawUrl(filename) {
  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(`artworks/raw/${filename}`)

  return data.publicUrl
}

/**
 * Extrai nome do arquivo sem hash/timestamp
 * Exemplo: "1757641546911-10_He_Left_as_a_Dot.webp" -> "he_left_as_a_dot"
 */
function extractCleanName(filename) {
  if (!filename) return ''

  // Remove extensão
  const nameWithoutExt = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '')

  // Remove hash/timestamp do início (padrão: números-nome)
  const cleanName = nameWithoutExt.replace(/^\d+-/, '').toLowerCase()

  return cleanName
}

/**
 * Encontra arquivo correspondente na pasta raw baseado no nome
 */
function findMatchingRawFile(artworkTitle, optimizedUrl, rawFiles) {
  const cleanTitle = artworkTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  // Tentar match direto pelo título
  let match = rawFiles.find((file) => {
    const cleanFileName = extractCleanName(file)
    return (
      cleanFileName.includes(cleanTitle) || cleanTitle.includes(cleanFileName)
    )
  })

  if (match) return match

  // Tentar extrair nome da URL otimizada
  if (optimizedUrl) {
    const urlParts = optimizedUrl.split('/')
    const optimizedFilename = urlParts[urlParts.length - 1]
    const cleanOptimizedName = extractCleanName(optimizedFilename)

    match = rawFiles.find((file) => {
      const cleanFileName = extractCleanName(file)
      return (
        cleanFileName === cleanOptimizedName ||
        cleanFileName.includes(cleanOptimizedName) ||
        cleanOptimizedName.includes(cleanFileName)
      )
    })
  }

  return match
}

/**
 * Processa uma artwork para corrigir raw_image_url
 */
async function processArtwork(artwork, rawFiles) {
  const { id, title, image_url, raw_image_url } = artwork

  console.log(`\n🔍 Processando: "${title}" (ID: ${id})`)
  console.log(`   Image URL: ${image_url}`)
  console.log(`   Raw URL atual: ${raw_image_url || 'null'}`)

  // Se não tem raw_image_url, tentar encontrar
  if (!raw_image_url) {
    console.log('   ⚠️ Sem raw_image_url definida')

    const matchingFile = findMatchingRawFile(title, image_url, rawFiles)
    if (matchingFile) {
      const newRawUrl = generateRawUrl(matchingFile)

      const { error } = await supabase
        .from('artworks')
        .update({ raw_image_url: newRawUrl })
        .eq('id', id)

      if (error) {
        console.log(`   ❌ Erro ao atualizar: ${error.message}`)
        return { status: 'error', action: 'update_failed' }
      }

      console.log(`   ✅ Adicionada raw_image_url: ${newRawUrl}`)
      return { status: 'success', action: 'added', newUrl: newRawUrl }
    } else {
      console.log('   ⚠️ Nenhum arquivo raw encontrado para match')
      return { status: 'warning', action: 'no_match' }
    }
  }

  // Verificar se raw_image_url atual existe
  const exists = await checkUrlExists(raw_image_url)

  if (exists) {
    console.log('   ✅ Raw URL existe e está acessível')
    return { status: 'success', action: 'valid' }
  }

  console.log('   ❌ Raw URL retorna 404')

  // Tentar encontrar arquivo correto
  const matchingFile = findMatchingRawFile(title, image_url, rawFiles)

  if (matchingFile) {
    const newRawUrl = generateRawUrl(matchingFile)

    // Verificar se a nova URL existe
    const newExists = await checkUrlExists(newRawUrl)

    if (newExists) {
      const { error } = await supabase
        .from('artworks')
        .update({ raw_image_url: newRawUrl })
        .eq('id', id)

      if (error) {
        console.log(`   ❌ Erro ao atualizar: ${error.message}`)
        return { status: 'error', action: 'update_failed' }
      }

      console.log(`   ✅ Corrigida raw_image_url: ${newRawUrl}`)
      return { status: 'success', action: 'corrected', newUrl: newRawUrl }
    } else {
      console.log(
        `   ⚠️ Arquivo encontrado mas também retorna 404: ${newRawUrl}`
      )
    }
  }

  // Se chegou aqui, não conseguiu encontrar arquivo válido - limpar URL
  const { error } = await supabase
    .from('artworks')
    .update({ raw_image_url: null })
    .eq('id', id)

  if (error) {
    console.log(`   ❌ Erro ao limpar URL: ${error.message}`)
    return { status: 'error', action: 'clear_failed' }
  }

  console.log('   🧹 Raw URL removida (arquivo não encontrado)')
  return { status: 'success', action: 'cleared' }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando verificação e correção de raw_image_url...\n')

  try {
    // Listar arquivos disponíveis na pasta artworks/raw
    console.log('📂 Listando arquivos na pasta artworks/raw...')
    const rawFiles = await listRawFiles()
    console.log(
      `📊 Encontrados ${rawFiles.length} arquivos na pasta artworks/raw\n`
    )

    if (rawFiles.length === 0) {
      console.error(
        '❌ Nenhum arquivo encontrado na pasta artworks/raw do bucket!'
      )
      return
    }

    // Buscar todas as artworks
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, image_url, raw_image_url')
      .order('title')

    if (error) {
      throw error
    }

    console.log(`📊 Processando ${artworks.length} artworks...\n`)

    const stats = {
      valid: 0,
      corrected: 0,
      added: 0,
      cleared: 0,
      errors: 0,
      warnings: 0
    }

    // Processar cada artwork
    for (let i = 0; i < artworks.length; i++) {
      const artwork = artworks[i]
      const result = await processArtwork(artwork, rawFiles)

      stats[result.action] = (stats[result.action] || 0) + 1
      if (result.status === 'error') stats.errors++
      if (result.status === 'warning') stats.warnings++

      // Pausa para não sobrecarregar
      if (i % 10 === 0 && i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log('\n📊 Resumo da execução:')
    console.log(`✅ URLs válidas: ${stats.valid || 0}`)
    console.log(`🔧 URLs corrigidas: ${stats.corrected || 0}`)
    console.log(`➕ URLs adicionadas: ${stats.added || 0}`)
    console.log(`🧹 URLs removidas: ${stats.cleared || 0}`)
    console.log(`⚠️ Sem match: ${stats.no_match || 0}`)
    console.log(`❌ Erros: ${stats.errors}`)

    console.log('\n🎉 Verificação e correção concluída!')
  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message)
    process.exit(1)
  }
}

// Executar script
main()

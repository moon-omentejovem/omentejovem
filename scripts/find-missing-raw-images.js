/**
 * Script para buscar e corrigir raw images faltantes
 *
 * Este script busca no bucket do Supabase por raw images que podem estar faltando
 * nos registros do banco de dados, usando diferentes estratégias de matching.
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Carregar env vars
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Lista todos os arquivos em uma pasta do bucket
 */
async function listBucketFiles(path) {
  try {
    const { data, error } = await supabase.storage.from('media').list(path, {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' }
    })

    if (error) {
      console.error(`Error listing files in ${path}:`, error)
      return []
    }

    return data || []
  } catch (error) {
    console.error(`Failed to list files in ${path}:`, error)
    return []
  }
}

/**
 * Normaliza um nome para comparação (remove caracteres especiais, espaços, etc.)
 */
function normalizeForComparison(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove tudo que não é letra ou número
    .trim()
}

/**
 * Extrai informações úteis do nome do arquivo para matching
 */
function extractFileInfo(filename) {
  // Remove extensão
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')

  // Remove timestamp se presente (formato: 1234567890123-nome)
  const withoutTimestamp = nameWithoutExt.replace(/^\d{13}-/, '')

  return {
    original: filename,
    nameWithoutExt,
    withoutTimestamp,
    normalized: normalizeForComparison(withoutTimestamp)
  }
}

/**
 * Tenta fazer match entre um artwork e um arquivo do bucket
 */
function tryMatchArtworkToFile(artwork, fileInfo) {
  const artworkSlugNormalized = normalizeForComparison(artwork.slug)
  const artworkTitleNormalized = normalizeForComparison(artwork.title)

  // Estratégia 1: Match exato pela slug
  if (fileInfo.normalized === artworkSlugNormalized) {
    return { strategy: 'slug-exact', confidence: 100 }
  }

  // Estratégia 2: Match exato pelo título
  if (fileInfo.normalized === artworkTitleNormalized) {
    return { strategy: 'title-exact', confidence: 95 }
  }

  // Estratégia 3: Slug contém o nome do arquivo
  if (artworkSlugNormalized.includes(fileInfo.normalized)) {
    return { strategy: 'slug-contains', confidence: 80 }
  }

  // Estratégia 4: Nome do arquivo contém a slug
  if (fileInfo.normalized.includes(artworkSlugNormalized)) {
    return { strategy: 'file-contains-slug', confidence: 75 }
  }

  // Estratégia 5: Título contém o nome do arquivo
  if (artworkTitleNormalized.includes(fileInfo.normalized)) {
    return { strategy: 'title-contains', confidence: 70 }
  }

  // Estratégia 6: Nome do arquivo contém o título
  if (fileInfo.normalized.includes(artworkTitleNormalized)) {
    return { strategy: 'file-contains-title', confidence: 65 }
  }

  return null
}

/**
 * Busca raw images faltantes e tenta corrigi-las
 */
async function findAndFixMissingRawImages() {
  console.log('🔍 Searching for missing raw images...')

  try {
    // 1. Buscar artworks sem raw_image_url
    console.log('📊 Fetching artworks with missing raw_image_url...')
    const { data: artworks, error: fetchError } = await supabase
      .from('artworks')
      .select(
        'id, title, slug, image_url, raw_image_url, image_path, raw_image_path'
      )
      .or('raw_image_url.is.null,raw_image_url.eq.')

    if (fetchError) {
      throw fetchError
    }

    if (!artworks?.length) {
      console.log('✅ No artworks with missing raw_image_url found')
      return
    }

    console.log(
      `📊 Found ${artworks.length} artworks with missing raw_image_url`
    )

    // 2. Listar arquivos nas pastas raw
    console.log('📂 Listing files in bucket raw folders...')
    const rawFiles = await listBucketFiles('artworks/raw')

    if (!rawFiles.length) {
      console.log('❌ No files found in artworks/raw folder')
      return
    }

    console.log(`📂 Found ${rawFiles.length} files in raw folder`)

    // 3. Processar arquivos e extrair informações
    const fileInfos = rawFiles
      .filter((file) => file.name && !file.name.endsWith('/')) // Filtrar apenas arquivos
      .map((file) => ({
        file,
        info: extractFileInfo(file.name),
        path: `artworks/raw/${file.name}`
      }))

    console.log(`📋 Processing ${fileInfos.length} raw files for matching...`)

    // 4. Tentar fazer match para cada artwork
    let foundMatches = 0
    let updatedArtworks = 0

    for (const artwork of artworks) {
      console.log(`\n🎨 Processing artwork: ${artwork.title} (${artwork.slug})`)

      let bestMatch = null
      let bestConfidence = 0

      // Tentar match com cada arquivo
      for (const fileInfo of fileInfos) {
        const match = tryMatchArtworkToFile(artwork, fileInfo.info)

        if (match && match.confidence > bestConfidence) {
          bestMatch = { ...match, fileInfo }
          bestConfidence = match.confidence
        }
      }

      if (bestMatch && bestConfidence >= 65) {
        // Confiança mínima de 65%
        foundMatches++
        console.log(`✅ Found match: ${bestMatch.fileInfo.file.name}`)
        console.log(
          `   Strategy: ${bestMatch.strategy}, Confidence: ${bestConfidence}%`
        )

        // Gerar URL pública para o arquivo
        const { data } = supabase.storage
          .from('media')
          .getPublicUrl(bestMatch.fileInfo.path)

        // Atualizar o artwork no banco
        const updates = {
          raw_image_url: data.publicUrl,
          raw_image_path: bestMatch.fileInfo.path
        }

        const { error: updateError } = await supabase
          .from('artworks')
          .update(updates)
          .eq('id', artwork.id)

        if (updateError) {
          console.error(
            `❌ Failed to update artwork ${artwork.id}:`,
            updateError
          )
        } else {
          updatedArtworks++
          console.log('✅ Updated artwork with raw image URL and path')
        }
      } else {
        console.log(`❌ No suitable match found for "${artwork.title}"`)
        if (bestMatch) {
          console.log(
            `   Best candidate: ${bestMatch.fileInfo.file.name} (${bestConfidence}% confidence)`
          )
        }
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   Artworks processed: ${artworks.length}`)
    console.log(`   Matches found: ${foundMatches}`)
    console.log(`   Artworks updated: ${updatedArtworks}`)
    console.log(`   Files in raw folder: ${rawFiles.length}`)
  } catch (error) {
    console.error('❌ Failed to find missing raw images:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  findAndFixMissingRawImages().catch(console.error)
}

module.exports = { findAndFixMissingRawImages }

/**
 * Script para verificar e corrigir consistência dos dados de imagem
 *
 * Verifica se image_url e raw_image_url estão corretos e aponta para arquivos
 * que realmente existem no bucket, usando a slug para fazer matching
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Carregar env vars
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Verifica se uma URL/path é válida e existe no bucket
 */
async function checkFileExists(url) {
  if (!url) return false

  try {
    // Extrair path da URL se for URL
    let path = url
    if (url.startsWith('http')) {
      const pathMatch = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/)
      if (!pathMatch) return false
      path = pathMatch[1]
    }

    // Verificar se o arquivo existe
    const { data, error } = await supabase.storage.from('media').download(path)

    return !error && data
  } catch {
    return false
  }
}

/**
 * Busca arquivos no bucket que correspondem à slug
 */
async function findMatchingFiles(slug) {
  const results = {
    optimizedFiles: [],
    rawFiles: []
  }

  try {
    // Buscar em artworks/optimized/
    const { data: optimizedFiles, error: optError } = await supabase.storage
      .from('media')
      .list('artworks/optimized/', { limit: 1000 })

    if (!optError && optimizedFiles) {
      results.optimizedFiles = optimizedFiles.filter(
        (file) =>
          file.name.toLowerCase().includes(slug.toLowerCase()) ||
          slug.toLowerCase().includes(
            file.name
              .split('-')
              .slice(1)
              .join('-')
              .replace(/\.(webp|jpg|png)$/i, '')
          )
      )
    }

    // Buscar em artworks/raw/
    const { data: rawFiles, error: rawError } = await supabase.storage
      .from('media')
      .list('artworks/raw/', { limit: 1000 })

    if (!rawError && rawFiles) {
      results.rawFiles = rawFiles.filter(
        (file) =>
          file.name.toLowerCase().includes(slug.toLowerCase()) ||
          slug.toLowerCase().includes(
            file.name
              .split('-')
              .slice(1)
              .join('-')
              .replace(/\.(jpg|png|jpeg)$/i, '')
          )
      )
    }
  } catch (error) {
    console.error(`Erro ao buscar arquivos para slug ${slug}:`, error)
  }

  return results
}

/**
 * Verifica e corrige um artwork específico
 */
async function checkAndFixArtwork(artwork) {
  console.log(`\n🔍 Verificando artwork: ${artwork.title} (${artwork.slug})`)

  const issues = []
  const fixes = {}

  // Verificar image_url
  if (!artwork.image_url) {
    issues.push('❌ image_url está vazio')
  } else {
    const imageExists = await checkFileExists(artwork.image_url)
    if (!imageExists) {
      issues.push(`❌ image_url não existe: ${artwork.image_url}`)

      // Tentar encontrar arquivo correto
      const matchingFiles = await findMatchingFiles(artwork.slug)
      if (matchingFiles.optimizedFiles.length > 0) {
        const bestMatch = matchingFiles.optimizedFiles[0]
        const correctUrl = `https://${supabaseUrl.split('//')[1]}/storage/v1/object/public/media/artworks/optimized/${bestMatch.name}`
        fixes.image_url = correctUrl
        console.log(`✅ Encontrado arquivo correto: ${bestMatch.name}`)
      }
    } else {
      console.log('✅ image_url válido')
    }
  }

  // Verificar raw_image_url
  if (!artwork.raw_image_url) {
    issues.push('❌ raw_image_url está vazio')
  } else {
    const rawExists = await checkFileExists(artwork.raw_image_url)
    if (!rawExists) {
      issues.push(`❌ raw_image_url não existe: ${artwork.raw_image_url}`)

      // Tentar encontrar arquivo correto
      const matchingFiles = await findMatchingFiles(artwork.slug)
      if (matchingFiles.rawFiles.length > 0) {
        const bestMatch = matchingFiles.rawFiles[0]
        const correctUrl = `https://${supabaseUrl.split('//')[1]}/storage/v1/object/public/media/artworks/raw/${bestMatch.name}`
        fixes.raw_image_url = correctUrl
        console.log(`✅ Encontrado arquivo correto: ${bestMatch.name}`)
      }
    } else {
      console.log('✅ raw_image_url válido')
    }
  }

  return { issues, fixes }
}

/**
 * Aplica correções no banco de dados
 */
async function applyFixes(artworkId, fixes) {
  if (Object.keys(fixes).length === 0) return true

  console.log(`🔧 Aplicando correções para artwork ${artworkId}:`, fixes)

  const { error } = await supabase
    .from('artworks')
    .update(fixes)
    .eq('id', artworkId)

  if (error) {
    console.error('❌ Erro ao aplicar correções:', error)
    return false
  }

  console.log('✅ Correções aplicadas com sucesso')
  return true
}

/**
 * Script principal
 */
async function main() {
  console.log('🔍 Iniciando verificação de consistência dos dados de imagem...')

  try {
    // Buscar todos os artworks
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, slug, image_url, raw_image_url')
      .order('title')

    if (error) {
      throw error
    }

    console.log(`📊 Verificando ${artworks.length} artworks...`)

    let totalIssues = 0
    let totalFixed = 0

    for (const artwork of artworks) {
      const { issues, fixes } = await checkAndFixArtwork(artwork)

      if (issues.length > 0) {
        totalIssues += issues.length
        console.log(`📋 Problemas encontrados (${issues.length}):`)
        issues.forEach((issue) => console.log(`   ${issue}`))

        // Aplicar correções se houver
        if (Object.keys(fixes).length > 0) {
          const success = await applyFixes(artwork.id, fixes)
          if (success) {
            totalFixed += Object.keys(fixes).length
          }
        }
      } else {
        console.log('✅ Nenhum problema encontrado')
      }
    }

    console.log('\n📊 Resumo da verificação:')
    console.log(`   Total de problemas encontrados: ${totalIssues}`)
    console.log(`   Total de correções aplicadas: ${totalFixed}`)

    if (totalIssues === 0) {
      console.log('🎉 Todos os dados estão consistentes!')
    } else if (totalFixed > 0) {
      console.log(
        '🔧 Algumas correções foram aplicadas. Execute o script novamente para verificar.'
      )
    } else {
      console.log('⚠️  Problemas encontrados que precisam de atenção manual.')
    }
  } catch (error) {
    console.error('❌ Erro durante verificação:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main }

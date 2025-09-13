/**
 * Script de Verificação e Correção de Consistência de Dados
 * 
 * Este script verifica se os campos image_url e raw_image_url contêm URLs válidas
 * e corrige qualquer inconsistência buscando no bucket do Supabase Storage
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
 * Verifica se uma string é uma URL válida
 */
function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

/**
 * Gera URL pública a partir de um path
 */
function generatePublicUrl(path) {
  if (!path) return null
  
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}

/**
 * Lista arquivos no bucket para uma slug específica
 */
async function findFilesForSlug(slug) {
  try {
    // Buscar em artworks/optimized
    const { data: optimizedFiles, error: optError } = await supabase.storage
      .from('media')
      .list('artworks/optimized', {
        search: slug
      })
    
    // Buscar em artworks/raw
    const { data: rawFiles, error: rawError } = await supabase.storage
      .from('media')
      .list('artworks/raw', {
        search: slug
      })
    
    if (optError || rawError) {
      console.warn(`❌ Error listing files for slug ${slug}:`, optError || rawError)
      return { optimizedFiles: [], rawFiles: [] }
    }
    
    return {
      optimizedFiles: optimizedFiles || [],
      rawFiles: rawFiles || []
    }
  } catch (error) {
    console.warn(`❌ Error searching files for slug ${slug}:`, error)
    return { optimizedFiles: [], rawFiles: [] }
  }
}

/**
 * Encontra o melhor arquivo para uma slug
 */
function findBestFile(files, slug, type) {
  if (!files || files.length === 0) return null
  
  // Primeiro, tentar encontrar arquivo que contenha a slug exata
  let bestFile = files.find(file => 
    file.name.toLowerCase().includes(slug.toLowerCase())
  )
  
  // Se não encontrar, pegar o primeiro arquivo disponível
  if (!bestFile && files.length > 0) {
    bestFile = files[0]
  }
  
  return bestFile
}

/**
 * Verifica e corrige dados de um artwork
 */
async function verifyAndFixArtwork(artwork) {
  console.log(`\n🔍 Verificando artwork: ${artwork.slug} (${artwork.id})`)
  
  let needsUpdate = false
  const updates = {}
  
  // Verificar image_url
  if (artwork.image_url) {
    if (!isValidUrl(artwork.image_url)) {
      console.log(`  ⚠️  image_url não é uma URL válida: ${artwork.image_url}`)
      needsUpdate = true
      
      // Tentar encontrar arquivo correto
      const { optimizedFiles } = await findFilesForSlug(artwork.slug)
      const bestFile = findBestFile(optimizedFiles, artwork.slug, 'optimized')
      
      if (bestFile) {
        const correctPath = `artworks/optimized/${bestFile.name}`
        const correctUrl = generatePublicUrl(correctPath)
        updates.image_url = correctUrl
        console.log(`  ✅ Encontrado arquivo otimizado: ${bestFile.name}`)
        console.log(`  📝 Nova URL: ${correctUrl}`)
      } else {
        console.log(`  ❌ Nenhum arquivo otimizado encontrado para slug: ${artwork.slug}`)
      }
    } else {
      console.log(`  ✅ image_url é uma URL válida`)
    }
  } else {
    console.log(`  ⚠️  image_url está vazio`)
  }
  
  // Verificar raw_image_url
  if (artwork.raw_image_url) {
    if (!isValidUrl(artwork.raw_image_url)) {
      console.log(`  ⚠️  raw_image_url não é uma URL válida: ${artwork.raw_image_url}`)
      needsUpdate = true
      
      // Tentar encontrar arquivo correto
      const { rawFiles } = await findFilesForSlug(artwork.slug)
      const bestFile = findBestFile(rawFiles, artwork.slug, 'raw')
      
      if (bestFile) {
        const correctPath = `artworks/raw/${bestFile.name}`
        const correctUrl = generatePublicUrl(correctPath)
        updates.raw_image_url = correctUrl
        console.log(`  ✅ Encontrado arquivo raw: ${bestFile.name}`)
        console.log(`  📝 Nova URL: ${correctUrl}`)
      } else {
        console.log(`  ❌ Nenhum arquivo raw encontrado para slug: ${artwork.slug}`)
      }
    } else {
      console.log(`  ✅ raw_image_url é uma URL válida`)
    }
  } else {
    console.log(`  ⚠️  raw_image_url está vazio`)
  }
  
  // Aplicar atualizações se necessário
  if (needsUpdate && Object.keys(updates).length > 0) {
    try {
      const { error } = await supabase
        .from('artworks')
        .update(updates)
        .eq('id', artwork.id)
      
      if (error) {
        console.error(`  ❌ Erro ao atualizar artwork ${artwork.id}:`, error)
        return false
      } else {
        console.log(`  ✅ Artwork atualizado com sucesso`)
        return true
      }
    } catch (error) {
      console.error(`  ❌ Erro ao atualizar artwork ${artwork.id}:`, error)
      return false
    }
  } else if (needsUpdate) {
    console.log(`  ⚠️  Necessita correção mas nenhum arquivo foi encontrado`)
    return false
  } else {
    console.log(`  ✅ Artwork já está consistente`)
    return true
  }
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 Iniciando verificação de consistência de dados...')
  
  try {
    // Buscar todos os artworks
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, slug, image_url, raw_image_url')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    if (!artworks || artworks.length === 0) {
      console.log('❌ Nenhum artwork encontrado')
      return
    }
    
    console.log(`📊 Encontrados ${artworks.length} artworks para verificar`)
    
    let successCount = 0
    let errorCount = 0
    let inconsistentCount = 0
    
    for (const artwork of artworks) {
      try {
        const isConsistent = !artwork.image_url || isValidUrl(artwork.image_url)
        const isRawConsistent = !artwork.raw_image_url || isValidUrl(artwork.raw_image_url)
        
        if (!isConsistent || !isRawConsistent) {
          inconsistentCount++
          const success = await verifyAndFixArtwork(artwork)
          if (success) {
            successCount++
          } else {
            errorCount++
          }
        } else {
          console.log(`✅ ${artwork.slug} - Dados consistentes`)
          successCount++
        }
        
        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`❌ Erro ao processar artwork ${artwork.slug}:`, error)
        errorCount++
      }
    }
    
    console.log('\n📊 Relatório Final:')
    console.log(`   Total de artworks: ${artworks.length}`)
    console.log(`   Inconsistentes encontrados: ${inconsistentCount}`)
    console.log(`   Corrigidos com sucesso: ${successCount}`)
    console.log(`   Erros: ${errorCount}`)
    
    if (inconsistentCount === 0) {
      console.log('🎉 Todos os dados estão consistentes!')
    } else {
      console.log('⚠️  Alguns dados foram corrigidos. Execute novamente para verificar.')
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main }

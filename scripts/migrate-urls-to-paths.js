/**
 * Migration Script: Convert URLs to Storage Paths
 *
 * Este script converte as URLs existentes nas colunas de imagem para paths do storage.
 * Deve ser executado APÓS aplicar a migration que renomeia as colunas.
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
 * Extrai path de uma URL do Supabase Storage
 */
function extractPathFromUrl(url) {
  if (!url || typeof url !== 'string') return null

  try {
    // Se já é um path (não começa com http), retorna como está
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url
    }

    // Extrai o path da URL do Supabase Storage
    // Formato: https://PROJECT.supabase.co/storage/v1/object/public/BUCKET/PATH
    const pathMatch = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/)
    if (pathMatch) {
      return pathMatch[1]
    }

    console.warn(
      `❌ Could not extract path from URL: ${url.substring(0, 80)}...`
    )
    return null
  } catch (error) {
    console.warn(`Failed to parse URL: ${url}`, error)
    return null
  }
}

/**
 * Migra URLs para paths na tabela artworks
 */
async function migrateArtworks() {
  console.log('🎨 Migrating artworks table...')

  try {
    // Buscar todos os artworks que ainda têm URLs nos campos antigos
    const { data: artworks, error: fetchError } = await supabase
      .from('artworks')
      .select('id, image_url, raw_image_url, image_path, raw_image_path')

    if (fetchError) {
      throw fetchError
    }

    if (!artworks?.length) {
      console.log('✅ No artworks to migrate')
      return
    }

    console.log(`📊 Found ${artworks.length} artworks to process`)

    let successCount = 0
    let errorCount = 0

    for (const artwork of artworks) {
      try {
        const updates = {}

        // Converter image_url para image_path se o path estiver vazio
        if (artwork.image_url && !artwork.image_path) {
          const imagePath = extractPathFromUrl(artwork.image_url)
          if (imagePath) {
            updates.image_path = imagePath
          }
        }

        // Converter raw_image_url para raw_image_path se o path estiver vazio
        if (artwork.raw_image_url && !artwork.raw_image_path) {
          const rawPath = extractPathFromUrl(artwork.raw_image_url)
          if (rawPath) {
            updates.raw_image_path = rawPath
          }
        } // Atualizar se há mudanças
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('artworks')
            .update(updates)
            .eq('id', artwork.id)

          if (updateError) {
            console.error(
              `❌ Failed to update artwork ${artwork.id}:`,
              updateError
            )
            errorCount++
          } else {
            console.log(`✅ Updated artwork ${artwork.id}`)
            successCount++
          }
        }
      } catch (error) {
        console.error(`❌ Error processing artwork ${artwork.id}:`, error)
        errorCount++
      }
    }

    console.log(
      `🎨 Artworks migration complete: ${successCount} success, ${errorCount} errors`
    )
  } catch (error) {
    console.error('❌ Failed to migrate artworks:', error)
  }
}

/**
 * Migra URLs para paths na tabela artifacts
 */
async function migrateArtifacts() {
  console.log('🏺 Migrating artifacts table...')

  try {
    const { data: artifacts, error: fetchError } = await supabase
      .from('artifacts')
      .select('id, image_path')

    if (fetchError) {
      throw fetchError
    }

    if (!artifacts?.length) {
      console.log('✅ No artifacts to migrate')
      return
    }

    console.log(`📊 Found ${artifacts.length} artifacts to process`)

    let successCount = 0
    let errorCount = 0

    for (const artifact of artifacts) {
      try {
        if (artifact.image_path) {
          const imagePath = extractPathFromUrl(artifact.image_path)

          if (imagePath && imagePath !== artifact.image_path) {
            const { error: updateError } = await supabase
              .from('artifacts')
              .update({ image_path: imagePath })
              .eq('id', artifact.id)

            if (updateError) {
              console.error(
                `❌ Failed to update artifact ${artifact.id}:`,
                updateError
              )
              errorCount++
            } else {
              console.log(`✅ Updated artifact ${artifact.id}`)
              successCount++
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing artifact ${artifact.id}:`, error)
        errorCount++
      }
    }

    console.log(
      `🏺 Artifacts migration complete: ${successCount} success, ${errorCount} errors`
    )
  } catch (error) {
    console.error('❌ Failed to migrate artifacts:', error)
  }
}

/**
 * Migra URLs para paths na tabela series
 */
async function migrateSeries() {
  console.log('📚 Migrating series table...')

  try {
    const { data: series, error: fetchError } = await supabase
      .from('series')
      .select('id, cover_image_path')

    if (fetchError) {
      throw fetchError
    }

    if (!series?.length) {
      console.log('✅ No series to migrate')
      return
    }

    console.log(`📊 Found ${series.length} series to process`)

    let successCount = 0
    let errorCount = 0

    for (const seriesItem of series) {
      try {
        if (seriesItem.cover_image_path) {
          const coverPath = extractPathFromUrl(seriesItem.cover_image_path)

          if (coverPath && coverPath !== seriesItem.cover_image_path) {
            const { error: updateError } = await supabase
              .from('series')
              .update({ cover_image_path: coverPath })
              .eq('id', seriesItem.id)

            if (updateError) {
              console.error(
                `❌ Failed to update series ${seriesItem.id}:`,
                updateError
              )
              errorCount++
            } else {
              console.log(`✅ Updated series ${seriesItem.id}`)
              successCount++
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing series ${seriesItem.id}:`, error)
        errorCount++
      }
    }

    console.log(
      `📚 Series migration complete: ${successCount} success, ${errorCount} errors`
    )
  } catch (error) {
    console.error('❌ Failed to migrate series:', error)
  }
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 Starting URL to Path migration...')
  console.log(
    '⚠️  Make sure you have applied the column rename migration first!'
  )

  await migrateArtworks()
  await migrateArtifacts()
  await migrateSeries()

  console.log('✅ Migration completed!')
  console.log('🔄 Remember to regenerate Supabase types after this migration')
  console.log('📊 You can now apply the final migration to drop old columns')
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { migrateUrlsToPaths: main }

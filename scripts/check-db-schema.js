/**
 * Script para verificar estado atual das colunas de imagem no banco
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

async function checkDatabaseSchema() {
  console.log('🔍 Checking current database schema...')

  try {
    console.log('Connecting to Supabase...')

    // Verificar algumas linhas da tabela artworks para ver quais campos existem
    console.log('Fetching artworks...')
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, image_url, raw_image_url, image_path, raw_image_path')
      .eq('id', 'a1234567-89ab-cdef-0123-456789abcde0') // ID específico que foi atualizado
      .limit(1)

    if (error) {
      console.error('❌ Error fetching artworks:', error.message)
      return
    }

    console.log('📊 Sample artwork data:')
    if (artworks && artworks.length > 0) {
      const artwork = artworks[0]
      console.log({
        id: artwork.id,
        has_image_url: !!artwork.image_url,
        has_raw_image_url: !!artwork.raw_image_url,
        has_image_path: !!artwork.image_path,
        has_raw_image_path: !!artwork.raw_image_path,
        image_url_full: artwork.image_url,
        raw_image_url_full: artwork.raw_image_url,
        image_path_sample: artwork.image_path,
        raw_image_path_sample: artwork.raw_image_path
      })
    } else {
      console.log('No artworks found')
    }
  } catch (error) {
    console.error('❌ Failed to check database:', error.message)
  }

  console.log('✅ Database check completed')
}

// Executar se chamado diretamente
if (require.main === module) {
  checkDatabaseSchema().catch(console.error)
}

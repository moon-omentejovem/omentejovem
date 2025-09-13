require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function generateUrlsFromPaths() {
  console.log('🔧 Gerando URLs para raw_image_path que existem...')

  // Buscar artworks que têm raw_image_path mas não têm raw_image_url
  const { data: artworks, error: fetchError } = await supabase
    .from('artworks')
    .select('id, title, slug, raw_image_path, raw_image_url')
    .not('raw_image_path', 'is', null)
    .is('raw_image_url', null)

  if (fetchError) {
    console.error('❌ Erro ao buscar artworks:', fetchError)
    return
  }

  console.log(`📊 Encontradas ${artworks.length} artworks com path mas sem URL`)

  let updated = 0

  for (const artwork of artworks) {
    // Gerar URL pública do path
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(artwork.raw_image_path)

    const publicUrl = urlData.publicUrl

    console.log(`🔧 ${artwork.title}`)
    console.log(`   Path: ${artwork.raw_image_path}`)
    console.log(`   Nova URL: ${publicUrl}`)

    // Atualizar apenas o raw_image_url
    const { error: updateError } = await supabase
      .from('artworks')
      .update({ raw_image_url: publicUrl })
      .eq('id', artwork.id)

    if (updateError) {
      console.error(`❌ Erro ao atualizar ${artwork.slug}:`, updateError)
    } else {
      console.log(`✅ URL gerada para ${artwork.slug}`)
      updated++
    }

    console.log('')
  }

  console.log('📊 Resumo:')
  console.log(`   ✅ URLs geradas: ${updated}/${artworks.length}`)
}

generateUrlsFromPaths().catch(console.error)

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkRawImages() {
  const slugsToCheck = [
    'two-voices-one-circle',
    'i-am-where-you-arent',
    'i-had-dreams-about-you',
    'all-time-high-discovery',
    'before-birth',
    'playing-chess-with-love',
    'ground-was-my-teacher',
    'sitting-at-the-edge',
    'mapping-the-unseen'
  ]

  const { data, error } = await supabase
    .from('artworks')
    .select('title, slug, raw_image_url, raw_image_path')
    .in('slug', slugsToCheck)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('📊 Status das raw images que deveriam ter sido atualizadas:')
  console.log('')

  data.forEach((artwork) => {
    console.log(`🎨 ${artwork.title} (${artwork.slug})`)
    console.log(`   raw_image_url: ${artwork.raw_image_url || 'VAZIO'}`)
    console.log(`   raw_image_path: ${artwork.raw_image_path || 'VAZIO'}`)
    console.log('')
  })

  const emptyCount = data.filter((a) => !a.raw_image_url).length
  const filledCount = data.filter((a) => a.raw_image_url).length

  console.log('📊 Resumo:')
  console.log(`   ✅ Com raw_image_url: ${filledCount}`)
  console.log(`   ❌ Sem raw_image_url: ${emptyCount}`)
}

checkRawImages().catch(console.error)

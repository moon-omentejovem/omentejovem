const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkRemaining() {
  const { data } = await supabase
    .from('artworks')
    .select('title, image_url')
    .not('image_url', 'like', '%supabase%')
    .not('image_url', 'like', '/%')
  
  console.log(`Remaining external URLs: ${data?.length || 0}`)
  console.log('')
  
  data?.forEach((artwork, i) => {
    console.log(`${i+1}. ${artwork.title}`)
    console.log(`   URL: ${artwork.image_url}`)
    try {
      const url = new URL(artwork.image_url)
      console.log(`   Domain: ${url.hostname}`)
    } catch (error) {
      console.log(`   Invalid URL: ${error.message}`)
    }
    console.log('')
  })
}

checkRemaining()

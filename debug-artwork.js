require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.log('Missing env vars:', { url: !!url, anonKey: !!anonKey })
  process.exit(1)
}

const supabase = createClient(url, anonKey)

// Buscar alguns artworks para analisar a estrutura dos dados
supabase
  .from('artworks')
  .select('id, title, image_url, raw_image_url, image_path, raw_image_path')
  .limit(5)
  .then(({ data, error }) => {
    if (error) {
      console.log('Error:', error)
    } else {
      console.log('Sample artworks:')
      data.forEach((artwork, index) => {
        console.log(`\n--- Artwork ${index + 1} ---`)
        console.log('ID:', artwork.id)
        console.log('Title:', artwork.title)
        console.log('image_url:', artwork.image_url)
        console.log('raw_image_url:', artwork.raw_image_url)
        console.log('image_path:', artwork.image_path)
        console.log('raw_image_path:', artwork.raw_image_path)
      })
    }
    process.exit(0)
  })

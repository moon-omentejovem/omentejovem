require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.log('Missing env vars')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

// Buscar artwork específico baseado na URL do erro
// A URL do erro parece ser: 1757640948476-the-ground-was-my-teacher.webp
supabase
  .from('artworks')
  .select('*')
  .ilike('image_path', '%the-ground-was-my-teacher%')
  .then(({ data, error }) => {
    if (error) {
      console.log('Error:', error)
    } else {
      console.log('Artwork com problema:')
      data.forEach((artwork) => {
        console.log('\n--- ARTWORK COM PROBLEMA ---')
        Object.keys(artwork).forEach((key) => {
          console.log(`${key}:`, artwork[key])
        })
      })
    }
    process.exit(0)
  })

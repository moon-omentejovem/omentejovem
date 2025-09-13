require('dotenv').config({ path: '.env.local' })

// Simular a função getPublicUrl
function testGetPublicUrl() {
  const { createClient } = require('@supabase/supabase-js')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.log('Missing env vars')
    return
  }

  const supabase = createClient(url, anonKey)

  function getPublicUrl(path) {
    if (!path) return ''

    // Se já é uma URL completa, retornar como está
    if (path.startsWith('http')) {
      console.log('Path is already a URL:', path)
      return path
    }

    // Gerar URL pública do storage
    console.log('Converting path to URL:', path)
    const { data } = supabase.storage.from('media').getPublicUrl(path)
    console.log('Generated URL:', data.publicUrl)
    return data.publicUrl
  }

  const testPath =
    'artworks/optimized/1757640948476-the-ground-was-my-teacher.webp'
  console.log('Testing path:', testPath)

  const result = getPublicUrl(testPath)
  console.log('Final result:', result)

  // Teste com URL completa
  const testUrl =
    'https://vhetqzjpjqcqzxlsonax.supabase.co/storage/v1/object/public/media/artworks/optimized/1757640948476-the-ground-was-my-teacher.webp'
  console.log('\nTesting URL:', testUrl)
  const result2 = getPublicUrl(testUrl)
  console.log('Final result 2:', result2)
}

testGetPublicUrl()

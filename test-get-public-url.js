require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@/utils/supabase/client')

// Teste da função getPublicUrl
async function testGetPublicUrl() {
  try {
    // Importar função usando require direto
    const { getPublicUrl } = require('./src/utils/storage.ts')

    const testPath =
      'artworks/optimized/1757640948476-the-ground-was-my-teacher.webp'
    console.log('Testing path:', testPath)

    const result = getPublicUrl(testPath)
    console.log('Result:', result)

    // Teste com URL completa
    const testUrl =
      'https://vhetqzjpjqcqzxlsonax.supabase.co/storage/v1/object/public/media/artworks/optimized/1757640948476-the-ground-was-my-teacher.webp'
    console.log('\nTesting URL:', testUrl)
    const result2 = getPublicUrl(testUrl)
    console.log('Result:', result2)
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testGetPublicUrl()

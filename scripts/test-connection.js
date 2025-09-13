const {  createClient  } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')
const {  fileURLToPath  } = require('url')



const projectRoot = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(projectRoot, '.env') })

console.log('🔍 Teste rápido de conectividade')
console.log('Environment loaded:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING',
  key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
  try {
    console.log('📊 Testando conexão com Supabase...')
    
    const { data, error, count } = await supabase
      .from('artworks')
      .select('slug, title, token_id, mint_link', { count: 'exact' })
      .limit(5)
    
    if (error) {
      console.error('❌ Erro:', error.message)
      return
    }
    
    console.log(`✅ Conexão OK! Encontrados ${count} artworks total`)
    console.log('📋 Primeiros 5 artworks:')
    data.forEach(artwork => {
      console.log(`   • ${artwork.title} - Token: ${artwork.token_id || 'N/A'} - Link: ${artwork.mint_link ? 'OK' : 'N/A'}`)
    })
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message)
  }
}

testConnection()

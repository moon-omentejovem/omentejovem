import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(projectRoot, '.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 Análise rápida de Token ID')

async function quickAnalysis() {
  try {
    // 1. Contar artworks
    console.log('📊 Contando artworks...')
    const { count } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
    
    console.log(`✅ Total de artworks: ${count}`)
    
    // 2. Verificar artworks sem token_id
    console.log('🔍 Verificando token IDs ausentes...')
    const { data: withoutTokenId, count: countWithout } = await supabase
      .from('artworks')
      .select('slug, title', { count: 'exact' })
      .is('token_id', null)
    
    console.log(`❌ Artworks sem token_id: ${countWithout}`)
    if (countWithout > 0) {
      withoutTokenId.slice(0, 5).forEach(artwork => {
        console.log(`   • ${artwork.title} (${artwork.slug})`)
      })
    }
    
    // 3. Verificar artworks sem mint_link
    console.log('🔗 Verificando mint links ausentes...')
    const { data: withoutMintLink, count: countWithoutLink } = await supabase
      .from('artworks')
      .select('slug, title', { count: 'exact' })
      .is('mint_link', null)
    
    console.log(`❌ Artworks sem mint_link: ${countWithoutLink}`)
    
    // 4. Verificar token-metadata.json
    console.log('📖 Verificando token-metadata.json...')
    const tokenMetadataPath = path.join(projectRoot, 'public', 'token-metadata.json')
    const tokenMetadata = JSON.parse(readFileSync(tokenMetadataPath, 'utf8'))
    
    console.log(`✅ NFTs no metadata: ${tokenMetadata.length}`)
    
    console.log('\n🎯 RESUMO RÁPIDO:')
    console.log(`   Artworks no banco: ${count}`)
    console.log(`   NFTs no metadata: ${tokenMetadata.length}`)
    console.log(`   Sem token_id: ${countWithout}`)
    console.log(`   Sem mint_link: ${countWithoutLink}`)
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

quickAnalysis()

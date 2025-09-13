import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixMissingArtwork() {
  console.log('🔧 Corrigindo artwork "I Am Where You Aren\'t"...\n')

  const { data, error } = await supabase
    .from('artworks')
    .update({
      contract_address: '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7',
      collection_slug: 'stories-on-circles'
    })
    .eq('slug', 'i-am-where-you-arent')
    .select()

  if (error) {
    console.error('❌ Erro ao atualizar:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('✅ Artwork atualizado com sucesso:')
    console.log(`   - Title: ${data[0].title}`)
    console.log(`   - Contract: ${data[0].contract_address}`)
    console.log(`   - Collection: ${data[0].collection_slug}`)
    console.log(`   - Blockchain: ${data[0].blockchain}`)
  } else {
    console.log('⚠️  Nenhum artwork foi atualizado')
  }
}

fixMissingArtwork().catch(console.error)

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import tokenData from '../public/token-metadata.json' with { type: 'json' }

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixExactMatch() {
  console.log('🔧 Copiando título exato do legacy...\n')

  // Encontrar o token no legacy
  const token = tokenData.find(
    (t) =>
      t.tokenId === '8' &&
      t.contract.address === '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7'
  )

  if (!token) {
    console.error('❌ Token não encontrado no legacy')
    return
  }

  console.log('📋 Título original do legacy:', JSON.stringify(token.name))
  console.log(
    '🔤 Caractere especial na posição 19:',
    `'${token.name[19]}' (${token.name[19].charCodeAt(0)})`
  )

  // Atualizar com o título exato do legacy
  const { data, error } = await supabase
    .from('artworks')
    .update({ title: token.name }) // título exato do legacy
    .eq('slug', 'i-am-where-you-arent')
    .select()

  if (error) {
    console.error('❌ Erro ao atualizar:', error)
    return
  }

  console.log('\n✅ Título atualizado com sucesso!')
  console.log('📋 Novo título no Supabase:', JSON.stringify(data[0].title))
  console.log(
    '🔤 Caractere na posição 19:',
    `'${data[0].title[19]}' (${data[0].title[19].charCodeAt(0)})`
  )

  // Verificar se agora a comparação funciona
  console.log('\n🧪 Verificação final:')
  console.log('Exact match:', token.name === data[0].title)
  console.log(
    'Lowercase match:',
    token.name.toLowerCase() === data[0].title.toLowerCase()
  )
}

fixExactMatch().catch(console.error)

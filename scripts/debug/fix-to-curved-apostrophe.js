import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixApostropheToCurved() {
  console.log(
    '🔧 Atualizando título para usar aspas curva (como no legacy)...\n'
  )

  // Atualizar com aspas curva para corresponder ao legacy
  const titleWithCurvedApostrophe = "I Am Where You Aren't" // Esta é a aspas curva do legacy

  const { data, error } = await supabase
    .from('artworks')
    .update({ title: titleWithCurvedApostrophe })
    .eq('slug', 'i-am-where-you-arent')
    .select()

  if (error) {
    console.error('❌ Erro ao atualizar:', error)
    return
  }

  console.log('✅ Título atualizado com aspas curva!')
  console.log('📝 Novo título:', JSON.stringify(data[0].title))
  console.log(
    '🔤 Caractere na posição 19:',
    `'${data[0].title[19]}' (${data[0].title[19].charCodeAt(0)})`
  )

  // Verificar se agora a comparação funciona
  const legacyTitle = "I Am Where You Aren't" // do token-metadata.json
  console.log('\n🔍 Verificação de correspondência:')
  console.log('Legacy title:', JSON.stringify(legacyTitle))
  console.log('Supabase title:', JSON.stringify(data[0].title))
  console.log('Exact match:', legacyTitle === data[0].title)
  console.log(
    'Lowercase match:',
    legacyTitle.toLowerCase() === data[0].title.toLowerCase()
  )
}

fixApostropheToCurved().catch(console.error)

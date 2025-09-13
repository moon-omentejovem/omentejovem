import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixApostrophe() {
  console.log('🔧 Corrigindo aspas curva no título...\n')

  // Primeiro, verificar o título atual
  const { data: current } = await supabase
    .from('artworks')
    .select('title, slug')
    .eq('slug', 'i-am-where-you-arent')
    .single()

  if (current) {
    console.log('📝 Título atual:', JSON.stringify(current.title))
    console.log(
      '🔤 Caracteres:',
      current.title
        .split('')
        .map((c, i) =>
          i === 19
            ? `'${c}' (${c.charCodeAt(0)}) ← ESTE`
            : `'${c}' (${c.charCodeAt(0)})`
        )
    )

    // Atualizar com aspas curva para corresponder ao legacy
    const correctedTitle = "I Am Where You Aren't" // aspas curva

    const { data, error } = await supabase
      .from('artworks')
      .update({ title: correctedTitle })
      .eq('slug', 'i-am-where-you-arent')
      .select()

    if (error) {
      console.error('❌ Erro ao atualizar:', error)
      return
    }

    console.log('\n✅ Título atualizado com sucesso!')
    console.log('📝 Novo título:', JSON.stringify(data[0].title))
    console.log(
      '🔤 Novos caracteres:',
      data[0].title
        .split('')
        .map((c, i) =>
          i === 19
            ? `'${c}' (${c.charCodeAt(0)}) ← CORRIGIDO`
            : `'${c}' (${c.charCodeAt(0)})`
        )
    )
  }
}

fixApostrophe().catch(console.error)

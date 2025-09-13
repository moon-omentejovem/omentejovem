import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import tokenData from '../public/token-metadata.json' with { type: 'json' }

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugComparison() {
  console.log('🔍 Debug da comparação de nomes...\n')

  // Buscar o artwork específico
  const { data: artwork } = await supabase
    .from('artworks')
    .select('title')
    .eq('slug', 'i-am-where-you-arent')
    .single()

  // Encontrar o token correspondente
  const token = tokenData.find(
    (t) =>
      t.tokenId === '8' &&
      t.contract.address === '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7'
  )

  if (artwork && token) {
    console.log('🏗️ Dados encontrados:')
    console.log('Supabase title:', JSON.stringify(artwork.title))
    console.log('Legacy name:', JSON.stringify(token.name))

    console.log('\n🔤 Comparação caractere por caractere:')
    const maxLength = Math.max(artwork.title.length, token.name.length)
    for (let i = 0; i < maxLength; i++) {
      const supabaseChar = artwork.title[i] || 'EOF'
      const legacyChar = token.name[i] || 'EOF'
      const match = supabaseChar === legacyChar ? '✅' : '❌'

      console.log(
        `  [${i.toString().padStart(2)}] ${match} Supabase: '${supabaseChar}' (${supabaseChar.charCodeAt?.(0) || 'N/A'}) | Legacy: '${legacyChar}' (${legacyChar.charCodeAt?.(0) || 'N/A'})`
      )
    }

    console.log('\n🧪 Comparações:')
    console.log('Exact match:', artwork.title === token.name)
    console.log(
      'Lowercase match:',
      artwork.title.toLowerCase() === token.name.toLowerCase()
    )

    // Testar o algoritmo de busca usado no script
    console.log('\n🔍 Teste do algoritmo de busca:')
    const found = tokenData.find(
      (t) => artwork.title.toLowerCase() === t.name.toLowerCase()
    )
    console.log('Found by algorithm:', !!found)
    if (found) {
      console.log('Found token:', found.name)
    }
  }
}

debugComparison().catch(console.error)

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkMissingArtwork() {
  console.log('🔍 Verificando artwork "I Am Where You Aren\'t"...\n')

  // Buscar por diferentes variações do nome
  const queries = [
    "I Am Where You Aren't",
    'I Am Where You Arent',
    'i-am-where-you-arent',
    'i-am-where-you-aren-t',
    'where you aren'
  ]

  for (const query of queries) {
    console.log(`🔎 Buscando por: "${query}"`)

    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .ilike('title', `%${query}%`)

    if (error) {
      console.error('❌ Erro:', error)
      continue
    }

    if (data && data.length > 0) {
      console.log('✅ Encontrado:', data[0])
      return
    }
  }

  console.log('\n📝 Listando todos os artworks que contém "where" no título:')
  const { data: whereArtworks } = await supabase
    .from('artworks')
    .select('title, slug')
    .ilike('title', '%where%')

  if (whereArtworks && whereArtworks.length > 0) {
    whereArtworks.forEach((artwork) => {
      console.log(`   - ${artwork.title} (${artwork.slug})`)
    })
  } else {
    console.log('   Nenhum artwork encontrado com "where"')
  }

  console.log('\n📝 Listando todos os artworks da coleção Stories on Circles:')
  const { data: storiesArtworks } = await supabase
    .from('artworks')
    .select('title, slug, contract_address')
    .eq('contract_address', '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7')

  if (storiesArtworks && storiesArtworks.length > 0) {
    storiesArtworks.forEach((artwork) => {
      console.log(`   - ${artwork.title} (${artwork.slug})`)
    })
  } else {
    console.log('   Nenhum artwork encontrado com esse contrato')
  }
}

checkMissingArtwork().catch(console.error)

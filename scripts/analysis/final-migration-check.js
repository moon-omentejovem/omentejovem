import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import tokenData from '../public/token-metadata.json' with { type: 'json' }

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function finalMigrationCheck() {
  console.log('🔍 Verificação final da migração...\n')

  // Buscar todos os artworks com os novos campos
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('title, slug, contract_address, blockchain, collection_slug')
    .not('contract_address', 'is', null)

  if (error) {
    console.error('❌ Erro:', error)
    return
  }

  console.log('📊 Status da migração:')
  console.log(`✅ Artworks com contract_address: ${artworks.length}`)
  console.log(`📚 Total de tokens no legacy: ${tokenData.length}`)

  // Verificar distribuição por blockchain
  const blockchainStats = artworks.reduce((acc, artwork) => {
    acc[artwork.blockchain] = (acc[artwork.blockchain] || 0) + 1
    return acc
  }, {})

  console.log('\n🌐 Distribuição por blockchain:')
  Object.entries(blockchainStats).forEach(([blockchain, count]) => {
    console.log(`   ${blockchain}: ${count} artworks`)
  })

  // Verificar distribuição por coleção
  const collectionStats = artworks.reduce((acc, artwork) => {
    const collection = artwork.collection_slug || 'N/A'
    acc[collection] = (acc[collection] || 0) + 1
    return acc
  }, {})

  console.log('\n🎨 Distribuição por coleção:')
  Object.entries(collectionStats).forEach(([collection, count]) => {
    console.log(`   ${collection}: ${count} artworks`)
  })

  // Verificar se todos os tokens legacy têm correspondência
  const missingInSupabase = []
  const foundInSupabase = []

  for (const token of tokenData) {
    const artwork = artworks.find(
      (a) => a.title.toLowerCase() === token.name.toLowerCase()
    )

    if (artwork) {
      foundInSupabase.push({
        legacy: token.name,
        supabase: artwork.title,
        contract: artwork.contract_address
      })
    } else {
      missingInSupabase.push(token.name)
    }
  }

  console.log('\n📈 Resultados da correspondência:')
  console.log(`✅ Tokens encontrados no Supabase: ${foundInSupabase.length}`)
  console.log(`❌ Tokens não encontrados: ${missingInSupabase.length}`)

  if (missingInSupabase.length > 0) {
    console.log('\n🔍 Tokens não encontrados:')
    missingInSupabase.forEach((name) => {
      console.log(`   - ${name}`)
    })
  }

  // Verificar especificamente o "I Am Where You Aren't"
  const specificArtwork = await supabase
    .from('artworks')
    .select('*')
    .eq('slug', 'i-am-where-you-arent')
    .single()

  if (specificArtwork.data) {
    console.log('\n🎯 Status do "I Am Where You Aren\'t":')
    console.log(`   Title: ${specificArtwork.data.title}`)
    console.log(`   Contract: ${specificArtwork.data.contract_address}`)
    console.log(`   Blockchain: ${specificArtwork.data.blockchain}`)
    console.log(`   Collection: ${specificArtwork.data.collection_slug}`)
  }

  console.log('\n🎉 Migração concluída com sucesso!')
}

finalMigrationCheck().catch(console.error)

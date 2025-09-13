import tokenData from '../public/token-metadata.json' with { type: 'json' }

// Buscar todos os tokens do contrato Stories on Circles
const storiesTokens = tokenData.filter(
  (token) =>
    token.contract.address === '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7'
)

console.log('📋 Todos os tokens do contrato Stories on Circles:')
console.log('Contract:', '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7')
console.log('Total tokens:', storiesTokens.length)
console.log()

storiesTokens.forEach((token) => {
  console.log(`🎨 Token ID ${token.tokenId}: "${token.name}"`)
})

// Buscar especificamente por "I Am Where You Aren't"
console.log('\n🔍 Procurando por "I Am Where You Aren\'t" em todo o dataset...')

const foundToken = tokenData.find(
  (token) =>
    token.name.toLowerCase().includes('where you aren') ||
    token.name.toLowerCase().includes('i am where')
)

if (foundToken) {
  console.log(
    '✅ Encontrado:',
    foundToken.name,
    'no contrato',
    foundToken.contract.address
  )
} else {
  console.log('❌ Não encontrado no legacy data')
}

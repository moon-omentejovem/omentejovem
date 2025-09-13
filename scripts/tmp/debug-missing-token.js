import tokenData from '../public/token-metadata.json' with { type: 'json' }

// Buscar o token específico
const targetToken = tokenData.find(
  (token) =>
    token.name.includes('Where You Aren') ||
    token.tokenId === '8' ||
    token.contract.address === '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7'
)

if (targetToken) {
  console.log('🎯 Token encontrado no legacy:')
  console.log('Name:', targetToken.name)
  console.log('TokenId:', targetToken.tokenId)
  console.log('Contract:', targetToken.contract.address)
  console.log('Full data:', JSON.stringify(targetToken, null, 2))
} else {
  console.log('❌ Token não encontrado no legacy')

  // Mostrar todos os tokens do contrato Stories on Circles
  const storiesTokens = tokenData.filter(
    (token) =>
      token.contract.address === '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7'
  )

  console.log('\n📋 Todos os tokens do contrato Stories on Circles:')
  storiesTokens.forEach((token) => {
    console.log(`  - ${token.name} (ID: ${token.tokenId})`)
  })
}

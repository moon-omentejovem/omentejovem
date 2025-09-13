import tokenData from '../public/token-metadata.json' with { type: 'json' }

// Encontrar o token específico
const token = tokenData.find(
  (t) =>
    t.tokenId === '8' &&
    t.contract.address === '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7'
)

if (token) {
  console.log('🔍 Análise detalhada do nome:')
  console.log('Legacy name:', JSON.stringify(token.name))
  console.log('Legacy name length:', token.name.length)
  console.log(
    'Characters:',
    token.name.split('').map((c) => `'${c}' (${c.charCodeAt(0)})`)
  )

  // Verificar se há caracteres especiais
  const expectedName = "I Am Where You Aren't"
  console.log('\nExpected name:', JSON.stringify(expectedName))
  console.log('Expected length:', expectedName.length)
  console.log('Names match exactly:', token.name === expectedName)
  console.log(
    'Names match (lowercase):',
    token.name.toLowerCase() === expectedName.toLowerCase()
  )

  // Verificar se há diferenças byte por byte
  if (token.name !== expectedName) {
    console.log('\n🔍 Diferenças encontradas:')
    for (let i = 0; i < Math.max(token.name.length, expectedName.length); i++) {
      const legacyChar = token.name[i] || 'undefined'
      const expectedChar = expectedName[i] || 'undefined'
      if (legacyChar !== expectedChar) {
        console.log(
          `  Position ${i}: legacy='${legacyChar}' (${legacyChar.charCodeAt?.(0) || 'N/A'}) vs expected='${expectedChar}' (${expectedChar.charCodeAt?.(0) || 'N/A'})`
        )
      }
    }
  }
}

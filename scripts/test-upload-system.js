#!/usr/bin/env node

/**
 * Script de Teste do Sistema de Upload
 *
 * Testa o sistema de upload com a nova estrutura de imagens.
 */

// Carregar variáveis de ambiente
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testUpload() {
  console.log('🧪 Testando sistema de upload...')

  try {
    // Criar arquivo de teste
    const testContent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const testFile = new File([testContent], 'test-upload.png', { type: 'image/png' })

    // Testar upload com nova estrutura
    const testId = 'test-upload-' + Date.now()
    const testFilename = 'test-upload.png'

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(`artworks/${testId}/optimized/${testFilename}`, testFile, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError)
      return false
    }

    console.log('✅ Upload funcionando')

    // Testar download
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('media')
      .download(`artworks/${testId}/optimized/${testFilename}`)

    if (downloadError) {
      console.error('❌ Erro no download:', downloadError)
      return false
    }

    console.log('✅ Download funcionando')

    // Limpar arquivo de teste
    await supabase.storage
      .from('media')
      .remove([`artworks/${testId}/optimized/${testFilename}`])

    console.log('✅ Arquivo de teste removido')

    return true

  } catch (error) {
    console.error('❌ Erro durante teste:', error)
    return false
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes do sistema de upload...')

  const success = await testUpload()

  if (success) {
    console.log('\n🎉 Todos os testes passaram! Sistema de upload funcionando.')
  } else {
    console.log('\n⚠️  Alguns testes falharam. Revise o sistema de upload.')
  }

  return success
}

if (require.main === module) {
  runTests()
}

module.exports = { runTests }

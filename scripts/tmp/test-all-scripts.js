#!/usr/bin/env node
/**
 * 🧪 Test All Scripts
 * 
 * Testa todos os scripts principais para verificar se foram
 * convertidos corretamente para CommonJS
 */

const { spawn } = require('child_process')
const path = require('path')

const scripts = [
  'scripts/utils/health-check.js',
  'scripts/analysis/verify-data-consistency.js',
  'scripts/analysis/analyze-token-id-integrity.js',
  'scripts/maintenance/fix-token-id-data.js'
]

async function runScript(scriptPath) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testando: ${scriptPath}`)
    console.log('=' .repeat(50))
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    })
    
    child.on('close', (code) => {
      const status = code === 0 ? '✅ PASSOU' : '❌ FALHOU'
      console.log(`\n${status}: ${scriptPath} (código: ${code})`)
      resolve({ script: scriptPath, success: code === 0, code })
    })
    
    child.on('error', (error) => {
      console.log(`\n❌ ERRO: ${scriptPath} - ${error.message}`)
      resolve({ script: scriptPath, success: false, error: error.message })
    })
  })
}

async function testAllScripts() {
  console.log('🚀 TESTE DE TODOS OS SCRIPTS')
  console.log('============================')
  console.log(`📋 Testando ${scripts.length} scripts...`)
  
  const results = []
  
  for (const script of scripts) {
    const result = await runScript(script)
    results.push(result)
  }
  
  console.log('\n📊 RESUMO DOS TESTES')
  console.log('====================')
  
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(`✅ Passou: ${passed}`)
  console.log(`❌ Falhou: ${failed}`)
  console.log(`📊 Taxa de sucesso: ${((passed / results.length) * 100).toFixed(1)}%`)
  
  if (failed > 0) {
    console.log('\n❌ SCRIPTS COM FALHA:')
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   • ${r.script} (${r.error || `código ${r.code}`})`)
      })
  }
  
  console.log('\n🎯 TESTE CONCLUÍDO!')
  
  return results
}

// Executar automaticamente
if (require.main === module) {
  testAllScripts().catch(console.error)
}

module.exports = { testAllScripts }

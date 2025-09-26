#!/usr/bin/env node

/**
 * 🚀 Deploy Helper
 *
 * Executa validações pós-deploy para garantir que o ambiente está saudável.
 * - Verifica credenciais Supabase
 * - Confirma presença de dados (artworks)
 * - Executa health check completo
 */

const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const { healthCheck } = require('./health-check.js')

dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

function ensureEnv(key) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${key}`)
  }
  return value
}

function validateEnvironment() {
  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Variáveis ausentes: ${missing.join(', ')}`)
  }

  return {
    url: ensureEnv('NEXT_PUBLIC_SUPABASE_URL'),
    serviceRoleKey: ensureEnv('SUPABASE_SERVICE_ROLE_KEY')
  }
}

async function verifyDataPresence(supabase) {
  const { count, error } = await supabase
    .from('artworks')
    .select('id', { count: 'exact', head: true })

  if (error) {
    console.warn('⚠️  Não foi possível verificar artworks:', error.message)
    console.warn(
      '   ➜ Execute manualmente os scripts de exportação/importação se necessário.'
    )
    return false
  }

  if (!count) {
    console.warn('\n⚠️  Nenhum artwork encontrado no Supabase alvo.')
    console.warn('   ➜ Restaure os dados com:')
    console.warn(
      '     node scripts/migration/import-supabase-data.js --input=CAMINHO_DO_BACKUP'
    )
    console.warn(
      '   ➜ Gere um backup do ambiente atual com:'
    )
    console.warn('     node scripts/migration/export-supabase-data.js')
    return false
  }

  console.log(`📊 Banco contém ${count} artworks.`)
  return true
}

async function deployHelper() {
  console.log('🚀 Deploy Helper - Omentejovem')
  console.log('================================\n')

  let credentials
  try {
    credentials = validateEnvironment()
    console.log('✅ Variáveis de ambiente validadas')
  } catch (error) {
    console.error(`❌ ${error.message}`)
    process.exit(1)
  }

  const supabase = createClient(credentials.url, credentials.serviceRoleKey)

  await verifyDataPresence(supabase)

  console.log('\n🏥 Executando health check...')
  const results = await healthCheck()

  if (
    results.connectivity &&
    results.database &&
    results.storage &&
    results.integrity
  ) {
    console.log('\n🎉 Deploy validado! Ambiente pronto para produção.')
  } else {
    console.log('\n⚠️  Health check sinalizou problemas. Revise os logs acima.')
    if (results.issues?.length) {
      console.log('   Problemas encontrados:')
      results.issues.forEach((issue) => console.log(`   • ${issue}`))
    }
  }
}

if (require.main === module) {
  deployHelper().catch((error) => {
    console.error('❌ Erro durante deploy helper:', error)
    process.exit(1)
  })
}

module.exports = { deployHelper, validateEnvironment }

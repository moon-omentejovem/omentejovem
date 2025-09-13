#!/usr/bin/env node
/**
 * 🚀 Deploy Helper
 *
 * Automações para deploy e pós-deploy:
 * - Verifica se migração é necessária
 * - Executa health check após deploy
 * - Valida integridade do sistema
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { healthCheck } from './health-check.js'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function deployHelper() {
  console.log('🚀 Deploy Helper - Omentejovem')
  console.log('===============================\n')

  // 1. Verificar se já está migrado
  console.log('🔍 Verificando status da migração...')

  try {
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id')
      .limit(1)

    if (error) {
      console.log('❌ Banco não acessível - primeira vez?')
      console.log('💡 Execute: node scripts/legacy/migrate-legacy-data.js')
      return
    }

    if (!artworks || artworks.length === 0) {
      console.log('📥 Banco vazio - executando migração automática...')

      // Importar e executar migração
      try {
        const { default: migrateLegacyData } = await import(
          '../legacy/migrate-legacy-data.js'
        )
        await migrateLegacyData()
        console.log('✅ Migração automática concluída!')
      } catch (err) {
        console.error('❌ Erro na migração automática:', err.message)
        console.log(
          '💡 Execute manualmente: node scripts/legacy/migrate-legacy-data.js'
        )
        return
      }
    } else {
      console.log('✅ Dados já migrados')
    }

    // 2. Health Check pós-deploy
    console.log('\n🏥 Executando health check...')
    const healthResults = await healthCheck()

    if (
      healthResults.connectivity &&
      healthResults.database &&
      healthResults.storage &&
      healthResults.integrity
    ) {
      console.log('\n🎉 Deploy validado com sucesso!')
      console.log('🌐 Sistema pronto para produção')
    } else {
      console.log('\n⚠️  Deploy com issues detectadas')
      console.log('🔧 Verifique os logs acima para detalhes')
    }
  } catch (err) {
    console.error('❌ Erro durante deploy helper:', err.message)
  }
}

// 3. Verificar variáveis de ambiente
function validateEnvironment() {
  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ Variáveis de ambiente faltando:')
    missing.forEach((key) => console.error(`   - ${key}`))
    process.exit(1)
  }

  console.log('✅ Variáveis de ambiente OK')
}

async function main() {
  validateEnvironment()
  await deployHelper()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { deployHelper, validateEnvironment }

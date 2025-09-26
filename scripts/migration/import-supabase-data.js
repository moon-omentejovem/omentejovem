#!/usr/bin/env node

/**
 * Importa dados exportados para um novo projeto Supabase.
 *
 * Uso:
 *   node scripts/migration/import-supabase-data.js --input=backups/supabase-export-2025.json \
 *     [--target-url=https://xyz.supabase.co] [--target-key=service_role] [--truncate]
 *
 * Variáveis de ambiente suportadas:
 *   SUPABASE_TARGET_URL (fallback para NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_TARGET_SERVICE_ROLE_KEY (fallback para SUPABASE_SERVICE_ROLE_KEY)
 */

const fs = require('fs/promises')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {}

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.replace(/^--/, '').split('=')
      options[key] = value ?? true
    }
  }

  return options
}

function resolveBoolean(value) {
  if (value === true) return true
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'y'].includes(value.toLowerCase())
  }
  return false
}

const IMPORT_ORDER = [
  { table: 'series', label: 'Series' },
  { table: 'artworks', label: 'Artworks' },
  { table: 'artifacts', label: 'Artifacts' },
  { table: 'about_page', label: 'About page' },
  { table: 'user_roles', label: 'User roles' },
  { table: 'series_artworks', label: 'Series <> Artworks relationships' }
]

async function loadExportFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath)
  const file = await fs.readFile(absolutePath, 'utf-8')
  return JSON.parse(file)
}

async function truncateTables(supabase, tables) {
  console.log('🧹 Limpando tabelas de destino...')
  for (const { table, label } of tables.slice().reverse()) {
    console.log(`   • Removendo registros de ${label}`)
    const { error } = await supabase.from(table).delete().neq('id', '')
    if (error) {
      throw new Error(`Erro ao limpar ${table}: ${error.message}`)
    }
  }
}

function chunkArray(data, size = 500) {
  const result = []
  for (let i = 0; i < data.length; i += size) {
    result.push(data.slice(i, i + size))
  }
  return result
}

async function upsertTable(supabase, table, rows) {
  const chunks = chunkArray(rows)

  for (const chunk of chunks) {
    const { error } = await supabase
      .from(table)
      .upsert(chunk, { onConflict: 'id' })

    if (error) {
      throw new Error(`Erro ao importar dados para ${table}: ${error.message}`)
    }
  }
}

async function importData() {
  const options = parseArgs()
  const inputFile = options.input || options.file

  if (!inputFile) {
    console.error('❌ Informe o arquivo de backup com --input=CAMINHO')
    process.exit(1)
  }

  const targetUrl =
    options['target-url'] ||
    process.env.SUPABASE_TARGET_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
  const targetKey =
    options['target-key'] ||
    process.env.SUPABASE_TARGET_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!targetUrl || !targetKey) {
    console.error(
      '❌ Variáveis de ambiente ausentes. Defina SUPABASE_TARGET_URL e SUPABASE_TARGET_SERVICE_ROLE_KEY.'
    )
    process.exit(1)
  }

  const truncate = resolveBoolean(options.truncate)
  const dryRun = resolveBoolean(options['dry-run'])

  const supabase = createClient(targetUrl, targetKey)

  console.log('🚚 Importando dados para novo projeto Supabase...')
  console.log(`📦 Destino: ${targetUrl}`)

  const exportData = await loadExportFile(inputFile)

  if (!exportData || typeof exportData !== 'object' || !exportData.tables) {
    console.error('❌ Arquivo de backup inválido ou corrompido.')
    process.exit(1)
  }

  console.log(`📄 Backup criado em: ${exportData.exportedAt || 'desconhecido'}`)

  if (dryRun) {
    console.log('\n🧪 Dry run ativado — nenhuma alteração será feita.')
    for (const { table, label } of IMPORT_ORDER) {
      const rows = exportData.tables[table] || []
      console.log(`   • ${label}: ${rows.length} registros a importar`)
    }
    process.exit(0)
  }

  if (truncate) {
    await truncateTables(supabase, IMPORT_ORDER)
  }

  for (const { table, label } of IMPORT_ORDER) {
    const rows = exportData.tables[table] || []

    if (!rows.length) {
      console.log(`⚠️  ${label}: Nenhum registro encontrado no backup`)
      continue
    }

    console.log(`⬆️  Importando ${rows.length} registros para ${label}`)
    await upsertTable(supabase, table, rows)
  }

  console.log('\n✅ Importação concluída!')
  console.log('🔁 Recomenda-se executar: node scripts/utils/health-check.js')
}

if (require.main === module) {
  importData().catch((error) => {
    console.error('❌ Falha na importação:', error)
    process.exit(1)
  })
}

module.exports = { importData }

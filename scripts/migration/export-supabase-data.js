#!/usr/bin/env node

/**
 * Exporta dados completos do Supabase para um arquivo JSON.
 *
 * Uso:
 *   node scripts/migration/export-supabase-data.js [--output=backups/custom-file.json]
 *
 * Variáveis de ambiente suportadas:
 *   SUPABASE_SOURCE_URL (fallback para NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SOURCE_SERVICE_ROLE_KEY (fallback para SUPABASE_SERVICE_ROLE_KEY)
 */

const fs = require('fs/promises')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SOURCE_URL =
  process.env.SUPABASE_SOURCE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SOURCE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SOURCE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SOURCE_URL || !SOURCE_SERVICE_ROLE_KEY) {
  console.error(
    '❌ Variáveis de ambiente ausentes. Defina SUPABASE_SOURCE_URL e SUPABASE_SOURCE_SERVICE_ROLE_KEY.'
  )
  process.exit(1)
}

const supabase = createClient(SOURCE_URL, SOURCE_SERVICE_ROLE_KEY)

const DEFAULT_TABLES = [
  'series',
  'artworks',
  'series_artworks',
  'artifacts',
  'about_page',
  'user_roles'
]

const DEFAULT_BUCKETS = ['media', 'cached-images']

async function ensureBackupsDirectory() {
  const backupsDir = path.resolve(process.cwd(), 'backups')
  try {
    await fs.access(backupsDir)
  } catch {
    await fs.mkdir(backupsDir, { recursive: true })
  }
}

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

async function fetchAllRows(table) {
  const pageSize = 1000
  let from = 0
  const rows = []

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, from + pageSize - 1)

    if (error) {
      throw new Error(`Erro ao exportar ${table}: ${error.message}`)
    }

    if (!data || data.length === 0) {
      break
    }

    rows.push(...data)

    if (data.length < pageSize) {
      break
    }

    from += pageSize
  }

  return rows
}

async function listBucketObjects(bucket, prefix = '') {
  const pageSize = 100
  let offset = 0
  const objects = []

  while (true) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, {
        limit: pageSize,
        offset,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error) {
      throw new Error(
        `Erro ao listar objetos do bucket ${bucket}/${prefix || ''}: ${
          error.message
        }`
      )
    }

    if (!data || data.length === 0) {
      break
    }

    for (const item of data) {
      if (item.id === null) {
        // Diretório - listar recursivamente
        const nextPrefix = prefix ? `${prefix}/${item.name}` : item.name
        const nested = await listBucketObjects(bucket, nextPrefix)
        objects.push(...nested)
      } else {
        objects.push({
          bucket,
          path: prefix ? `${prefix}/${item.name}` : item.name,
          size: item.metadata?.size ?? null,
          lastModified: item.updated_at ?? null
        })
      }
    }

    if (data.length < pageSize) {
      break
    }

    offset += pageSize
  }

  return objects
}

async function exportData() {
  const options = parseArgs()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outputPath = options.output
    ? path.resolve(process.cwd(), options.output)
    : path.resolve(process.cwd(), 'backups', `supabase-export-${timestamp}.json`)

  await ensureBackupsDirectory()

  console.log('🚀 Iniciando exportação do Supabase...')
  console.log(`📦 Projeto: ${SOURCE_URL}`)

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    sourceUrl: SOURCE_URL,
    tables: {},
    storage: {},
    metadata: {
      tables: {},
      storageObjects: 0
    }
  }

  for (const table of DEFAULT_TABLES) {
    console.log(`📤 Exportando tabela: ${table}`)
    const rows = await fetchAllRows(table)
    exportPayload.tables[table] = rows
    exportPayload.metadata.tables[table] = rows.length
  }

  for (const bucket of DEFAULT_BUCKETS) {
    console.log(`🗂️  Listando arquivos do bucket: ${bucket}`)
    const objects = await listBucketObjects(bucket)
    exportPayload.storage[bucket] = objects
    exportPayload.metadata.storageObjects += objects.length
  }

  await fs.writeFile(outputPath, JSON.stringify(exportPayload, null, 2))

  console.log('\n✅ Exportação concluída!')
  console.log(`💾 Arquivo salvo em: ${outputPath}`)
  console.log('📊 Resumo:')
  for (const [table, count] of Object.entries(exportPayload.metadata.tables)) {
    console.log(`   • ${table}: ${count} registros`)
  }
  console.log(`   • Objetos de storage: ${exportPayload.metadata.storageObjects}`)
}

if (require.main === module) {
  exportData().catch((error) => {
    console.error('❌ Falha na exportação:', error)
    process.exit(1)
  })
}

module.exports = { exportData }

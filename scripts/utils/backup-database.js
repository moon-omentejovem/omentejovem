#!/usr/bin/env node
/**
 * 🗄️ Database Backup Utility
 *
 * Cria backup completo dos dados do Supabase para arquivo JSON
 * Útil antes de migrações importantes ou como backup de segurança
 */

const {  createClient  } = require('@supabase/supabase-js')
import * as dotenv from 'dotenv'
const fs = require('fs/promises')
const path = require('path')

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function backupDatabase() {
  console.log('🗄️ Iniciando backup do banco de dados...\n')

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'backups')

  try {
    await fs.mkdir(backupDir, { recursive: true })
  } catch (err) {
    // Directory already exists
  }

  const backup = {
    timestamp,
    version: '1.0.0',
    data: {}
  }

  // Tabelas para backup
  const tables = [
    'artworks',
    'series',
    'series_artworks',
    'about_page',
    'user_roles'
  ]

  console.log('📊 Fazendo backup das tabelas...')

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*')

      if (error) {
        console.error(`❌ Erro ao fazer backup da tabela ${table}:`, error)
        continue
      }

      backup.data[table] = data
      console.log(`✅ ${table}: ${data.length} registros`)
    } catch (err) {
      console.error(`❌ Erro inesperado na tabela ${table}:`, err.message)
    }
  }

  // Storage files info
  console.log('\n📁 Listando arquivos do storage...')
  try {
    const { data: rawFiles } = await supabase.storage
      .from('media')
      .list('artworks/raw')

    const { data: optimizedFiles } = await supabase.storage
      .from('media')
      .list('artworks/optimized')

    backup.storage = {
      raw: rawFiles || [],
      optimized: optimizedFiles || []
    }

    console.log(
      `✅ Storage: ${rawFiles?.length || 0} raw + ${optimizedFiles?.length || 0} optimized files`
    )
  } catch (err) {
    console.error('❌ Erro ao listar storage:', err.message)
  }

  // Salvar backup
  const filename = `backup-${timestamp}.json`
  const filepath = path.join(backupDir, filename)

  await fs.writeFile(filepath, JSON.stringify(backup, null, 2))

  console.log(`\n💾 Backup salvo: ${filename}`)
  console.log(`📍 Local: ${filepath}`)
  console.log(
    `📊 Tamanho: ${((await fs.stat(filepath)).size / 1024 / 1024).toFixed(2)} MB`
  )

  // Estatísticas
  const totalRecords = Object.values(backup.data).reduce(
    (sum, table) => sum + table.length,
    0
  )
  const totalFiles =
    (backup.storage?.raw?.length || 0) +
    (backup.storage?.optimized?.length || 0)

  console.log('\n🎯 Resumo do backup:')
  console.log(`   📊 ${totalRecords} registros de banco`)
  console.log(`   📁 ${totalFiles} arquivos de storage`)
  console.log(`   ⏰ ${timestamp}`)
}

if (require.main === module) {
  backupDatabase().catch(console.error)
}

module.exports = { backupDatabase  }

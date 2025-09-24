#!/usr/bin/env node

/**
 * Script de Migração da Estrutura de Imagens
 *
 * Migra de: {scaffold}/{compression}/{filename}.{ext}
 * Para:    {scaffold}/{id}/{compression}/{filename}.{ext}
 *
 * Exemplo:
 * - De: artworks/optimized/my-artwork.webp
 * - Para: artworks/01234567-89ab-cdef-0123-456789abcde6/raw/my-artwork.webp
 */

// Carregar variáveis de ambiente
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Configurações
const BUCKET_NAME = 'media'
const DRY_RUN = process.argv.includes('--dry-run')
const BACKUP_BEFORE_MIGRATION = true

// Estruturas de dados
const migrationMap = {
  artworks: [],
  series: [],
  artifacts: []
}

const migrationLog = {
  success: [],
  errors: [],
  skipped: [],
  totalFiles: 0,
  migratedFiles: 0
}

/**
 * Função para obter dados do banco
 */
async function fetchDatabaseData() {
  console.log('📊 Buscando dados do banco...')

  try {
    // Buscar artworks
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('id, slug, title')

    if (artworksError) throw artworksError

    // Buscar series
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('id, slug, name')

    if (seriesError) throw seriesError

    // Buscar artifacts
    const { data: artifacts, error: artifactsError } = await supabase
      .from('artifacts')
      .select('id, title')

    if (artifactsError) throw artifactsError

    migrationMap.artworks = artworks || []
    migrationMap.series = series || []
    migrationMap.artifacts = artifacts || []

    console.log('✅ Dados carregados:')
    console.log(`   - Artworks: ${migrationMap.artworks.length}`)
    console.log(`   - Series: ${migrationMap.series.length}`)
    console.log(`   - Artifacts: ${migrationMap.artifacts.length}`)
  } catch (error) {
    console.error('❌ Erro ao buscar dados do banco:', error)
    throw error
  }
}

/**
 * Função para listar arquivos no bucket
 */
async function listBucketFiles() {
  console.log('📁 Listando arquivos no bucket...')

  const files = []

  try {
    // Listar artworks
    const { data: artworkFiles, error: artworkError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('artworks', { limit: 1000 })

    if (artworkError) throw artworkError

    // Listar series
    const { data: seriesFiles, error: seriesError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('series', { limit: 1000 })

    if (seriesError) throw seriesError

    // Listar artifacts
    const { data: artifactFiles, error: artifactError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('artifacts', { limit: 1000 })

    if (artifactError) throw artifactError

    // Processar arquivos de artworks
    for (const file of artworkFiles || []) {
      if (file.name === 'optimized' || file.name === 'raw') {
        // Listar subpastas
        const { data: subFiles } = await supabase.storage
          .from(BUCKET_NAME)
          .list(`artworks/${file.name}`, { limit: 1000 })

        for (const subFile of subFiles || []) {
          files.push({
            path: `artworks/${file.name}/${subFile.name}`,
            type: 'artwork',
            compression: file.name,
            filename: subFile.name
          })
        }
      }
    }

    // Processar arquivos de series
    for (const file of seriesFiles || []) {
      if (file.name === 'optimized' || file.name === 'raw') {
        const { data: subFiles } = await supabase.storage
          .from(BUCKET_NAME)
          .list(`series/${file.name}`, { limit: 1000 })

        for (const subFile of subFiles || []) {
          files.push({
            path: `series/${file.name}/${subFile.name}`,
            type: 'series',
            compression: file.name,
            filename: subFile.name
          })
        }
      }
    }

    // Processar arquivos de artifacts
    for (const file of artifactFiles || []) {
      if (file.name === 'optimized' || file.name === 'raw') {
        const { data: subFiles } = await supabase.storage
          .from(BUCKET_NAME)
          .list(`artifacts/${file.name}`, { limit: 1000 })

        for (const subFile of subFiles || []) {
          files.push({
            path: `artifacts/${file.name}/${subFile.name}`,
            type: 'artifact',
            compression: file.name,
            filename: subFile.name
          })
        }
      }
    }

    console.log(`✅ ${files.length} arquivos encontrados no bucket`)
    return files
  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error)
    throw error
  }
}

/**
 * Função para mapear slug/ID para arquivo
 */
function mapFileToId(file, type) {
  const { filename, compression } = file

  if (type === 'artwork') {
    // Remover extensão e sufixo -raw
    const cleanName = filename
      .replace(/\.(webp|jpg|jpeg|png)$/i, '')
      .replace(/-raw$/, '')

    // Buscar artwork por slug
    const artwork = migrationMap.artworks.find((a) => a.slug === cleanName)
    return artwork?.id
  }

  if (type === 'series') {
    const cleanName = filename
      .replace(/\.(webp|jpg|jpeg|png)$/i, '')
      .replace(/-raw$/, '')

    const series = migrationMap.series.find((s) => s.slug === cleanName)
    return series?.id
  }

  if (type === 'artifact') {
    const cleanName = filename
      .replace(/\.(webp|jpg|jpeg|png)$/i, '')
      .replace(/-raw$/, '')

    const artifact = migrationMap.artifacts.find((a) => a.title === cleanName)
    return artifact?.id
  }

  return null
}

/**
 * Função para gerar novo path
 */
function generateNewPath(file, id) {
  if (!id) return null

  const { type, compression, filename } = file
  return `${type}/${id}/${compression}/${filename}`
}

/**
 * Função para fazer backup antes da migração
 */
async function createBackup() {
  if (!BACKUP_BEFORE_MIGRATION) return

  console.log('💾 Criando backup...')

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = `backups/bucket-backup-${timestamp}.json`

    const files = await listBucketFiles()
    const backup = {
      timestamp: new Date().toISOString(),
      files: files.map((f) => ({
        path: f.path,
        type: f.type,
        compression: f.compression,
        filename: f.filename
      }))
    }

    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2))
    console.log(`✅ Backup criado: ${backupPath}`)
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error)
    throw error
  }
}

/**
 * Função para migrar um arquivo
 */
async function migrateFile(file) {
  const { path: oldPath, type } = file

  try {
    // Mapear para ID
    const id = mapFileToId(file, type)
    if (!id) {
      migrationLog.skipped.push({
        path: oldPath,
        reason: 'ID não encontrado no banco'
      })
      return
    }

    // Gerar novo path
    const newPath = generateNewPath(file, id)
    if (!newPath) {
      migrationLog.skipped.push({
        path: oldPath,
        reason: 'Não foi possível gerar novo path'
      })
      return
    }

    if (DRY_RUN) {
      console.log(`🔄 [DRY RUN] ${oldPath} → ${newPath}`)
      migrationLog.success.push({ oldPath, newPath })
      return
    }

    // Baixar arquivo
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(oldPath)

    if (downloadError) throw downloadError

    // Upload para novo local
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(newPath, fileData, {
        contentType: fileData.type,
        upsert: true
      })

    if (uploadError) throw uploadError

    console.log(`✅ ${oldPath} → ${newPath}`)
    migrationLog.success.push({ oldPath, newPath })
    migrationLog.migratedFiles++
  } catch (error) {
    console.error(`❌ Erro ao migrar ${oldPath}:`, error.message)
    migrationLog.errors.push({
      path: oldPath,
      error: error.message
    })
  }
}

/**
 * Função principal de migração
 */
async function migrateImages() {
  console.log('🚀 Iniciando migração da estrutura de imagens...')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'EXECUÇÃO REAL'}`)

  try {
    // 1. Buscar dados do banco
    await fetchDatabaseData()

    // 2. Listar arquivos do bucket
    const files = await listBucketFiles()
    migrationLog.totalFiles = files.length

    // 3. Criar backup
    await createBackup()

    // 4. Migrar arquivos
    console.log('🔄 Iniciando migração de arquivos...')

    for (const file of files) {
      await migrateFile(file)
    }

    // 5. Relatório final
    console.log('\n📊 RELATÓRIO DE MIGRAÇÃO:')
    console.log(`   Total de arquivos: ${migrationLog.totalFiles}`)
    console.log(`   Migrados com sucesso: ${migrationLog.success.length}`)
    console.log(`   Erros: ${migrationLog.errors.length}`)
    console.log(`   Ignorados: ${migrationLog.skipped.length}`)

    if (migrationLog.errors.length > 0) {
      console.log('\n❌ ERROS:')
      migrationLog.errors.forEach((err) => {
        console.log(`   - ${err.path}: ${err.error}`)
      })
    }

    if (migrationLog.skipped.length > 0) {
      console.log('\n⚠️  IGNORADOS:')
      migrationLog.skipped.forEach((skip) => {
        console.log(`   - ${skip.path}: ${skip.reason}`)
      })
    }

    // 6. Salvar log
    const logPath = `reports/migration-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    await fs.writeFile(logPath, JSON.stringify(migrationLog, null, 2))
    console.log(`\n📝 Log salvo em: ${logPath}`)

    if (DRY_RUN) {
      console.log(
        '\n🔍 Este foi um DRY RUN. Execute sem --dry-run para fazer a migração real.'
      )
    } else {
      console.log('\n✅ Migração concluída!')
      console.log(
        '⚠️  LEMBRE-SE: Atualizar o código para usar a nova estrutura antes de deletar os arquivos antigos.'
      )
    }
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    process.exit(1)
  }
}

// Executar migração
if (require.main === module) {
  migrateImages()
}

module.exports = { migrateImages }

#!/usr/bin/env node

/**
 * Script de Migração da Estrutura de Imagens
 *
 * Migra de: {scaffold}/{compression}/{filename}.{ext}
 * Para:    {scaffold}/{id}/[raw|optimized]/{filename}.{ext}
 *
 * - Gera nomes sanitizados seguindo o novo padrão.
 * - Move os arquivos para os diretórios baseados em ID.
 * - Remove os arquivos legados após migração bem-sucedida.
 * - Atualiza o campo image_filename no banco (quando o arquivo raw é encontrado).
 */

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

// Dados de suporte
const migrationMap = {
  artworks: [],
  series: [],
  artifacts: []
}

const updatedFilenames = {
  artwork: new Map(),
  series: new Map(),
  artifact: new Map()
}

const migrationLog = {
  success: [],
  errors: [],
  skipped: [],
  removed: [],
  databaseUpdates: [],
  totalFiles: 0,
  migratedFiles: 0
}

/**
 * Sanitização utilitária — replica helpers do front para manter consistência
 */
function normalizeString(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function cleanSegment(value = '') {
  const normalized = normalizeString(String(value).trim())
  const cleaned = normalized
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return cleaned || 'unknown'
}

function sanitizeStorageSegment(value = '') {
  return cleanSegment(value)
}

function sanitizeExtension(extension = '') {
  const cleaned = normalizeString(extension).replace(/[^a-z0-9]+/g, '')
  return cleaned || 'jpg'
}

function sanitizeFilename(filename = '') {
  const trimmed = filename.trim()
  const dotIndex = trimmed.lastIndexOf('.')

  const basePart = dotIndex >= 0 ? trimmed.slice(0, dotIndex) : trimmed
  const extensionPart = dotIndex >= 0 ? trimmed.slice(dotIndex + 1) : ''

  const base = cleanSegment(basePart) || 'image'
  const extension = sanitizeExtension(extensionPart)

  const raw = `${base}.${extension}`
  const optimized = `${base}.webp`

  return { raw, optimized, base, extension }
}

function shouldIncludeOptimized(type) {
  return type !== 'editor'
}

function deriveCanonicalParts(file) {
  const original = file.filename
  const originalExtension = path.extname(original).replace('.', '') || 'jpg'
  const withoutExtension = path.basename(original, path.extname(original))

  let base = withoutExtension
  if (file.compression === 'raw') {
    base = base.replace(/-raw$/i, '')
  } else {
    base = base.replace(/-optimized$/i, '')
  }

  return {
    base,
    extension: originalExtension
  }
}

function buildImagePaths(file, id) {
  const includeOptimized = shouldIncludeOptimized(file.type)
  const { base, extension } = deriveCanonicalParts(file)
  const sanitized = sanitizeFilename(`${base}.${extension}`)
  const sanitizedScaffold = sanitizeStorageSegment(file.scaffold)
  const sanitizedId = sanitizeStorageSegment(id)
  const prefix = `${sanitizedScaffold}/${sanitizedId}`

  const rawPath = `${prefix}/raw/${sanitized.raw}`
  const optimizedPath = includeOptimized
    ? `${prefix}/optimized/${sanitized.optimized}`
    : null

  return {
    includeOptimized,
    sanitizedId,
    rawFilename: sanitized.raw,
    optimizedFilename: sanitized.optimized,
    rawPath,
    optimizedPath,
    base: sanitized.base,
    extension: sanitized.extension
  }
}

function guessMimeType(extension) {
  switch (extension.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

function registerFilename(type, id, filename, compression) {
  if (compression !== 'raw') return
  const map = updatedFilenames[type]
  if (!map) return
  if (!map.has(id)) {
    map.set(id, filename)
  }
}

/**
 * Função para obter dados do banco
 */
async function fetchDatabaseData() {
  console.log('📊 Buscando dados do banco...')

  try {
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('id, slug, title')

    if (artworksError) throw artworksError

    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('id, slug, name')

    if (seriesError) throw seriesError

    const { data: artifacts, error: artifactsError } = await supabase
      .from('artifacts')
      .select('id, title, slug')

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

  async function collect(scaffold, type) {
    const { data: directories, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(scaffold, { limit: 1000 })

    if (error) throw error

    for (const dir of directories || []) {
      if (dir.name !== 'raw' && dir.name !== 'optimized') continue

      const { data: objects, error: objectError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(`${scaffold}/${dir.name}`, { limit: 1000 })

      if (objectError) throw objectError

      for (const object of objects || []) {
        files.push({
          path: `${scaffold}/${dir.name}/${object.name}`,
          type,
          scaffold,
          compression: dir.name,
          filename: object.name
        })
      }
    }
  }

  try {
    await collect('artworks', 'artwork')
    await collect('series', 'series')
    await collect('artifacts', 'artifact')

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
  const { filename } = file
  const base = filename
    .replace(/\.[^.]+$/, '')
    .replace(/-raw$/i, '')
    .replace(/-optimized$/i, '')

  if (type === 'artwork') {
    const artwork = migrationMap.artworks.find((a) => a.slug === base)
    return artwork?.id
  }

  if (type === 'series') {
    const series = migrationMap.series.find((s) => s.slug === base)
    return series?.id
  }

  if (type === 'artifact') {
    const artifact = migrationMap.artifacts.find(
      (a) => a.slug === base || a.title === base
    )
    return artifact?.id
  }

  return null
}

/**
 * Função para fazer backup antes da migração
 */
async function createBackup(files) {
  if (!BACKUP_BEFORE_MIGRATION) return

  console.log('💾 Criando backup...')

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = `backups/bucket-backup-${timestamp}.json`

    const backup = {
      timestamp: new Date().toISOString(),
      files: files.map((f) => ({
        path: f.path,
        type: f.type,
        scaffold: f.scaffold,
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
 * Função para migrar um arquivo individual
 */
async function migrateFile(file) {
  const { path: oldPath, type } = file

  try {
    const id = mapFileToId(file, type)

    if (!id) {
      migrationLog.skipped.push({
        path: oldPath,
        reason: 'ID não encontrado no banco'
      })
      return
    }

    const descriptor = buildImagePaths(file, id)
    const targetPath =
      file.compression === 'optimized' ? descriptor.optimizedPath : descriptor.rawPath

    if (!targetPath) {
      migrationLog.skipped.push({
        path: oldPath,
        reason: 'Sem destino válido (otimização desabilitada)'
      })
      return
    }

    registerFilename(type, id, descriptor.rawFilename, file.compression)

    if (DRY_RUN) {
      console.log(`🔄 [DRY RUN] ${oldPath} → ${targetPath}`)
      migrationLog.success.push({
        oldPath,
        newPath: targetPath,
        dryRun: true
      })
      return
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(oldPath)

    if (downloadError) throw downloadError

    const contentType =
      file.compression === 'optimized'
        ? 'image/webp'
        : fileData.type || guessMimeType(descriptor.extension)

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(targetPath, fileData, {
        contentType,
        upsert: true
      })

    if (uploadError) throw uploadError

    const { error: removeError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([oldPath])

    if (removeError) {
      console.warn(`⚠️  Não foi possível remover arquivo antigo ${oldPath}:`, removeError)
      migrationLog.errors.push({
        path: oldPath,
        error: `Falha ao remover arquivo antigo: ${removeError.message}`
      })
    } else {
      migrationLog.removed.push(oldPath)
    }

    console.log(`✅ ${oldPath} → ${targetPath}`)
    migrationLog.success.push({ oldPath, newPath: targetPath })
    migrationLog.migratedFiles++
  } catch (error) {
    console.error(`❌ Erro ao migrar ${oldPath}:`, error.message)
    migrationLog.errors.push({
      path: oldPath,
      error: error.message
    })
  }
}

async function updateDatabaseFilenames() {
  console.log('\n🗃️ Atualizando image_filename no banco...')
  const tableByType = {
    artwork: 'artworks',
    series: 'series',
    artifact: 'artifacts'
  }

  for (const [type, map] of Object.entries(updatedFilenames)) {
    const table = tableByType[type]
    if (!table || map.size === 0) continue

    for (const [id, filename] of map.entries()) {
      if (DRY_RUN) {
        console.log(`🔄 [DRY RUN] Atualizaria ${table}.${id} → ${filename}`)
        migrationLog.databaseUpdates.push({
          table,
          id,
          filename,
          dryRun: true
        })
        continue
      }

      const { error } = await supabase
        .from(table)
        .update({ image_filename: filename })
        .eq('id', id)

      if (error) {
        console.error(`❌ Erro ao atualizar ${table} (${id}):`, error.message)
        migrationLog.errors.push({
          path: `${table}:${id}`,
          error: `Falha ao atualizar image_filename: ${error.message}`
        })
      } else {
        console.log(`📝 image_filename atualizado: ${table}.${id} → ${filename}`)
        migrationLog.databaseUpdates.push({ table, id, filename })
      }
    }
  }
}

/**
 * Função principal de migração
 */
async function migrateImages() {
  console.log('🚀 Iniciando migração da estrutura de imagens...')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'EXECUÇÃO REAL'}`)

  try {
    await fetchDatabaseData()

    const files = await listBucketFiles()
    migrationLog.totalFiles = files.length

    await createBackup(files)

    console.log('🔄 Iniciando migração de arquivos...')
    for (const file of files) {
      await migrateFile(file)
    }

    await updateDatabaseFilenames()

    console.log('\n📊 RELATÓRIO DE MIGRAÇÃO:')
    console.log(`   Total de arquivos: ${migrationLog.totalFiles}`)
    console.log(`   Migrados com sucesso: ${migrationLog.success.length}`)
    console.log(`   Erros: ${migrationLog.errors.length}`)
    console.log(`   Ignorados: ${migrationLog.skipped.length}`)
    console.log(`   Arquivos antigos removidos: ${migrationLog.removed.length}`)
    console.log(`   Atualizações de banco: ${migrationLog.databaseUpdates.length}`)

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

    const logPath = `reports/migration-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    await fs.writeFile(logPath, JSON.stringify(migrationLog, null, 2))
    console.log(`\n📝 Log salvo em: ${logPath}`)

    if (DRY_RUN) {
      console.log('\n🔍 Este foi um DRY RUN. Execute sem --dry-run para fazer a migração real.')
    } else {
      console.log('\n✅ Migração concluída!')
      console.log('⚠️  Revise o relatório e confirme a remoção total dos diretórios legados.')
    }
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  migrateImages()
}

module.exports = { migrateImages }

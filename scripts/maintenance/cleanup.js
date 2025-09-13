#!/usr/bin/env node
/**
 * 🧹 Cleanup Utility
 *
 * Limpa dados desnecessários e otimiza o banco:
 * - Remove dados órfãos
 * - Limpa storage não utilizado
 * - Otimiza relacionamentos
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanup(options = {}) {
  console.log('🧹 Iniciando limpeza do sistema...\n')

  const { dryRun = false } = options

  if (dryRun) {
    console.log('🔍 MODO DRY RUN - Apenas análise, sem alterações\n')
  }

  const stats = {
    orphanedSeriesArtworks: 0,
    unusedStorageFiles: 0,
    duplicateRelations: 0,
    cleanedUp: 0
  }

  // 1. Verificar relacionamentos órfãos em series_artworks
  console.log('🔍 Verificando relacionamentos órfãos...')

  try {
    const { data: relations } = await supabase.from('series_artworks').select(`
        id,
        artwork_id,
        series_id,
        artworks!inner(id),
        series!inner(id)
      `)

    const { data: allRelations } = await supabase
      .from('series_artworks')
      .select('id, artwork_id, series_id')

    // Encontrar órfãos
    const orphaned = allRelations.filter(
      (rel) => !relations.find((valid) => valid.id === rel.id)
    )

    stats.orphanedSeriesArtworks = orphaned.length

    if (orphaned.length > 0) {
      console.log(`❌ Encontrados ${orphaned.length} relacionamentos órfãos`)

      if (!dryRun) {
        for (const orphan of orphaned) {
          await supabase.from('series_artworks').delete().eq('id', orphan.id)
        }
        console.log(`✅ ${orphaned.length} relacionamentos órfãos removidos`)
        stats.cleanedUp += orphaned.length
      }
    } else {
      console.log('✅ Nenhum relacionamento órfão encontrado')
    }
  } catch (err) {
    console.error('❌ Erro ao verificar relacionamentos:', err.message)
  }

  // 2. Verificar arquivos não utilizados no storage
  console.log('\n📁 Verificando arquivos não utilizados...')

  try {
    const { data: rawFiles } = await supabase.storage
      .from('media')
      .list('artworks/raw')

    const { data: optimizedFiles } = await supabase.storage
      .from('media')
      .list('artworks/optimized')

    const { data: artworks } = await supabase
      .from('artworks')
      .select('image_url')

    const usedFiles = new Set()

    artworks.forEach((artwork) => {
      if (artwork.image_url?.includes('supabase')) {
        const filename = artwork.image_url.split('/').pop()
        usedFiles.add(filename)
      }
    })

    const unusedRaw =
      rawFiles?.filter(
        (file) =>
          !usedFiles.has(file.name) && file.name !== '.emptyFolderPlaceholder'
      ) || []

    const unusedOptimized =
      optimizedFiles?.filter(
        (file) =>
          !usedFiles.has(file.name) && file.name !== '.emptyFolderPlaceholder'
      ) || []

    stats.unusedStorageFiles = unusedRaw.length + unusedOptimized.length

    if (stats.unusedStorageFiles > 0) {
      console.log(
        `❌ Encontrados ${stats.unusedStorageFiles} arquivos não utilizados`
      )
      console.log(
        `   Raw: ${unusedRaw.length}, Optimized: ${unusedOptimized.length}`
      )

      if (!dryRun) {
        // Remover arquivos não utilizados
        for (const file of unusedRaw) {
          await supabase.storage
            .from('media')
            .remove([`artworks/raw/${file.name}`])
        }

        for (const file of unusedOptimized) {
          await supabase.storage
            .from('media')
            .remove([`artworks/optimized/${file.name}`])
        }

        console.log(`✅ ${stats.unusedStorageFiles} arquivos removidos`)
        stats.cleanedUp += stats.unusedStorageFiles
      }
    } else {
      console.log('✅ Todos os arquivos estão sendo utilizados')
    }
  } catch (err) {
    console.error('❌ Erro ao verificar storage:', err.message)
  }

  // 3. Verificar relacionamentos duplicados
  console.log('\n🔄 Verificando relacionamentos duplicados...')

  try {
    const { data: relations } = await supabase
      .from('series_artworks')
      .select('artwork_id, series_id')

    const seen = new Set()
    const duplicates = []

    relations.forEach((rel) => {
      const key = `${rel.artwork_id}-${rel.series_id}`
      if (seen.has(key)) {
        duplicates.push(rel)
      } else {
        seen.add(key)
      }
    })

    stats.duplicateRelations = duplicates.length

    if (duplicates.length > 0) {
      console.log(
        `❌ Encontrados ${duplicates.length} relacionamentos duplicados`
      )

      if (!dryRun) {
        // Remover duplicatas (manter apenas a primeira ocorrência)
        for (const dup of duplicates) {
          const { data: toDelete } = await supabase
            .from('series_artworks')
            .select('id')
            .eq('artwork_id', dup.artwork_id)
            .eq('series_id', dup.series_id)
            .order('created_at', { ascending: false })
            .limit(1)

          if (toDelete && toDelete[0]) {
            await supabase
              .from('series_artworks')
              .delete()
              .eq('id', toDelete[0].id)
          }
        }

        console.log(`✅ ${duplicates.length} duplicatas removidas`)
        stats.cleanedUp += duplicates.length
      }
    } else {
      console.log('✅ Nenhum relacionamento duplicado encontrado')
    }
  } catch (err) {
    console.error('❌ Erro ao verificar duplicatas:', err.message)
  }

  // 4. Resumo
  console.log('\n📊 RESUMO DA LIMPEZA')
  console.log('=====================')
  console.log(`🔗 Relacionamentos órfãos: ${stats.orphanedSeriesArtworks}`)
  console.log(`📁 Arquivos não utilizados: ${stats.unusedStorageFiles}`)
  console.log(`🔄 Relacionamentos duplicados: ${stats.duplicateRelations}`)

  if (dryRun) {
    const totalIssues =
      stats.orphanedSeriesArtworks +
      stats.unusedStorageFiles +
      stats.duplicateRelations
    console.log(`\n🔍 Total de issues encontradas: ${totalIssues}`)
    console.log('💡 Execute sem --dry-run para aplicar limpeza')
  } else {
    console.log(`\n✅ Total de itens limpos: ${stats.cleanedUp}`)
    console.log('🎉 Limpeza concluída!')
  }

  return stats
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  cleanup({ dryRun }).catch(console.error)
}

export { cleanup }

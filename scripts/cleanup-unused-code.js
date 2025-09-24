#!/usr/bin/env node

/**
 * Script para Limpeza de Código Legado
 *
 * Remove código não utilizado e funções legadas
 */

const fs = require('fs').promises
const path = require('path')

// Arquivos para limpar
const filesToClean = [
  'src/utils/storage.ts',
  'src/services/image-upload.service.ts'
]

// Função para limpar storage.ts
async function cleanStorageFile() {
  const filePath = 'src/utils/storage.ts'

  try {
    console.log('🧹 Limpando src/utils/storage.ts...')

    let content = await fs.readFile(filePath, 'utf8')
    let hasChanges = false

    // Remover comentários desnecessários
    const oldComment = `/**
 * Storage Utils - Omentejovem
 * Utilitários para trabalhar com o sistema de imagens
 * Suporta tanto estrutura antiga (slug-based) quanto nova (id-based)
 */`

    const newComment = `/**
 * Storage Utils - Omentejovem
 * Utilitários para trabalhar com o sistema de imagens
 */`

    if (content.includes(oldComment)) {
      content = content.replace(oldComment, newComment)
      hasChanges = true
      console.log('   ✅ Comentários atualizados')
    }

    // Simplificar função de compatibilidade
    const oldCompatFunction = `/**
 * Função de compatibilidade para migração gradual
 * Tenta usar nova estrutura primeiro, fallback para antiga
 */
export function getImageUrlFromSlugCompat(
  slug: string | null,
  resourceType: string = 'artworks',
  imageType: 'optimized' | 'raw' = 'optimized'
): string {
  // Por enquanto, usa a estrutura antiga
  // Esta função será atualizada quando a migração estiver completa
  return getImageUrlFromSlug(slug, resourceType, imageType)
}`

    const newCompatFunction = `/**
 * Função de compatibilidade (alias para getImageUrlFromSlug)
 */
export function getImageUrlFromSlugCompat(
  slug: string | null,
  resourceType: string = 'artworks',
  imageType: 'optimized' | 'raw' = 'optimized'
): string {
  return getImageUrlFromSlug(slug, resourceType, imageType)
}`

    if (content.includes(oldCompatFunction)) {
      content = content.replace(oldCompatFunction, newCompatFunction)
      hasChanges = true
      console.log('   ✅ Função de compatibilidade simplificada')
    }

    if (hasChanges) {
      await fs.writeFile(filePath, content)
      console.log('   ✅ src/utils/storage.ts limpo')
      return { success: true, changes: 1 }
    } else {
      console.log('   ℹ️  Nenhuma limpeza necessária em src/utils/storage.ts')
      return { success: true, changes: 0 }
    }
  } catch (error) {
    console.error('❌ Erro ao limpar src/utils/storage.ts:', error.message)
    return { success: false, error: error.message }
  }
}

// Função para limpar image-upload.service.ts
async function cleanImageUploadService() {
  const filePath = 'src/services/image-upload.service.ts'

  try {
    console.log('🧹 Limpando src/services/image-upload.service.ts...')

    let content = await fs.readFile(filePath, 'utf8')
    let hasChanges = false

    // Verificar se há métodos de compatibilidade desnecessários
    if (
      content.includes('uploadImageBySlug') &&
      content.includes('@deprecated')
    ) {
      console.log(
        '   ℹ️  Método de compatibilidade encontrado (manter por enquanto)'
      )
    }

    // Remover comentários desnecessários
    const oldComment = `/**
 * Image Upload Service - Omentejovem
 * Serviço para upload de imagens com otimização automática
 * Suporta tanto estrutura antiga quanto nova
 */`

    const newComment = `/**
 * Image Upload Service - Omentejovem
 * Serviço para upload de imagens com otimização automática
 */`

    if (content.includes(oldComment)) {
      content = content.replace(oldComment, newComment)
      hasChanges = true
      console.log('   ✅ Comentários atualizados')
    }

    if (hasChanges) {
      await fs.writeFile(filePath, content)
      console.log('   ✅ src/services/image-upload.service.ts limpo')
      return { success: true, changes: 1 }
    } else {
      console.log(
        '   ℹ️  Nenhuma limpeza necessária em src/services/image-upload.service.ts'
      )
      return { success: true, changes: 0 }
    }
  } catch (error) {
    console.error(
      '❌ Erro ao limpar src/services/image-upload.service.ts:',
      error.message
    )
    return { success: false, error: error.message }
  }
}

// Função para remover arquivos de documentação desnecessários
async function cleanupDocumentation() {
  const docsToRemove = [
    'docs/FRONTEND_IMAGE_MIGRATION_PLAN.md',
    'docs/GRADUAL_MIGRATION_PLAN.md'
  ]

  console.log('🧹 Limpando documentação desnecessária...')

  const results = []
  for (const doc of docsToRemove) {
    try {
      await fs.unlink(doc)
      console.log(`   ✅ Removido: ${doc}`)
      results.push({ success: true, file: doc })
    } catch (error) {
      console.log(`   ℹ️  ${doc} não encontrado (pode ser normal)`)
      results.push({ success: true, file: doc })
    }
  }

  return results
}

// Função principal
async function cleanupUnusedCode() {
  console.log('🧹 Limpando código legado e não utilizado...')

  const results = []
  let totalChanges = 0

  try {
    // 1. Limpar storage.ts
    const storageResult = await cleanStorageFile()
    results.push({ file: 'src/utils/storage.ts', ...storageResult })
    if (storageResult.success && storageResult.changes) {
      totalChanges += storageResult.changes
    }

    // 2. Limpar image-upload.service.ts
    const uploadResult = await cleanImageUploadService()
    results.push({
      file: 'src/services/image-upload.service.ts',
      ...uploadResult
    })
    if (uploadResult.success && uploadResult.changes) {
      totalChanges += uploadResult.changes
    }

    // 3. Limpar documentação
    const docResults = await cleanupDocumentation()
    results.push(...docResults)

    // Relatório final
    console.log('\n📊 RELATÓRIO DE LIMPEZA:')
    console.log(`   Total de arquivos processados: ${results.length}`)
    console.log(
      `   Limpos com sucesso: ${results.filter((r) => r.success).length}`
    )
    console.log(`   Total de mudanças: ${totalChanges}`)
    console.log(`   Erros: ${results.filter((r) => !r.success).length}`)

    if (results.some((r) => !r.success)) {
      console.log('\n❌ ERROS:')
      results
        .filter((r) => !r.success)
        .forEach((result) => {
          console.log(`   - ${result.file}: ${result.error}`)
        })
    }

    console.log('\n✅ Limpeza de código concluída!')
    console.log('\n📝 Próximos passos:')
    console.log('   1. Testar aplicação: npm run dev')
    console.log('   2. Verificar se tudo ainda funciona')
    console.log('   3. Fazer commit das mudanças')
  } catch (error) {
    console.error('❌ Erro durante limpeza:', error)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanupUnusedCode()
}

module.exports = { cleanupUnusedCode }

#!/usr/bin/env node

/**
 * Script para Limpeza de Arquivos de Backup
 *
 * Remove todos os arquivos de backup criados durante a migração
 */

const fs = require('fs').promises
const path = require('path')

// Padrões de arquivos para remover
const backupPatterns = ['*.backup', '*.fix-backup', '*.import-fix-backup']

// Função para encontrar arquivos de backup
async function findBackupFiles(dir) {
  const files = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules'
      ) {
        const subFiles = await findBackupFiles(fullPath)
        files.push(...subFiles)
      } else if (entry.isFile()) {
        // Verificar se é arquivo de backup
        const isBackup = backupPatterns.some((pattern) => {
          const regex = new RegExp(pattern.replace('*', '.*'))
          return regex.test(entry.name)
        })

        if (isBackup) {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    // Ignorar diretórios que não podem ser lidos
  }

  return files
}

// Função para remover arquivo
async function removeFile(filePath) {
  try {
    await fs.unlink(filePath)
    return { success: true, file: filePath }
  } catch (error) {
    return { success: false, file: filePath, error: error.message }
  }
}

// Função principal
async function cleanupBackupFiles() {
  console.log('🧹 Limpando arquivos de backup...')

  try {
    // Encontrar todos os arquivos de backup
    const backupFiles = await findBackupFiles('src')
    console.log(`📁 Encontrados ${backupFiles.length} arquivos de backup`)

    if (backupFiles.length === 0) {
      console.log('✅ Nenhum arquivo de backup encontrado')
      return
    }

    // Mostrar arquivos que serão removidos
    console.log('\n📋 Arquivos que serão removidos:')
    backupFiles.forEach((file) => {
      console.log(`   - ${file}`)
    })

    // Remover arquivos
    const results = []
    for (const file of backupFiles) {
      const result = await removeFile(file)
      results.push(result)

      if (result.success) {
        console.log(`   ✅ Removido: ${path.basename(file)}`)
      } else {
        console.log(
          `   ❌ Erro ao remover ${path.basename(file)}: ${result.error}`
        )
      }
    }

    // Relatório final
    const successCount = results.filter((r) => r.success).length
    const errorCount = results.filter((r) => !r.success).length

    console.log('\n📊 RELATÓRIO DE LIMPEZA:')
    console.log(`   Total de arquivos: ${results.length}`)
    console.log(`   ✅ Removidos com sucesso: ${successCount}`)
    console.log(`   ❌ Erros: ${errorCount}`)

    if (errorCount > 0) {
      console.log('\n❌ ERROS:')
      results
        .filter((r) => !r.success)
        .forEach((result) => {
          console.log(`   - ${result.file}: ${result.error}`)
        })
    }

    console.log('\n✅ Limpeza de arquivos de backup concluída!')
  } catch (error) {
    console.error('❌ Erro durante limpeza:', error)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanupBackupFiles()
}

module.exports = { cleanupBackupFiles }

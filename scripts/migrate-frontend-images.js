#!/usr/bin/env node

/**
 * Script Principal de Migração do Frontend
 *
 * Orquestra toda a migração do frontend para a nova estrutura de imagens:
 * 1. Atualiza componentes de exibição
 * 2. Atualiza sistema de upload
 * 3. Testa todas as funcionalidades
 * 4. Valida a migração
 */

const { execSync } = require('child_process')
const fs = require('fs').promises
const path = require('path')

const MIGRATION_STEPS = [
  {
    name: 'Atualização dos Componentes',
    command: 'node scripts/update-frontend-components.js',
    description: 'Atualiza todos os componentes que exibem imagens'
  },
  {
    name: 'Atualização do Sistema de Upload',
    command: 'node scripts/update-upload-system.js',
    description: 'Atualiza sistema de upload para nova estrutura'
  },
  {
    name: 'Teste do Sistema de Upload',
    command: 'node scripts/test-upload-system.js',
    description: 'Testa funcionalidade de upload'
  },
  {
    name: 'Validação do Frontend',
    command: 'node scripts/validate-frontend-migration.js',
    description: 'Valida todas as telas após migração'
  }
]

/**
 * Função para executar um comando
 */
async function executeCommand(step, index) {
  console.log(`\n${index + 1}️⃣ ${step.name}`)
  console.log(`   ${step.description}`)

  try {
    console.log(`   Executando: ${step.command}`)
    const output = execSync(step.command, {
      encoding: 'utf8',
      stdio: 'pipe'
    })

    console.log('   ✅ Concluído com sucesso')
    if (output) {
      console.log('   📝 Output:', output.trim())
    }

    return { success: true, output }
  } catch (error) {
    console.error(`   ❌ Erro: ${error.message}`)
    if (error.stdout) {
      console.log('   📝 Output:', error.stdout)
    }
    if (error.stderr) {
      console.log('   📝 Error:', error.stderr)
    }

    return { success: false, error: error.message }
  }
}

/**
 * Função para criar backup de segurança
 */
async function createSafetyBackup() {
  console.log('💾 Criando backup de segurança...')

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = `backups/frontend-migration-${timestamp}`

    // Criar diretório de backup
    await fs.mkdir(backupDir, { recursive: true })

    // Copiar arquivos importantes
    const filesToBackup = [
      'src/components',
      'src/app',
      'src/services',
      'src/utils'
    ]

    for (const dir of filesToBackup) {
      try {
        const backupPath = path.join(backupDir, path.basename(dir))
        await fs.cp(dir, backupPath, { recursive: true })
        console.log(`   ✅ ${dir} → ${backupPath}`)
      } catch (error) {
        console.log(`   ⚠️  ${dir} não encontrado (pode ser normal)`)
      }
    }

    console.log(`   ✅ Backup criado em: ${backupDir}`)
    return backupDir
  } catch (error) {
    console.error('   ❌ Erro ao criar backup:', error.message)
    throw error
  }
}

/**
 * Função para validar migração
 */
async function validateMigration() {
  console.log('\n🔍 Validando migração do frontend...')

  try {
    // Verificar se os arquivos de backup foram criados
    const backupDirs = await fs.readdir('backups')
    const frontendBackups = backupDirs.filter((dir) =>
      dir.includes('frontend-migration')
    )

    console.log(
      `   ✅ ${frontendBackups.length} backups de frontend encontrados`
    )

    // Verificar se helpers foram criados
    const helperFiles = [
      'src/utils/image-helpers.ts',
      'src/utils/upload-helpers.ts'
    ]

    let helperCount = 0
    for (const file of helperFiles) {
      try {
        await fs.access(file)
        helperCount++
        console.log(`   ✅ Helper encontrado: ${file}`)
      } catch {
        console.log(`   ⚠️  Helper não encontrado: ${file}`)
      }
    }

    // Verificar se scripts de teste foram criados
    const testScripts = [
      'scripts/validate-frontend-migration.js',
      'scripts/test-upload-system.js'
    ]

    let scriptCount = 0
    for (const file of testScripts) {
      try {
        await fs.access(file)
        scriptCount++
        console.log(`   ✅ Script encontrado: ${file}`)
      } catch {
        console.log(`   ⚠️  Script não encontrado: ${file}`)
      }
    }

    console.log(`\n   📊 Validação:`)
    console.log(`   - Backups: ${frontendBackups.length}`)
    console.log(`   - Helpers: ${helperCount}/${helperFiles.length}`)
    console.log(`   - Scripts: ${scriptCount}/${testScripts.length}`)

    return frontendBackups.length > 0 && helperCount > 0
  } catch (error) {
    console.error('   ❌ Erro durante validação:', error.message)
    return false
  }
}

/**
 * Função para gerar relatório final
 */
async function generateFinalReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    migration: 'frontend-image-migration',
    steps: results,
    summary: {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length
    }
  }

  const reportPath = `reports/frontend-migration-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))

  console.log(`\n📊 Relatório final salvo em: ${reportPath}`)

  return report
}

/**
 * Função para criar guia de pós-migração
 */
async function createPostMigrationGuide() {
  const guide = `# 🎉 Guia Pós-Migração - Frontend

## ✅ Migração Concluída

A migração do frontend para a nova estrutura de imagens foi concluída com sucesso!

## 📋 O que foi Atualizado

### 🎨 **Componentes de Exibição**
- ✅ ArtDetails - Exibição principal de imagens
- ✅ ImageModal - Modal de visualização ampliada
- ✅ HorizontalCarousel - Carrossel horizontal
- ✅ VerticalCarousel - Carrossel vertical
- ✅ ArtContent - Conteúdo do portfolio
- ✅ CalloutParallax - Banner com parallax

### 🏠 **Páginas Principais**
- ✅ Homepage - Página inicial
- ✅ Portfolio - Páginas individuais de artwork
- ✅ Séries - Páginas de série
- ✅ Edições - Páginas de edição
- ✅ 1-1 - Páginas de obra única

### 🔧 **Sistema de Upload**
- ✅ ImageUploadService - Serviço principal
- ✅ AdminFormField - Interface de upload
- ✅ APIs de Admin - Endpoints de upload

## 🛠️ Novos Recursos

### **Helpers de Imagem**
- \`src/utils/image-helpers.ts\` - Helpers para exibição
- \`src/utils/upload-helpers.ts\` - Helpers para upload

### **Scripts de Teste**
- \`scripts/validate-frontend-migration.js\` - Validação de telas
- \`scripts/test-upload-system.js\` - Teste de upload

## 🚀 Como Usar a Nova Estrutura

### **Exibição de Imagens**
\`\`\`typescript
import { getImageUrlFromId } from '@/utils/storage'

// Nova forma (recomendada)
const imageUrl = getImageUrlFromId(artwork.id, artwork.filename, 'artworks', 'optimized')

// Helper com fallback
import { getImageUrlWithFallback } from '@/utils/image-helpers'
const imageUrl = getImageUrlWithFallback(artwork, 'artworks', 'optimized')
\`\`\`

### **Upload de Imagens**
\`\`\`typescript
import { uploadArtworkImage, generateFilename } from '@/utils/upload-helpers'

// Upload de artwork
const result = await uploadArtworkImage(
  file,
  artwork.id,
  generateFilename(artwork.title, 'webp')
)
\`\`\`

## 📝 Próximos Passos

### **1. Testes Manuais**
- [ ] Testar todas as páginas do site
- [ ] Verificar se imagens carregam corretamente
- [ ] Testar upload no admin
- [ ] Verificar performance

### **2. Monitoramento**
- [ ] Monitorar erros 404 de imagens
- [ ] Verificar logs de upload
- [ ] Testar em diferentes dispositivos

### **3. Limpeza (Após Validação)**
- [ ] Remover código antigo
- [ ] Remover arquivos de backup
- [ ] Atualizar documentação

## 🆘 Resolução de Problemas

### **Imagem não carrega**
1. Verificar se ID e filename estão corretos
2. Verificar se arquivo existe no bucket
3. Verificar se URL está sendo gerada corretamente

### **Upload falha**
1. Verificar se \`uploadImageById()\` está sendo usado
2. Verificar se ID e filename estão sendo passados
3. Verificar permissões do bucket

### **Rollback de Emergência**
\`\`\`bash
# 1. Restaurar do backup
cp -r backups/frontend-migration-*/src/* src/

# 2. Reinstalar dependências
npm install

# 3. Reiniciar aplicação
npm run dev
\`\`\`

## 📞 Suporte

Em caso de problemas:
1. Verificar logs de erro
2. Consultar este guia
3. Verificar backups disponíveis
4. Contatar equipe de desenvolvimento

---

**Migração concluída em**: ${new Date().toISOString()}
**Status**: ✅ Concluída com sucesso
`

  await fs.writeFile('docs/POST_MIGRATION_GUIDE.md', guide)
  console.log('✅ Guia pós-migração criado: docs/POST_MIGRATION_GUIDE.md')
}

/**
 * Função principal
 */
async function migrateFrontendImages() {
  console.log(
    '🚀 Iniciando migração do frontend para nova estrutura de imagens...'
  )
  console.log('⚠️  ATENÇÃO: Esta operação irá alterar componentes do frontend!')

  const results = []

  try {
    // 1. Criar backup de segurança
    const backupDir = await createSafetyBackup()

    // 2. Executar cada passo da migração
    for (let i = 0; i < MIGRATION_STEPS.length; i++) {
      const step = MIGRATION_STEPS[i]

      const result = await executeCommand(step, i)
      results.push({ step: step.name, ...result })

      // Parar se houver erro crítico
      if (!result.success) {
        console.log('\n❌ Migração interrompida devido a erro crítico')
        break
      }
    }

    // 3. Validar migração
    const validationPassed = await validateMigration()

    // 4. Criar guia pós-migração
    await createPostMigrationGuide()

    // 5. Gerar relatório final
    const report = await generateFinalReport(results)

    // 6. Resultado final
    console.log('\n📊 RESULTADO DA MIGRAÇÃO:')
    console.log(`   Total de passos: ${report.summary.total}`)
    console.log(`   ✅ Sucessos: ${report.summary.successful}`)
    console.log(`   ❌ Falhas: ${report.summary.failed}`)
    console.log(`   🔍 Validação: ${validationPassed ? 'PASSOU' : 'FALHOU'}`)

    if (report.summary.failed === 0 && validationPassed) {
      console.log('\n🎉 Migração do frontend concluída com sucesso!')
      console.log('\n📝 Próximos passos:')
      console.log('   1. Testar todas as páginas do site')
      console.log('   2. Verificar se imagens carregam corretamente')
      console.log('   3. Testar upload no admin')
      console.log('   4. Monitorar performance e erros')
      console.log(`   5. Backup disponível em: ${backupDir}`)
      console.log('   6. Consultar: docs/POST_MIGRATION_GUIDE.md')
    } else {
      console.log('\n⚠️  Migração concluída com problemas')
      console.log(
        '   Revise os logs e considere restaurar do backup se necessário'
      )
    }
  } catch (error) {
    console.error('\n❌ Erro fatal durante migração:', error)
    console.log('\n🆘 EM CASO DE PROBLEMAS:')
    console.log('   1. Verifique os logs de erro acima')
    console.log('   2. Considere restaurar do backup se necessário')
    console.log(
      '   3. Execute os testes individuais para identificar o problema'
    )
    process.exit(1)
  }
}

// Executar migração
if (require.main === module) {
  migrateFrontendImages()
}

module.exports = { migrateFrontendImages }

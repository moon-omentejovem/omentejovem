#!/usr/bin/env node
/**
 * 📋 Show Scripts Structure
 *
 * Mostra a estrutura organizada dos scripts
 */

import fs from 'fs'
import path from 'path'

const scriptsDir = process.cwd() + '/scripts'

function getScripts(dir) {
  try {
    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith('.js') || file.endsWith('.sql'))
      .sort()
  } catch (err) {
    return []
  }
}

function showStructure() {
  console.log('🎨 ESTRUTURA DOS SCRIPTS OMENTEJOVEM')
  console.log('=====================================\n')

  const categories = [
    {
      name: 'legacy',
      icon: '🗄️',
      desc: 'Scripts de Migração Legacy',
      essential: ['migrate-legacy-data.js', 'migrate-essential-nft-data.js']
    },
    {
      name: 'migration',
      icon: '🚀',
      desc: 'Scripts de Migração de Conteúdo',
      essential: ['migrate-images.js', 'migrate-large-images.js']
    },
    {
      name: 'analysis',
      icon: '📊',
      desc: 'Scripts de Análise e Relatórios',
      essential: ['complete-migration-summary.js', 'migration-report.js']
    },
    {
      name: 'maintenance',
      icon: '🔧',
      desc: 'Scripts de Manutenção',
      essential: ['cleanup.js']
    },
    {
      name: 'utils',
      icon: '🛠️',
      desc: 'Scripts Utilitários',
      essential: [
        'health-check.js',
        'backup-database.js',
        'deploy-helper.js',
        'vercel-seed.js'
      ]
    },
    {
      name: 'debug',
      icon: '🐛',
      desc: 'Scripts de Debug',
      essential: []
    }
  ]

  categories.forEach((category) => {
    const categoryDir = path.join(scriptsDir, category.name)
    const scripts = getScripts(categoryDir)

    console.log(`${category.icon} ${category.desc.toUpperCase()}`)
    console.log(`📁 scripts/${category.name}/`)

    if (scripts.length === 0) {
      console.log('   (vazia)\n')
      return
    }

    scripts.forEach((script) => {
      const isEssential = category.essential.includes(script)
      const status = isEssential ? '✅ ESSENCIAL' : '📋 DISPONÍVEL'
      console.log(`   ${status} ${script}`)
    })

    console.log('')
  })

  // Scripts na raiz
  const rootScripts = getScripts(scriptsDir)
  if (rootScripts.length > 0) {
    console.log('📄 ARQUIVOS NA RAIZ')
    rootScripts.forEach((script) => {
      console.log(`   📋 ${script}`)
    })
    console.log('')
  }

  // Contagem total
  let totalScripts = 0
  let essentialScripts = 0

  categories.forEach((category) => {
    const categoryDir = path.join(scriptsDir, category.name)
    const scripts = getScripts(categoryDir)
    totalScripts += scripts.length
    essentialScripts += scripts.filter((s) =>
      category.essential.includes(s)
    ).length
  })

  console.log('📊 RESUMO')
  console.log('=========')
  console.log(`📦 Total de scripts: ${totalScripts}`)
  console.log(`⭐ Scripts essenciais: ${essentialScripts}`)
  console.log(`📁 Categorias: ${categories.length}`)
  console.log(`📝 READMEs: ${categories.length + 1} (+ principal)`)

  console.log('\n🎯 PRÓXIMOS PASSOS')
  console.log('==================')
  console.log('1. Revisar READMEs de cada categoria')
  console.log('2. Testar scripts essenciais')
  console.log('3. Configurar automações de deploy')
  console.log('4. Estabelecer rotinas de manutenção')

  console.log('\n⚡ COMANDOS RÁPIDOS')
  console.log('===================')
  console.log('# Health check do sistema')
  console.log('node scripts/utils/health-check.js')
  console.log('')
  console.log('# Relatório completo')
  console.log('node scripts/analysis/complete-migration-summary.js')
  console.log('')
  console.log('# Backup do sistema')
  console.log('node scripts/utils/backup-database.js')
  console.log('')
  console.log('# Limpeza preventiva')
  console.log('node scripts/maintenance/cleanup.js --dry-run')
}

showStructure()

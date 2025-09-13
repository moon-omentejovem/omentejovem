#!/usr/bin/env node

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const execAsync = promisify(exec)
const STAGING_URL = 'https://omentejovem-staging.vercel.app/'

async function createReportsDir(timestamp) {
  const reportsDir = path.join(__dirname, '..', 'lighthouse-reports', 'staging', timestamp)
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }
  
  return reportsDir
}

async function runLighthouseDesktop(url, outputDir) {
  console.log('🖥️  Executando teste Desktop...')
  
  const htmlPath = path.join(outputDir, 'lighthouse-desktop.report.html')
  const jsonPath = path.join(outputDir, 'lighthouse-desktop.report.json')
  
  const command = `npx lighthouse "${url}" --preset=desktop --output=html,json --output-path="${path.join(outputDir, 'lighthouse-desktop')}" --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"`
  
  try {
    await execAsync(command)
    return { htmlPath, jsonPath }
  } catch (error) {
    console.error('Erro no teste Desktop:', error.message)
    throw error
  }
}

async function runLighthouseMobile(url, outputDir) {
  console.log('📱 Executando teste Mobile...')
  
  const htmlPath = path.join(outputDir, 'lighthouse-mobile.report.html')
  const jsonPath = path.join(outputDir, 'lighthouse-mobile.report.json')
  
  const command = `npx lighthouse "${url}" --output=html,json --output-path="${path.join(outputDir, 'lighthouse-mobile')}" --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"`
  
  try {
    await execAsync(command)
    return { htmlPath, jsonPath }
  } catch (error) {
    console.error('Erro no teste Mobile:', error.message)
    throw error
  }
}

function getScoresFromReport(jsonPath) {
  try {
    const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    const categories = report.categories
    
    return {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      'best-practices': Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
      pwa: categories.pwa ? Math.round(categories.pwa.score * 100) : 'N/A'
    }
  } catch (error) {
    console.error('Erro ao ler relatório:', error.message)
    return null
  }
}

function printSummary(scores, device) {
  if (!scores) return
  
  console.log(`\n📊 Resultados para ${device.toUpperCase()}:`)
  console.log(`   Performance: ${scores.performance}%`)
  console.log(`   Accessibility: ${scores.accessibility}%`)
  console.log(`   Best Practices: ${scores['best-practices']}%`)
  console.log(`   SEO: ${scores.seo}%`)
  console.log(`   PWA: ${scores.pwa}%`)
}

async function main() {
  const now = new Date()
  const date = now.toISOString().split('T')[0] // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
  const timestamp = `${date}_${time}`
  
  console.log(`🔍 Testando ${STAGING_URL} em ${timestamp}`)
  
  try {
    const outputDir = await createReportsDir(timestamp)
    
    // Teste Desktop
    const desktopPaths = await runLighthouseDesktop(STAGING_URL, outputDir)
    const desktopScores = getScoresFromReport(desktopPaths.jsonPath)
    printSummary(desktopScores, 'desktop')
    
    // Teste Mobile  
    const mobilePaths = await runLighthouseMobile(STAGING_URL, outputDir)
    const mobileScores = getScoresFromReport(mobilePaths.jsonPath)
    printSummary(mobileScores, 'mobile')

    console.log('\n✅ Relatórios salvos em:')
    console.log(`   Desktop: ${desktopPaths.htmlPath}`)
    console.log(`   Mobile: ${mobilePaths.htmlPath}`)
    console.log(`\n📁 Pasta: lighthouse-reports/staging/${timestamp}/`)

  } catch (error) {
    console.error('❌ Erro ao executar Lighthouse:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

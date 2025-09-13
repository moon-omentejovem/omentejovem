const fs = require('fs')
const path = require('path')

// Lista de scripts para converter
const scriptsToConvert = [
  'scripts/analysis/analyze-token-id-integrity.js',
  'scripts/analysis/verify-data-consistency.js',
  'scripts/analysis/complete-migration-summary.js',
  'scripts/utils/health-check.js',
  'scripts/utils/backup-database.js',
  'scripts/utils/deploy-helper.js',
  'scripts/utils/vercel-seed.js',
  'scripts/legacy/migrate-legacy-data.js',
  'scripts/legacy/migrate-essential-nft-data.js',
  'scripts/migration/migrate-images.js',
  'scripts/migration/migrate-large-images.js',
  'scripts/migration/migrate-video-urls.js',
  'scripts/migration/migrate-about-page.js',
  'scripts/maintenance/cleanup.js',
  'scripts/maintenance/data-tools.js',
  'scripts/maintenance/enhance-data.js',
  'scripts/test-connection.js',
  'scripts/quick-analysis.js'
]

function convertToCommonJS(filePath) {
  console.log(`Converting: ${filePath}`)
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found: ${filePath}`)
    return
  }
  
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Convert imports
  content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g, 'const { $1 } = require(\'$2\')')
  content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require(\'$2\')')
  content = content.replace(/import\s+['"]([^'"]+)['"]/g, 'require(\'$1\')')
  
  // Convert export default
  content = content.replace(/export\s+default\s+(\w+)/g, 'module.exports = $1')
  content = content.replace(/export\s+{\s*([^}]+)\s*}/g, 'module.exports = { $1 }')
  
  // Remove ES module specific code
  content = content.replace(/import\s*{\s*fileURLToPath\s*}\s*from\s*['"]url['"]/g, '')
  content = content.replace(/const\s+__filename\s*=\s*fileURLToPath\(import\.meta\.url\)/g, '')
  content = content.replace(/const\s+__dirname\s*=\s*path\.dirname\(__filename\)/g, '')
  
  // Fix import.meta.url conditions
  content = content.replace(/if\s*\(\s*import\.meta\.url\s*===\s*`file:\/\/\$\{process\.argv\[1\].*?\}\`\s*\)/g, 'if (require.main === module)')
  
  // Fix dynamic imports
  content = content.replace(/import\(['"]fs['"]\)\.then\(fs\s*=>\s*\{[^}]*fs\.writeFileSync\(([^,]+),([^)]+)\)[^}]*\}\)/g, 'fs.writeFileSync($1, $2)')
  content = content.replace(/import\(['"]fs['"]\)\.then\(([^=]+)\s*=>\s*\{[^}]*\1\.writeFileSync\(([^,]+),([^)]+)\)[^}]*\}\)/g, 'fs.writeFileSync($2, $3)')
  
  // Write the converted content
  fs.writeFileSync(filePath, content)
  console.log(`  ✅ Converted successfully`)
}

console.log('🔄 Converting ES modules to CommonJS...\n')

scriptsToConvert.forEach(convertToCommonJS)

console.log('\n✅ All scripts converted to CommonJS!')
console.log('\n🧪 Test the conversion with:')
console.log('node scripts/utils/health-check.js')

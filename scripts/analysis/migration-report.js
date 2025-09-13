const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const { resolve } = require('path')

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Generate migration status report
async function generateMigrationReport() {
  console.log('📊 Image Migration Status Report\n')
  
  try {
    // Get all artworks
    const { data: allArtworks, error: allError } = await supabase
      .from('artworks')
      .select('id, title, slug, image_url')
      .order('created_at', { ascending: true })
    
    if (allError) throw allError
    
    // Categorize artworks by image URL status
    const migrated = []
    const external = []
    const localhost = []
    
    allArtworks.forEach(artwork => {
      if (artwork.image_url.includes(supabaseUrl)) {
        migrated.push(artwork)
      } else if (artwork.image_url.includes('localhost')) {
        localhost.push(artwork)
      } else {
        external.push(artwork)
      }
    })
    
    // Summary
    console.log('📋 Migration Summary:')
    console.log(`✅ Total artworks: ${allArtworks.length}`)
    console.log(`🎉 Migrated to Supabase: ${migrated.length}`)
    console.log(`🌐 Still external: ${external.length}`)
    console.log(`🏠 Localhost URLs: ${localhost.length}`)
    
    // Migration percentage
    const migrationPercentage = ((migrated.length / (allArtworks.length - localhost.length)) * 100).toFixed(1)
    console.log(`📈 Migration Progress: ${migrationPercentage}% (excluding localhost)`)
    
    // Migrated artworks details
    if (migrated.length > 0) {
      console.log('\n✅ Successfully Migrated:')
      migrated.slice(0, 10).forEach((artwork, index) => {
        console.log(`  ${index + 1}. ${artwork.title}`)
      })
      if (migrated.length > 10) {
        console.log(`  ... and ${migrated.length - 10} more`)
      }
    }
    
    // External URLs still remaining
    if (external.length > 0) {
      console.log('\n🌐 Still Need Migration:')
      
      // Group by domain
      const domainGroups = {}
      external.forEach(artwork => {
        try {
          const domain = new URL(artwork.image_url).hostname
          if (!domainGroups[domain]) domainGroups[domain] = []
          domainGroups[domain].push(artwork)
        } catch (error) {
          if (!domainGroups['invalid']) domainGroups['invalid'] = []
          domainGroups['invalid'].push(artwork)
        }
      })
      
      Object.entries(domainGroups).forEach(([domain, artworks]) => {
        console.log(`\n  📍 ${domain} (${artworks.length} images):`)
        artworks.slice(0, 5).forEach(artwork => {
          console.log(`    - ${artwork.title}`)
        })
        if (artworks.length > 5) {
          console.log(`    ... and ${artworks.length - 5} more`)
        }
      })
    }
    
    // Localhost URLs
    if (localhost.length > 0) {
      console.log('\n🏠 Localhost URLs (need manual upload):')
      localhost.forEach(artwork => {
        console.log(`  - ${artwork.title}: ${artwork.image_url}`)
      })
    }
    
    // Storage usage report
    console.log('\n💾 Storage Usage:')
    
    // Check raw folder
    const { data: rawFiles, error: rawError } = await supabase.storage
      .from('media')
      .list('artworks/raw', { limit: 1000 })
    
    if (rawError) {
      console.log(`  ⚠️  Could not check raw storage: ${rawError.message}`)
    } else {
      console.log(`  📁 Raw images: ${rawFiles.length} files`)
    }
    
    // Check optimized folder
    const { data: optimizedFiles, error: optError } = await supabase.storage
      .from('media')
      .list('artworks/optimized', { limit: 1000 })
    
    if (optError) {
      console.log(`  ⚠️  Could not check optimized storage: ${optError.message}`)
    } else {
      console.log(`  🔧 Optimized images: ${optimizedFiles.length} files`)
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:')
    
    if (external.length > 0) {
      console.log(`  • Run migration again to process ${external.length} remaining external URLs`)
      console.log('  • For failed large files, consider manual resize before migration')
    }
    
    if (localhost.length > 0) {
      console.log(`  • Upload ${localhost.length} localhost images manually through admin panel`)
    }
    
    if (migrated.length === (allArtworks.length - localhost.length)) {
      console.log('  🎉 All external images have been migrated successfully!')
    }
    
    console.log('\n📊 Report completed!')
    
  } catch (error) {
    console.error('❌ Report generation failed:', error.message)
    process.exit(1)
  }
}

// List failed migrations (images that couldn't be migrated)
async function listFailedMigrations() {
  console.log('🔍 Checking for failed migrations...\n')
  
  try {
    // Get external URLs that are likely to have failed
    const { data: external, error } = await supabase
      .from('artworks')
      .select('title, image_url')
      .not('image_url', 'like', `%${supabaseUrl}%`)
      .not('image_url', 'like', '/%')
      .not('image_url', 'like', '%localhost%')
    
    if (error) throw error
    
    if (external.length === 0) {
      console.log('🎉 No failed migrations found - all external images have been migrated!')
      return
    }
    
    console.log(`⚠️  Found ${external.length} images that may have failed migration:\n`)
    
    external.forEach((artwork, index) => {
      console.log(`${index + 1}. ${artwork.title}`)
      console.log(`   URL: ${artwork.image_url}`)
      console.log(`   Domain: ${new URL(artwork.image_url).hostname}`)
      console.log('')
    })
    
    console.log('\nTo retry these migrations, run:')
    console.log('node scripts/migrate-images.js')
    
  } catch (error) {
    console.error('❌ Failed migration check failed:', error.message)
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'failed':
    case '--failed':
      await listFailedMigrations()
      break
    case 'report':
    case '--report':
    default:
      await generateMigrationReport()
      break
  }
}

// Execute if run directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Operation completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Operation failed:', error)
      process.exit(1)
    })
}

module.exports = { generateMigrationReport, listFailedMigrations }

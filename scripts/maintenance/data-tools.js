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

// Function to verify data integrity
async function verifyDataIntegrity() {
  console.log('🔍 Verifying data integrity...\n')

  try {
    // 1. Check total artworks
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('*', { count: 'exact' })

    if (artworksError) throw artworksError

    console.log(`📊 Total artworks: ${artworks.length}`)

    // 2. Check total series
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('*', { count: 'exact' })

    if (seriesError) throw seriesError

    console.log(`📦 Total series: ${series.length}`)

    // 3. Check series-artwork relationships
    const { data: relationships, error: relError } = await supabase
      .from('series_artworks')
      .select('*', { count: 'exact' })

    if (relError) throw relError

    console.log(
      `🔗 Total series-artwork relationships: ${relationships.length}`
    )

    // 4. Artworks by type
    const { data: typeBreakdown, error: typeError } = await supabase
      .from('artworks')
      .select('type')

    if (typeError) throw typeError

    const typeCounts = typeBreakdown.reduce((acc, artwork) => {
      acc[artwork.type] = (acc[artwork.type] || 0) + 1
      return acc
    }, {})

    console.log('\n📋 Artworks by type:')
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })

    // 5. Featured artworks
    const { data: featured, error: featuredError } = await supabase
      .from('artworks')
      .select('title, slug')
      .eq('is_featured', true)

    if (featuredError) throw featuredError

    console.log('\n⭐ Featured artworks:')
    featured.forEach((artwork) => {
      console.log(`  - ${artwork.title} (${artwork.slug})`)
    })

    // 6. Series with artwork counts
    const { data: seriesWithCounts, error: countsError } = await supabase.from(
      'series'
    ).select(`
        name,
        slug,
        series_artworks(count)
      `)

    if (countsError) throw countsError

    console.log('\n📦 Series with artwork counts:')
    seriesWithCounts.forEach((s) => {
      const count = s.series_artworks?.[0]?.count || 0
      console.log(`  - ${s.name}: ${count} artworks`)
    })

    // 7. Check for potential issues
    console.log('\n🔍 Checking for potential issues...')

    // Missing images
    const { data: missingImages, error: imgError } = await supabase
      .from('artworks')
      .select('title, slug')
      .or('image_url.is.null,image_url.eq.')

    if (imgError) throw imgError

    if (missingImages.length > 0) {
      console.log(`⚠️  ${missingImages.length} artworks missing images:`)
      missingImages.forEach((artwork) => {
        console.log(`    - ${artwork.title}`)
      })
    } else {
      console.log('✅ All artworks have images')
    }

    // Missing mint links
    const { data: missingLinks, error: linkError } = await supabase
      .from('artworks')
      .select('title, slug')
      .or('mint_link.is.null,mint_link.eq.')

    if (linkError) throw linkError

    if (missingLinks.length > 0) {
      console.log(`⚠️  ${missingLinks.length} artworks missing mint links:`)
      missingLinks.forEach((artwork) => {
        console.log(`    - ${artwork.title}`)
      })
    } else {
      console.log('✅ All artworks have mint links')
    }

    // Duplicate slugs check
    const { data: slugCheck, error: slugError } = await supabase
      .rpc('check_duplicate_slugs')
      .select()

    // If RPC doesn't exist, do manual check
    const slugCounts = artworks.reduce((acc, artwork) => {
      acc[artwork.slug] = (acc[artwork.slug] || 0) + 1
      return acc
    }, {})

    const duplicateSlugs = Object.entries(slugCounts).filter(
      ([slug, count]) => count > 1
    )

    if (duplicateSlugs.length > 0) {
      console.log(`⚠️  ${duplicateSlugs.length} duplicate slugs found:`)
      duplicateSlugs.forEach(([slug, count]) => {
        console.log(`    - ${slug}: ${count} occurrences`)
      })
    } else {
      console.log('✅ All slugs are unique')
    }

    console.log('\n✅ Data integrity verification completed!')
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  }
}

// Function to clean all migrated data
async function cleanMigratedData() {
  console.log('🧹 Cleaning all migrated data...')

  try {
    const confirmClean = process.argv.includes('--confirm')

    if (!confirmClean) {
      console.log(
        '⚠️  This will delete ALL artworks, series, and relationships!'
      )
      console.log(
        '⚠️  Add --confirm flag to proceed: node scripts/data-tools.js clean --confirm'
      )
      return
    }

    // Delete in correct order to respect foreign key constraints
    console.log('🗑️  Deleting series-artwork relationships...')
    const { error: relError } = await supabase
      .from('series_artworks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (relError) throw relError

    console.log('🗑️  Deleting artworks...')
    const { error: artworksError } = await supabase
      .from('artworks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (artworksError) throw artworksError

    console.log('🗑️  Deleting series...')
    const { error: seriesError } = await supabase
      .from('series')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (seriesError) throw seriesError

    console.log('✅ All migrated data cleaned successfully!')
    console.log('💡 You can now run the migration script again.')
  } catch (error) {
    console.error('❌ Cleaning failed:', error.message)
    process.exit(1)
  }
}

// Function to export data as backup
async function exportDataBackup() {
  console.log('💾 Exporting data backup...')

  try {
    // Get all data
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at')

    if (artworksError) throw artworksError

    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('*')
      .order('created_at')

    if (seriesError) throw seriesError

    const { data: relationships, error: relError } = await supabase
      .from('series_artworks')
      .select('*')
      .order('created_at')

    if (relError) throw relError

    const backupData = {
      exported_at: new Date().toISOString(),
      counts: {
        artworks: artworks.length,
        series: series.length,
        relationships: relationships.length
      },
      data: {
        artworks,
        series,
        relationships
      }
    }

    const fs = require('fs')
    const path = require('path')

    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir)
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `supabase-backup-${timestamp}.json`
    const filepath = path.join(backupDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2))

    console.log(`✅ Backup exported to: ${filepath}`)
    console.log(
      `📊 Exported ${artworks.length} artworks, ${series.length} series, ${relationships.length} relationships`
    )
  } catch (error) {
    console.error('❌ Export failed:', error.message)
    process.exit(1)
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case 'verify':
      await verifyDataIntegrity()
      break
    case 'clean':
      await cleanMigratedData()
      break
    case 'export':
      await exportDataBackup()
      break
    default:
      console.log('🛠️  Data Tools - Omentejovem')
      console.log('')
      console.log('Available commands:')
      console.log('  verify  - Verify data integrity and show statistics')
      console.log('  clean   - Clean all migrated data (requires --confirm)')
      console.log('  export  - Export data as backup JSON')
      console.log('')
      console.log('Examples:')
      console.log('  node scripts/data-tools.js verify')
      console.log('  node scripts/data-tools.js clean --confirm')
      console.log('  node scripts/data-tools.js export')
      break
  }
}

// Execute if run directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = {
  verifyDataIntegrity,
  cleanMigratedData,
  exportDataBackup
}

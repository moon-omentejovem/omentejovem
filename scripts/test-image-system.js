#!/usr/bin/env node
/**
 * 🧪 Image Management System Test Script
 *
 * This script helps test the new slug-based image management system
 * and provides validation before full migration
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Test slug generation
 */
function testSlugGeneration() {
  console.log('🧪 Testing slug generation...\n')
  
  const testCases = [
    'The Amazing NFT Art',
    'Série #1: Digital Dreams',
    'Test-Image_with-special!chars@123',
    'àcentos é ûnícödé tést',
    'Multiple   Spaces    Between Words'
  ]

  testCases.forEach(input => {
    const slug = generateSlug(input)
    console.log(`Input: "${input}"`)
    console.log(`Slug:  "${slug}"`)
    console.log(`URLs:  optimized -> artworks/optimized/${slug}.webp`)
    console.log(`       raw -> artworks/raw/${slug}-raw.jpg`)
    console.log('')
  })
}

function generateSlug(input) {
  if (!input) return ''
  
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, '') // Remove hífens do início e fim
}

/**
 * Check if storage bucket and folders exist
 */
async function testStorageStructure() {
  console.log('📁 Testing storage structure...\n')

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Error listing buckets:', error.message)
      return false
    }

    const mediaBucket = buckets.find(b => b.name === 'media')
    if (!mediaBucket) {
      console.error('❌ Media bucket not found')
      return false
    }

    console.log('✅ Media bucket exists')

    // Test folder structure
    const foldersToCheck = [
      'artworks/optimized',
      'artworks/raw',
      'series/optimized',
      'series/raw',
      'artifacts/optimized',
      'artifacts/raw'
    ]

    for (const folder of foldersToCheck) {
      const { data, error } = await supabase.storage
        .from('media')
        .list(folder, { limit: 1 })
      
      if (error && !error.message.includes('not found')) {
        console.log(`⚠️  Folder ${folder} might not exist (${error.message})`)
      } else {
        console.log(`✅ Folder ${folder} is accessible`)
      }
    }

    return true
  } catch (error) {
    console.error('❌ Storage test failed:', error.message)
    return false
  }
}

/**
 * Test database functions
 */
async function testDatabaseFunctions() {
  console.log('\n🗃️ Testing database functions...\n')

  try {
    // Test artwork image path generation
    const { data: artworkTest, error: artworkError } = await supabase
      .rpc('get_image_path', { slug_value: 'test-artwork', image_type: 'optimized' })

    if (artworkError) {
      console.log('⚠️  get_image_path function not yet available (needs migration)')
    } else {
      console.log('✅ get_image_path function working:', artworkTest)
    }

    // Test series image path generation
    const { data: seriesTest, error: seriesError } = await supabase
      .rpc('get_series_image_path', { slug_value: 'test-series', image_type: 'optimized' })

    if (seriesError) {
      console.log('⚠️  get_series_image_path function not yet available (needs migration)')
    } else {
      console.log('✅ get_series_image_path function working:', seriesTest)
    }

    return true
  } catch (error) {
    console.error('❌ Database function test failed:', error.message)
    return false
  }
}

/**
 * Validate existing artworks have slugs
 */
async function validateArtworkSlugs() {
  console.log('\n🎨 Validating artwork slugs...\n')

  try {
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, slug')
      .limit(10)

    if (error) {
      console.error('❌ Error fetching artworks:', error.message)
      return false
    }

    console.log(`Found ${artworks.length} artworks (showing first 10):\n`)

    let validSlugs = 0
    let invalidSlugs = 0

    artworks.forEach(artwork => {
      if (artwork.slug && artwork.slug.trim() !== '') {
        console.log(`✅ "${artwork.title}" → slug: "${artwork.slug}"`)
        validSlugs++
      } else {
        console.log(`❌ "${artwork.title}" → missing or empty slug`)
        invalidSlugs++
      }
    })

    console.log(`\n📊 Slug validation summary:`)
    console.log(`   ✅ Valid slugs: ${validSlugs}`)
    console.log(`   ❌ Invalid slugs: ${invalidSlugs}`)

    if (invalidSlugs > 0) {
      console.log('\n⚠️  Some artworks have missing slugs. Generate slugs first before migration.')
    }

    return invalidSlugs === 0
  } catch (error) {
    console.error('❌ Slug validation failed:', error.message)
    return false
  }
}

/**
 * Generate missing slugs
 */
async function generateMissingSlugs() {
  console.log('\n🔧 Generating missing slugs...\n')

  try {
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, slug')
      .or('slug.is.null,slug.eq.')

    if (error) {
      console.error('❌ Error fetching artworks with missing slugs:', error.message)
      return false
    }

    if (artworks.length === 0) {
      console.log('✅ All artworks already have slugs')
      return true
    }

    console.log(`Found ${artworks.length} artworks with missing slugs:\n`)

    for (const artwork of artworks) {
      const newSlug = generateSlug(artwork.title)
      
      console.log(`🔧 "${artwork.title}" → generating slug: "${newSlug}"`)

      const { error: updateError } = await supabase
        .from('artworks')
        .update({ slug: newSlug })
        .eq('id', artwork.id)

      if (updateError) {
        console.error(`   ❌ Failed to update slug: ${updateError.message}`)
      } else {
        console.log(`   ✅ Slug updated successfully`)
      }
    }

    console.log('\n✅ Slug generation completed')
    return true
  } catch (error) {
    console.error('❌ Slug generation failed:', error.message)
    return false
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🧪 Image Management System Test Suite\n')
  console.log('This script validates the new slug-based image system\n')

  const args = process.argv.slice(2)
  
  if (args.includes('--generate-slugs')) {
    await generateMissingSlugs()
    return
  }

  // Run all tests
  console.log('Running all validation tests...\n')

  testSlugGeneration()
  
  const storageOk = await testStorageStructure()
  const dbOk = await testDatabaseFunctions()
  const slugsOk = await validateArtworkSlugs()

  console.log('\n📊 Test Summary:')
  console.log(`   📁 Storage structure: ${storageOk ? '✅' : '❌'}`)
  console.log(`   🗃️  Database functions: ${dbOk ? '✅' : '⚠️'}`)
  console.log(`   🎨 Artwork slugs: ${slugsOk ? '✅' : '❌'}`)

  if (!slugsOk) {
    console.log('\n💡 To fix missing slugs, run:')
    console.log('   node scripts/test-image-system.js --generate-slugs')
  }

  if (!dbOk) {
    console.log('\n💡 To enable database functions, apply the migration:')
    console.log('   supabase db push')
  }

  console.log('\n🚀 Next steps after all tests pass:')
  console.log('   1. Apply initial migration: supabase db push')
  console.log('   2. Run image migration: node scripts/migrate-to-slug-based-images.js')
  console.log('   3. Test upload in admin panel')
  console.log('   4. Apply cleanup migration to remove old columns')
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main, generateMissingSlugs, testStorageStructure }
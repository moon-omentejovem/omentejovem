#!/usr/bin/env node
/**
 * 🖼️ Migration to Slug-Based Image Management
 *
 * This script migrates existing image storage to use slug-based paths
 * and removes the need to store paths in the database
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Generate clean slug from text
 */
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
 * Move image to new slug-based location
 */
async function moveImageToSlugPath(oldPath, newPath) {
  try {
    // Check if old file exists
    const { data: oldFile, error: oldError } = await supabase.storage
      .from('media')
      .download(oldPath)
    
    if (oldError) {
      console.log(`   ⚠️ Old file not found: ${oldPath}`)
      return false
    }

    // Upload to new location
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(newPath, oldFile, { upsert: true })

    if (uploadError) {
      console.error(`   ❌ Failed to upload to ${newPath}:`, uploadError.message)
      return false
    }

    // Remove old file
    const { error: removeError } = await supabase.storage
      .from('media')
      .remove([oldPath])

    if (removeError) {
      console.warn(`   ⚠️ Failed to remove old file ${oldPath}:`, removeError.message)
    }

    console.log(`   ✅ Moved: ${oldPath} → ${newPath}`)
    return true
  } catch (error) {
    console.error(`   ❌ Error moving ${oldPath}:`, error.message)
    return false
  }
}

/**
 * Migrate artwork images to slug-based paths
 */
async function migrateArtworkImages() {
  console.log('📸 Migrating artwork images to slug-based paths...\n')

  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('id, slug, title, image_path, raw_image_path')
    .not('image_path', 'is', null)

  if (error) {
    console.error('Failed to fetch artworks:', error)
    return
  }

  console.log(`Found ${artworks.length} artworks with images to migrate\n`)

  let migrated = 0
  let skipped = 0

  for (const artwork of artworks) {
    console.log(`🎨 Processing: ${artwork.title}`)
    console.log(`   Slug: ${artwork.slug}`)

    const newOptimizedPath = `artworks/optimized/${artwork.slug}.webp`
    const newRawPath = `artworks/raw/${artwork.slug}-raw.jpg`

    let success = true

    // Migrate optimized image
    if (artwork.image_path) {
      console.log(`   Optimized: ${artwork.image_path} → ${newOptimizedPath}`)
      const moved = await moveImageToSlugPath(artwork.image_path, newOptimizedPath)
      if (!moved) success = false
    }

    // Migrate raw image
    if (artwork.raw_image_path) {
      console.log(`   Raw: ${artwork.raw_image_path} → ${newRawPath}`)
      const moved = await moveImageToSlugPath(artwork.raw_image_path, newRawPath)
      if (!moved) success = false
    }

    if (success) {
      migrated++
      console.log('   ✅ Successfully migrated')
    } else {
      skipped++
      console.log('   ⚠️ Partially migrated or failed')
    }
    
    console.log('')
  }

  console.log('📊 Artwork Migration Summary:')
  console.log(`   ✅ Successfully migrated: ${migrated}`)
  console.log(`   ⚠️ Skipped/Failed: ${skipped}\n`)
}

/**
 * Migrate series images to slug-based paths
 */
async function migrateSeriesImages() {
  console.log('📚 Migrating series images to slug-based paths...\n')

  const { data: series, error } = await supabase
    .from('series')
    .select('id, slug, name, cover_image_path')
    .not('cover_image_path', 'is', null)

  if (error) {
    console.error('Failed to fetch series:', error)
    return
  }

  console.log(`Found ${series.length} series with images to migrate\n`)

  let migrated = 0
  let skipped = 0

  for (const serie of series) {
    console.log(`📚 Processing: ${serie.name}`)
    console.log(`   Slug: ${serie.slug}`)

    const newPath = `series/optimized/${serie.slug}.webp`
    
    console.log(`   Cover: ${serie.cover_image_path} → ${newPath}`)
    const moved = await moveImageToSlugPath(serie.cover_image_path, newPath)
    
    if (moved) {
      migrated++
      console.log('   ✅ Successfully migrated')
    } else {
      skipped++
      console.log('   ⚠️ Migration failed')
    }
    
    console.log('')
  }

  console.log('📊 Series Migration Summary:')
  console.log(`   ✅ Successfully migrated: ${migrated}`)
  console.log(`   ⚠️ Skipped/Failed: ${skipped}\n`)
}

/**
 * Migrate artifact images to ID-based paths
 */
async function migrateArtifactImages() {
  console.log('🏺 Migrating artifact images to ID-based paths...\n')

  const { data: artifacts, error } = await supabase
    .from('artifacts')
    .select('id, title, image_path')
    .not('image_path', 'is', null)

  if (error) {
    console.error('Failed to fetch artifacts:', error)
    return
  }

  console.log(`Found ${artifacts.length} artifacts with images to migrate\n`)

  let migrated = 0
  let skipped = 0

  for (const artifact of artifacts) {
    console.log(`🏺 Processing: ${artifact.title}`)
    console.log(`   ID: ${artifact.id}`)

    const newPath = `artifacts/optimized/${artifact.id}.webp`
    
    console.log(`   Image: ${artifact.image_path} → ${newPath}`)
    const moved = await moveImageToSlugPath(artifact.image_path, newPath)
    
    if (moved) {
      migrated++
      console.log('   ✅ Successfully migrated')
    } else {
      skipped++
      console.log('   ⚠️ Migration failed')
    }
    
    console.log('')
  }

  console.log('📊 Artifacts Migration Summary:')
  console.log(`   ✅ Successfully migrated: ${migrated}`)
  console.log(`   ⚠️ Skipped/Failed: ${skipped}\n`)
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting migration to slug-based image management...\n')
  console.log('This script will move existing images to new slug-based paths\n')

  try {
    await migrateArtworkImages()
    await migrateSeriesImages()
    await migrateArtifactImages()

    console.log('✅ Migration completed!')
    console.log('\nNext steps:')
    console.log('1. Test the new image system in admin')
    console.log('2. Apply database migration to remove old path columns')
    console.log('3. Update frontend components to use slug-based URLs')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main }
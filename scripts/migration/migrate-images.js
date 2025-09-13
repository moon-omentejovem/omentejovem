const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const { createCanvas } = require('canvas')
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

// Constants (matching AdminForm.tsx)
const STORAGE_BUCKETS = {
  MEDIA: 'media'
}

const STORAGE_FOLDERS = {
  RAW: 'raw',
  OPTIMIZED: 'optimized'
}

// Helper function to download image from URL
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http
    
    const request = client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        return downloadImage(response.headers.location).then(resolve).catch(reject)
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`))
        return
      }

      const chunks = []
      
      response.on('data', (chunk) => {
        chunks.push(chunk)
      })
      
      response.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve(buffer)
      })
    }).on('error', reject)
    
    // Set timeout
    request.setTimeout(30000, () => {
      request.destroy()
      reject(new Error('Download timeout'))
    })
  })
}

// Helper function to optimize image (server-side version)
async function optimizeImageBuffer(buffer, maxWidth = 1920, quality = 0.8) {
  try {
    const sharp = require('sharp')
    
    return await sharp(buffer)
      .resize(maxWidth, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: Math.round(quality * 100) })
      .toBuffer()
  } catch (error) {
    console.warn('Sharp optimization failed, returning original buffer')
    return buffer
  }
}

// Function to create File-like object from buffer
function createFileFromBuffer(buffer, filename, contentType) {
  return {
    name: filename,
    type: contentType,
    size: buffer.length,
    arrayBuffer: () => Promise.resolve(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)),
    stream: () => new ReadableStream({
      start(controller) {
        controller.enqueue(buffer)
        controller.close()
      }
    }),
    text: () => Promise.resolve(buffer.toString()),
    slice: (start, end) => createFileFromBuffer(buffer.slice(start, end), filename, contentType)
  }
}

// Function to migrate a single artwork image
async function migrateArtworkImage(artwork) {
  const { id, title, slug, image_url } = artwork
  
  console.log(`🖼️  Processing: ${title}`)
  
  try {
    // Skip if image is already hosted on Supabase
    if (image_url.includes(supabaseUrl) || image_url.startsWith('/')) {
      console.log(`✅ Already migrated: ${title}`)
      return { success: true, skipped: true }
    }
    
    // Skip localhost URLs for now
    if (image_url.includes('localhost')) {
      console.log(`⚠️  Skipping localhost URL: ${title}`)
      return { success: true, skipped: true, reason: 'localhost' }
    }
    
    // Download the image
    console.log(`⬇️  Downloading image from: ${image_url}`)
    const imageBuffer = await downloadImage(image_url)
    
    // Determine file extension and content type
    let extension = 'jpg'
    let contentType = 'image/jpeg'
    
    if (image_url.includes('.png')) {
      extension = 'png'
      contentType = 'image/png'
    } else if (image_url.includes('.webp')) {
      extension = 'webp'
      contentType = 'image/webp'
    }
    
    // Create filename (matching AdminForm pattern)
    const timestamp = Date.now()
    const baseName = slug || title.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const rawFilename = `${timestamp}-${baseName}.jpg` // Always use .jpg for raw to save space
    const optimizedFilename = `${timestamp}-${baseName}.webp`
    
    // Define paths (matching AdminForm pattern)
    const bucket = STORAGE_BUCKETS.MEDIA
    const rawPath = `artworks/${STORAGE_FOLDERS.RAW}/${rawFilename}`
    const optimizedPath = `artworks/${STORAGE_FOLDERS.OPTIMIZED}/${optimizedFilename}`
    
    // Optimize raw image to save storage (reduce size but keep high quality)
    console.log('🔧 Optimizing raw image for storage...')
    const rawOptimizedBuffer = await sharp(imageBuffer)
      .resize(2560, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 90 }) // High quality but compressed
      .toBuffer()
    
    // Upload optimized raw file
    console.log(`📤 Uploading raw (optimized): ${rawPath}`)
    const { error: rawError } = await supabase.storage
      .from(bucket)
      .upload(rawPath, rawOptimizedBuffer, { 
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })
    
    if (rawError) {
      if (rawError.message?.includes('already exists')) {
        console.log(`⚠️  File already exists: ${rawPath}`)
      } else {
        throw rawError
      }
    }
    
    // Optimize and upload processed image
    console.log('🔧 Creating web-optimized version...')
    const optimizedBuffer = await sharp(imageBuffer)
      .resize(1920, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80 })
      .toBuffer()
    
    console.log(`📤 Uploading optimized: ${optimizedPath}`)
    const { error: optError } = await supabase.storage
      .from(bucket)
      .upload(optimizedPath, optimizedBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600'
      })
    
    if (optError) {
      if (optError.message?.includes('already exists')) {
        console.log(`⚠️  Optimized file already exists: ${optimizedPath}`)
      } else {
        throw optError
      }
    }
    
    // Get public URL of optimized image
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(optimizedPath)
    
    // Update artwork with new image URL
    console.log(`📝 Updating artwork with new URL: ${publicUrl}`)
    const { error: updateError } = await supabase
      .from('artworks')
      .update({ 
        image_url: publicUrl
      })
      .eq('id', id)
    
    if (updateError) throw updateError
    
    console.log(`✅ Successfully migrated: ${title}`)
    
    return { 
      success: true, 
      originalUrl: image_url,
      newUrl: publicUrl,
      rawPath,
      optimizedPath
    }
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${title}:`, error.message)
    return { 
      success: false, 
      error: error.message,
      originalUrl: image_url
    }
  }
}

// Function to add backup column if needed
async function ensureBackupColumn() {
  // Skip backup column for now - will be added manually if needed
  console.log('ℹ️  Skipping backup column creation - original URLs will be lost')
  return
}

// Main migration function
async function migrateAllImages() {
  console.log('🚀 Starting image migration to Supabase...\n')
  
  try {
    // Ensure backup column exists
    await ensureBackupColumn()
    
    // Get all artworks with external image URLs
    console.log('📊 Fetching artworks with external images...')
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, slug, image_url')
      .not('image_url', 'like', `%${supabaseUrl}%`)
      .not('image_url', 'like', '/%')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    console.log(`📊 Found ${artworks.length} artworks to migrate\n`)
    
    if (artworks.length === 0) {
      console.log('🎉 No images need migration!')
      return
    }
    
    const results = {
      success: 0,
      skipped: 0,
      failed: 0,
      errors: []
    }
    
    // Process each artwork
    for (let i = 0; i < artworks.length; i++) {
      const artwork = artworks[i]
      
      console.log(`\n[${i + 1}/${artworks.length}] Processing: ${artwork.title}`)
      
      const result = await migrateArtworkImage(artwork)
      
      if (result.success) {
        if (result.skipped) {
          results.skipped++
        } else {
          results.success++
        }
      } else {
        results.failed++
        results.errors.push({
          artwork: artwork.title,
          error: result.error,
          url: result.originalUrl
        })
      }
      
      // Add delay to avoid rate limiting
      if (i < artworks.length - 1) {
        console.log('⏳ Waiting 2 seconds...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // Summary
    console.log('\n📊 Migration Summary:')
    console.log(`✅ Successfully migrated: ${results.success} images`)
    console.log(`⏭️  Skipped (already migrated): ${results.skipped} images`)
    console.log(`❌ Failed: ${results.failed} images`)
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:')
      results.errors.forEach(({ artwork, error, url }) => {
        console.log(`  - ${artwork}: ${error}`)
        console.log(`    URL: ${url}`)
      })
    }
    
    console.log('\n🎉 Image migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Dry run function to preview what will be migrated
async function dryRun() {
  console.log('🔍 Dry run - Preview of images to migrate\n')
  
  try {
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, slug, image_url')
      .not('image_url', 'like', `%${supabaseUrl}%`)
      .not('image_url', 'like', '/%')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    console.log(`📊 Found ${artworks.length} artworks with external images:\n`)
    
    artworks.forEach((artwork, index) => {
      console.log(`${index + 1}. ${artwork.title}`)
      console.log(`   Slug: ${artwork.slug}`)
      console.log(`   Current URL: ${artwork.image_url}`)
      console.log(`   Domain: ${new URL(artwork.image_url).hostname}`)
      console.log('')
    })
    
    if (artworks.length === 0) {
      console.log('🎉 No images need migration!')
    } else {
      console.log(`\nTo migrate these ${artworks.length} images, run:`)
      console.log('node scripts/migrate-images.js')
    }
    
  } catch (error) {
    console.error('❌ Dry run failed:', error.message)
    process.exit(1)
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run') || args.includes('-d')
  
  if (isDryRun) {
    await dryRun()
  } else {
    await migrateAllImages()
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

module.exports = { migrateAllImages, dryRun }

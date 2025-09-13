const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const http = require('http')
const sharp = require('sharp')
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
    const rawFilename = `${timestamp}-${baseName}.${extension}`
    const optimizedFilename = `${timestamp}-${baseName}.webp`
    
    // Define paths (matching AdminForm pattern)
    const bucket = STORAGE_BUCKETS.MEDIA
    const rawPath = `artworks/${STORAGE_FOLDERS.RAW}/${rawFilename}`
    const optimizedPath = `artworks/${STORAGE_FOLDERS.OPTIMIZED}/${optimizedFilename}`
    
    // Upload original file
    console.log(`📤 Uploading original: ${rawPath}`)
    const { error: rawError } = await supabase.storage
      .from(bucket)
      .upload(rawPath, imageBuffer, { 
        contentType,
        cacheControl: '3600'
      })
    
    if (rawError) {
      if (rawError.message?.includes('already exists')) {
        console.log(`⚠️  File already exists: ${rawPath}`)
      } else {
        throw rawError
      }
    }
    
    // Optimize image using Sharp
    console.log('🔧 Optimizing image...')
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

// Test migration with first 3 artworks
async function testMigration() {
  console.log('🧪 Testing image migration with first 3 artworks...\n')
  
  try {
    // Get first 3 artworks with external URLs
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, slug, image_url')
      .not('image_url', 'like', `%${supabaseUrl}%`)
      .not('image_url', 'like', '/%')
      .order('created_at', { ascending: true })
      .limit(3)
    
    if (error) throw error
    
    console.log(`📊 Testing with ${artworks.length} artworks\n`)
    
    const results = {
      success: 0,
      skipped: 0,
      failed: 0,
      errors: []
    }
    
    // Process each artwork
    for (let i = 0; i < artworks.length; i++) {
      const artwork = artworks[i]
      
      console.log(`\n[${i + 1}/${artworks.length}] Testing: ${artwork.title}`)
      
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
      
      // Add delay between requests
      if (i < artworks.length - 1) {
        console.log('⏳ Waiting 3 seconds...')
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
    
    // Summary
    console.log('\n📊 Test Summary:')
    console.log(`✅ Successfully migrated: ${results.success} images`)
    console.log(`⏭️  Skipped: ${results.skipped} images`)
    console.log(`❌ Failed: ${results.failed} images`)
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:')
      results.errors.forEach(({ artwork, error, url }) => {
        console.log(`  - ${artwork}: ${error}`)
        console.log(`    URL: ${url}`)
      })
    }
    
    console.log('\n🧪 Test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Main function
async function main() {
  await testMigration()
}

// Execute if run directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Test completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Test failed:', error)
      process.exit(1)
    })
}

module.exports = { testMigration }

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

// Constants
const STORAGE_BUCKETS = {
  MEDIA: 'media'
}

const STORAGE_FOLDERS = {
  RAW: 'raw',
  OPTIMIZED: 'optimized'
}

// Helper function to download image from URL with retry
async function downloadImage(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http
        
        const request = client.get(url, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            return downloadImage(response.headers.location).then(resolve).catch(reject)
          }
          
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
            return
          }

          const chunks = []
          
          response.on('data', (chunk) => {
            chunks.push(chunk)
          })
          
          response.on('end', () => {
            const buffer = Buffer.concat(chunks)
            console.log(`📊 Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)}MB`)
            resolve(buffer)
          })
        }).on('error', reject)
        
        request.setTimeout(60000, () => {
          request.destroy()
          reject(new Error('Download timeout (60s)'))
        })
      })
    } catch (error) {
      console.log(`⚠️  Attempt ${attempt}/${maxRetries} failed: ${error.message}`)
      if (attempt === maxRetries) throw error
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}

// Function to aggressively optimize large images
async function aggressivelyOptimizeImage(imageBuffer, title) {
  const originalSize = imageBuffer.length
  console.log(`📊 Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`)
  
  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata()
    console.log(`📏 Dimensions: ${metadata.width}x${metadata.height}`)
    
    // Define aggressive optimization strategies
    const strategies = [
      // Strategy 1: High quality but smaller dimensions
      {
        name: 'High Quality Resize',
        maxWidth: 2048,
        quality: 85,
        format: 'jpeg'
      },
      // Strategy 2: Medium quality, smaller dimensions
      {
        name: 'Medium Quality Resize',
        maxWidth: 1600,
        quality: 75,
        format: 'jpeg'
      },
      // Strategy 3: Lower quality but good dimensions
      {
        name: 'Low Quality Resize',
        maxWidth: 1200,
        quality: 65,
        format: 'jpeg'
      }
    ]
    
    for (const strategy of strategies) {
      console.log(`🔧 Trying ${strategy.name}...`)
      
      const optimizedBuffer = await sharp(imageBuffer)
        .resize(strategy.maxWidth, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: strategy.quality })
        .toBuffer()
      
      const optimizedSize = optimizedBuffer.length
      const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1)
      const sizeMB = (optimizedSize / 1024 / 1024).toFixed(2)
      
      console.log(`📊 ${strategy.name}: ${sizeMB}MB (-${reduction}%)`)
      
      // If under 5MB, use this optimization
      if (optimizedSize < 5 * 1024 * 1024) {
        console.log(`✅ Success with ${strategy.name}`)
        return optimizedBuffer
      }
    }
    
    // If all strategies fail, try WebP with very aggressive compression
    console.log('🔧 Trying WebP with aggressive compression...')
    const webpBuffer = await sharp(imageBuffer)
      .resize(1200, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 50 })
      .toBuffer()
    
    const webpSize = webpBuffer.length
    const reduction = ((originalSize - webpSize) / originalSize * 100).toFixed(1)
    const sizeMB = (webpSize / 1024 / 1024).toFixed(2)
    
    console.log(`📊 WebP Aggressive: ${sizeMB}MB (-${reduction}%)`)
    
    if (webpSize < 8 * 1024 * 1024) {
      console.log('✅ Success with WebP aggressive compression')
      return webpBuffer
    }
    
    throw new Error(`Image still too large after all optimizations: ${sizeMB}MB`)
    
  } catch (error) {
    console.error(`❌ Optimization failed: ${error.message}`)
    throw error
  }
}

// Function to migrate a single large image with aggressive optimization
async function migrateLargeImage(artwork) {
  const { id, title, slug, image_url } = artwork
  
  console.log(`🖼️  Processing large image: ${title}`)
  console.log(`🔗 URL: ${image_url}`)
  
  try {
    // Download the image
    console.log('⬇️  Downloading large image...')
    const imageBuffer = await downloadImage(image_url)
    
    // Aggressively optimize the image
    const optimizedBuffer = await aggressivelyOptimizeImage(imageBuffer, title)
    
    // Create filename
    const timestamp = Date.now()
    const baseName = slug || title.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const rawFilename = `${timestamp}-${baseName}-large.jpg`
    const optimizedFilename = `${timestamp}-${baseName}-large.webp`
    
    // Define paths
    const bucket = STORAGE_BUCKETS.MEDIA
    const rawPath = `artworks/${STORAGE_FOLDERS.RAW}/${rawFilename}`
    const optimizedPath = `artworks/${STORAGE_FOLDERS.OPTIMIZED}/${optimizedFilename}`
    
    // Upload optimized raw file
    console.log(`📤 Uploading raw (aggressively optimized): ${rawPath}`)
    const { error: rawError } = await supabase.storage
      .from(bucket)
      .upload(rawPath, optimizedBuffer, { 
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
    
    // Create web-optimized version
    console.log('🔧 Creating web-optimized version...')
    const webOptimizedBuffer = await sharp(optimizedBuffer)
      .resize(1920, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80 })
      .toBuffer()
    
    console.log(`📤 Uploading web-optimized: ${optimizedPath}`)
    const { error: optError } = await supabase.storage
      .from(bucket)
      .upload(optimizedPath, webOptimizedBuffer, {
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
    
    console.log(`✅ Successfully migrated large image: ${title}`)
    
    return { 
      success: true, 
      originalUrl: image_url,
      newUrl: publicUrl,
      rawPath,
      optimizedPath
    }
    
  } catch (error) {
    console.error(`❌ Failed to migrate large image ${title}:`, error.message)
    return { 
      success: false, 
      error: error.message,
      originalUrl: image_url
    }
  }
}

// Main function to process failed large images
async function migrateLargeImages() {
  console.log('🚀 Starting large image migration with aggressive optimization...\n')
  
  try {
    // Get artworks that failed migration (likely due to size)
    console.log('📊 Fetching artworks with external images...')
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, slug, image_url')
      .not('image_url', 'like', `%${supabaseUrl}%`)
      .not('image_url', 'like', '/%')
      .not('image_url', 'like', '%localhost%')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    console.log(`📊 Found ${artworks.length} artworks to migrate with aggressive optimization\n`)
    
    if (artworks.length === 0) {
      console.log('🎉 No large images need migration!')
      return
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    }
    
    // Process each artwork with longer delays for large images
    for (let i = 0; i < artworks.length; i++) {
      const artwork = artworks[i]
      
      console.log(`\n[${i + 1}/${artworks.length}] Processing: ${artwork.title}`)
      
      const result = await migrateLargeImage(artwork)
      
      if (result.success) {
        results.success++
      } else {
        results.failed++
        results.errors.push({
          artwork: artwork.title,
          error: result.error,
          url: result.originalUrl
        })
      }
      
      // Longer delay for large images to avoid overwhelming the server
      if (i < artworks.length - 1) {
        console.log('⏳ Waiting 5 seconds before next large image...')
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
    
    // Summary
    console.log('\n📊 Large Image Migration Summary:')
    console.log(`✅ Successfully migrated: ${results.success} images`)
    console.log(`❌ Failed: ${results.failed} images`)
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:')
      results.errors.forEach(({ artwork, error, url }) => {
        console.log(`  - ${artwork}: ${error}`)
        console.log(`    URL: ${url}`)
      })
    }
    
    console.log('\n🎉 Large image migration completed!')
    
  } catch (error) {
    console.error('❌ Large image migration failed:', error.message)
    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  migrateLargeImages()
    .then(() => {
      console.log('\n✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateLargeImages }

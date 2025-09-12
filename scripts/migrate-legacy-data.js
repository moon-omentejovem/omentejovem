const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
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

// Helper function to generate slug from text
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Helper function to convert description to Tiptap JSON format
function convertDescriptionToTiptap(description) {
  if (!description) return null
  
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: description
          }
        ]
      }
    ]
  }
}

// Helper function to determine if artwork is 1/1
function isOneOfOne(metadata) {
  // Check if it's ERC721 (usually 1/1) vs ERC1155 (usually editions)
  if (metadata.tokenType === 'ERC721') return true
  if (metadata.tokenType === 'ERC1155') return false
  
  // Additional checks based on collection/contract
  const oneOfOneCollections = [
    'omentejovem', 
    'the3cycle'
  ]
  
  return oneOfOneCollections.includes(metadata.collection?.slug)
}

// Helper function to determine artwork type
function getArtworkType(metadata) {
  return metadata.tokenType === 'ERC721' ? 'single' : 'edition'
}

// Helper function to get OpenSea URL
function getOpenSeaUrl(metadata) {
  const { contract, tokenId } = metadata
  
  if (!contract?.address || !tokenId) return null
  
  return `https://opensea.io/assets/ethereum/${contract.address}/${tokenId}`
}

// Helper function to extract mint date
function extractMintDate(metadata) {
  // Try different sources for mint date
  if (metadata.mint?.timestamp) {
    return new Date(metadata.mint.timestamp).toISOString().split('T')[0]
  }
  
  if (metadata.timeLastUpdated) {
    return new Date(metadata.timeLastUpdated).toISOString().split('T')[0]
  }
  
  // Default to a reasonable date if not found
  return '2022-01-01'
}

// Helper function to get the best image URL (prefer cached over original)
function getBestImageUrl(metadata) {
  const { image } = metadata
  
  // Prefer cached URL for better performance
  if (image?.cachedUrl) return image.cachedUrl
  if (image?.pngUrl) return image.pngUrl
  if (image?.thumbnailUrl) return image.thumbnailUrl
  if (image?.originalUrl) return image.originalUrl
  
  return null
}

// Series mapping based on collection data
function getSeriesMapping() {
  return {
    'the3cycle': {
      slug: 'the-cycle',
      name: 'The Cycle',
      cover_image_url: 'https://i.seadn.io/s/raw/files/ed5d5b2508bd188b00832ac86adb57ba.jpg?w=500&auto=format'
    },
    'omentejovem': {
      slug: 'omentejovem-1-1s',
      name: 'OMENTEJOVEM 1/1s',
      cover_image_url: 'https://i.seadn.io/gcs/files/cacbfeb217dd1be2d79a65a765ca550f.jpg?w=500&auto=format'
    },
    'shapesncolors': {
      slug: 'shapes-colors',
      name: 'Shapes & Colors',
      cover_image_url: 'https://i.seadn.io/gcs/files/9d7eb58db2c4fa4cc9dd93273c6d3e51.png?w=500&auto=format'
    },
    'omentejovem-editions': {
      slug: 'omentejovem-editions',
      name: "OMENTEJOVEM's Editions",
      cover_image_url: 'https://i.seadn.io/gae/_ZzhhYKfpH4to7PQ0RJkr8REqu_BamJNFNe17NnOkFg1rhFiC_xcioL969hFj5Hri7FIm1hruaKEfUOupzhz3uQk6XwoApIPtgcKFw?w=500&auto=format'
    }
  }
}

// Function to process a single NFT metadata into artwork format
function processMetadataToArtwork(metadata) {
  const artwork = {
    slug: generateSlug(metadata.name),
    title: metadata.name,
    description: convertDescriptionToTiptap(metadata.description),
    token_id: metadata.tokenId,
    mint_date: extractMintDate(metadata),
    mint_link: getOpenSeaUrl(metadata),
    type: getArtworkType(metadata),
    editions_total: metadata.tokenType === 'ERC1155' ? null : null, // We don't have edition counts in metadata
    image_url: getBestImageUrl(metadata),
    is_featured: false, // Default to false, can be manually set later
    is_one_of_one: isOneOfOne(metadata),
    posted_at: new Date(extractMintDate(metadata) + 'T12:00:00Z').toISOString()
  }
  
  // Remove null/undefined values
  Object.keys(artwork).forEach(key => {
    if (artwork[key] === null || artwork[key] === undefined) {
      delete artwork[key]
    }
  })
  
  return artwork
}

// Main migration function
async function migrateLegacyData() {
  console.log('🚀 Starting legacy data migration...')
  
  try {
    // Read token metadata
    const metadataPath = path.join(process.cwd(), 'public', 'token-metadata.json')
    console.log('📖 Reading token metadata from:', metadataPath)
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error('token-metadata.json not found in public folder')
    }
    
    const rawData = fs.readFileSync(metadataPath, 'utf-8')
    const tokenMetadata = JSON.parse(rawData)
    
    console.log(`📊 Found ${tokenMetadata.length} NFTs to process`)
    
    // Get series mapping
    const seriesMapping = getSeriesMapping()
    
    // Create series first
    console.log('📦 Creating series...')
    const createdSeries = new Map()
    
    for (const [collectionSlug, seriesData] of Object.entries(seriesMapping)) {
      try {
        const { data: existingSeries } = await supabase
          .from('series')
          .select('id, slug')
          .eq('slug', seriesData.slug)
          .single()
        
        if (existingSeries) {
          console.log(`✅ Series already exists: ${seriesData.name}`)
          createdSeries.set(collectionSlug, existingSeries.id)
        } else {
          const { data: newSeries, error } = await supabase
            .from('series')
            .insert(seriesData)
            .select('id, slug')
            .single()
          
          if (error) throw error
          
          console.log(`✅ Created series: ${seriesData.name}`)
          createdSeries.set(collectionSlug, newSeries.id)
        }
      } catch (error) {
        console.error(`❌ Error creating series ${seriesData.name}:`, error.message)
      }
    }
    
    // Process artworks
    console.log('🎨 Processing artworks...')
    let successCount = 0
    let errorCount = 0
    
    for (const metadata of tokenMetadata) {
      try {
        const artwork = processMetadataToArtwork(metadata)
        
        // Check if artwork already exists
        const { data: existingArtwork } = await supabase
          .from('artworks')
          .select('id, slug')
          .eq('slug', artwork.slug)
          .single()
        
        if (existingArtwork) {
          console.log(`⚠️ Artwork already exists: ${artwork.title}`)
          continue
        }
        
        // Insert artwork
        const { data: newArtwork, error: artworkError } = await supabase
          .from('artworks')
          .insert(artwork)
          .select('id, slug')
          .single()
        
        if (artworkError) throw artworkError
        
        // Create series relationship if collection mapping exists
        const collectionSlug = metadata.collection?.slug
        if (collectionSlug && createdSeries.has(collectionSlug)) {
          const seriesId = createdSeries.get(collectionSlug)
          
          const { error: relationError } = await supabase
            .from('series_artworks')
            .insert({
              series_id: seriesId,
              artwork_id: newArtwork.id
            })
          
          if (relationError && !relationError.message.includes('duplicate')) {
            console.warn(`⚠️ Could not create series relation for ${artwork.title}:`, relationError.message)
          }
        }
        
        console.log(`✅ Created artwork: ${artwork.title}`)
        successCount++
        
      } catch (error) {
        console.error(`❌ Error processing ${metadata.name}:`, error.message)
        errorCount++
      }
    }
    
    // Summary
    console.log('\n📊 Migration Summary:')
    console.log(`✅ Successfully migrated: ${successCount} artworks`)
    console.log(`❌ Errors: ${errorCount} artworks`)
    console.log(`📦 Series created: ${createdSeries.size}`)
    
    // Feature some artworks automatically
    if (successCount > 0) {
      console.log('\n🌟 Setting featured artworks...')
      
      // Feature some notable pieces
      const featuredSlugs = [
        'the-flower',
        'the-seed', 
        'the-dot',
        'the-moon',
        'out-of-babylon',
        'between-the-sun-and-moon'
      ]
      
      for (const slug of featuredSlugs) {
        const { error } = await supabase
          .from('artworks')
          .update({ is_featured: true })
          .eq('slug', slug)
        
        if (!error) {
          console.log(`⭐ Featured: ${slug}`)
        }
      }
    }
    
    console.log('\n🎉 Legacy data migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Execute migration
if (require.main === module) {
  migrateLegacyData()
    .then(() => {
      console.log('✅ Migration script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateLegacyData }

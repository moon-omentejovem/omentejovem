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

// Function to update mint links for new series
async function updateNewSeriesMintLinks() {
  console.log('🔗 Updating mint links for New Series artworks...')
  
  try {
    // Base URL pattern for new series (you can adjust this)
    const baseUrl = 'https://www.omentejovem.com/series/stories-on-circles'
    
    const { data: newSeriesArtworks, error } = await supabase
      .from('artworks')
      .select('id, slug, title')
      .is('mint_link', null)
      .ilike('image_url', '/new_series/%')
    
    if (error) throw error
    
    console.log(`📊 Found ${newSeriesArtworks.length} artworks to update`)
    
    for (const artwork of newSeriesArtworks) {
      const mintLink = `${baseUrl}/${artwork.slug}`
      
      const { error: updateError } = await supabase
        .from('artworks')
        .update({ mint_link: mintLink })
        .eq('id', artwork.id)
      
      if (updateError) {
        console.log(`❌ Error updating ${artwork.title}:`, updateError.message)
      } else {
        console.log(`✅ Updated mint link for: ${artwork.title}`)
      }
    }
    
    console.log('✅ Mint links update completed!')
    
  } catch (error) {
    console.error('❌ Update failed:', error.message)
  }
}

// Function to optimize image URLs (prefer cached/CDN versions)
async function optimizeImageUrls() {
  console.log('🖼️  Optimizing image URLs...')
  
  try {
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, image_url')
    
    if (error) throw error
    
    let optimizedCount = 0
    
    for (const artwork of artworks) {
      let optimizedUrl = artwork.image_url
      let needsUpdate = false
      
      // If it's an OpenSea image, try to optimize
      if (artwork.image_url?.includes('i.seadn.io') && !artwork.image_url.includes('w=500')) {
        optimizedUrl = artwork.image_url + (artwork.image_url.includes('?') ? '&' : '?') + 'w=500&auto=format'
        needsUpdate = true
      }
      
      // If it's an Alchemy image and we want to use a different format
      if (artwork.image_url?.includes('nft-cdn.alchemy.com')) {
        // Keep as is - these are already optimized
      }
      
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('artworks')
          .update({ image_url: optimizedUrl })
          .eq('id', artwork.id)
        
        if (!updateError) {
          console.log(`✅ Optimized image for: ${artwork.title}`)
          optimizedCount++
        }
      }
    }
    
    console.log(`✅ Optimized ${optimizedCount} image URLs`)
    
  } catch (error) {
    console.error('❌ Image optimization failed:', error.message)
  }
}

// Function to add missing descriptions from external sources
async function enhanceDescriptions() {
  console.log('📝 Enhancing artwork descriptions...')
  
  try {
    // Get artworks with missing or minimal descriptions
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, slug, description')
      .or('description.is.null,description.eq.{}')
    
    if (error) throw error
    
    console.log(`📊 Found ${artworks.length} artworks needing description enhancement`)
    
    // Default descriptions for some known artworks
    const defaultDescriptions = {
      'sitting-at-the-edge': 'Part of the Stories on Circles collection, exploring moments of contemplation and transition.',
      'two-voices-one-circle': 'A visual dialogue between different perspectives within a unified circular narrative.',
      'the-ground-was-my-teacher': 'Reflecting on lessons learned from nature and our connection to the earth.',
      'i-had-dreams-about-you': 'An intimate exploration of memory, dreams, and connection across time and space.',
      'mapping-the-unseen': 'Visualizing the invisible connections and patterns that shape our understanding of reality.',
      'playing-chess-with-love': 'A metaphorical game where strategy meets emotion in the pursuit of connection.',
      'all-time-high-discovery': 'Capturing the euphoria of breakthrough moments and personal revelations.',
      'i-am-where-you-arent': 'Exploring themes of presence, absence, and the spaces between connection and solitude.',
      'before-birth': 'A meditation on potential, creation, and the moments before manifestation.',
      'he-left-as-a-dot': 'The conclusion of a journey, reduced to its essential element - a single point of departure.'
    }
    
    let enhancedCount = 0
    
    for (const artwork of artworks) {
      const defaultDesc = defaultDescriptions[artwork.slug]
      
      if (defaultDesc) {
        const tiptapDescription = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: defaultDesc
                }
              ]
            }
          ]
        }
        
        const { error: updateError } = await supabase
          .from('artworks')
          .update({ description: tiptapDescription })
          .eq('id', artwork.id)
        
        if (!updateError) {
          console.log(`✅ Enhanced description for: ${artwork.title}`)
          enhancedCount++
        }
      }
    }
    
    console.log(`✅ Enhanced ${enhancedCount} descriptions`)
    
  } catch (error) {
    console.error('❌ Description enhancement failed:', error.message)
  }
}

// Function to set proper featured artworks based on criteria
async function updateFeaturedArtworks() {
  console.log('⭐ Updating featured artworks selection...')
  
  try {
    // First, unfature all artworks
    await supabase
      .from('artworks')
      .update({ is_featured: false })
      .eq('is_featured', true)
    
    // Define featured artworks based on importance/quality
    const featuredSlugs = [
      'the-flower',
      'the-seed',
      'the-dot',
      'the-moon',
      'out-of-babylon',
      'between-the-sun-and-moon',
      'sitting-at-the-edge',
      'ether-man-ii',
      'primeiro', // First from Shapes & Colors
      'musician-at-ipanemas-beach'
    ]
    
    let featuredCount = 0
    
    for (const slug of featuredSlugs) {
      const { data, error } = await supabase
        .from('artworks')
        .update({ is_featured: true })
        .eq('slug', slug)
        .select('title')
        .single()
      
      if (!error && data) {
        console.log(`⭐ Featured: ${data.title}`)
        featuredCount++
      }
    }
    
    console.log(`✅ Set ${featuredCount} artworks as featured`)
    
  } catch (error) {
    console.error('❌ Featured artworks update failed:', error.message)
  }
}

// Function to fix any data inconsistencies
async function fixDataInconsistencies() {
  console.log('🔧 Fixing data inconsistencies...')
  
  try {
    // Fix any artworks with empty token_id
    const { data: emptyTokenIds, error: tokenError } = await supabase
      .from('artworks')
      .select('id, title, slug')
      .or('token_id.is.null,token_id.eq.')
    
    if (tokenError) throw tokenError
    
    if (emptyTokenIds.length > 0) {
      console.log(`🔧 Found ${emptyTokenIds.length} artworks with empty token_id`)
      
      for (const artwork of emptyTokenIds) {
        // Generate a token_id based on slug or title
        const tokenId = artwork.slug.replace(/-/g, '_').toUpperCase()
        
        const { error: updateError } = await supabase
          .from('artworks')
          .update({ token_id: tokenId })
          .eq('id', artwork.id)
        
        if (!updateError) {
          console.log(`✅ Fixed token_id for: ${artwork.title}`)
        }
      }
    }
    
    // Ensure all mint_dates are properly formatted
    const { data: artworkDates, error: dateError } = await supabase
      .from('artworks')
      .select('id, title, mint_date, posted_at')
    
    if (dateError) throw dateError
    
    let dateFixCount = 0
    
    for (const artwork of artworkDates) {
      let needsUpdate = false
      const updates = {}
      
      // Ensure posted_at exists if mint_date exists
      if (artwork.mint_date && !artwork.posted_at) {
        updates.posted_at = new Date(artwork.mint_date + 'T12:00:00Z').toISOString()
        needsUpdate = true
      }
      
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('artworks')
          .update(updates)
          .eq('id', artwork.id)
        
        if (!updateError) {
          dateFixCount++
        }
      }
    }
    
    if (dateFixCount > 0) {
      console.log(`✅ Fixed ${dateFixCount} date inconsistencies`)
    }
    
    console.log('✅ Data inconsistencies check completed')
    
  } catch (error) {
    console.error('❌ Fix inconsistencies failed:', error.message)
  }
}

// Main enhancement function
async function enhanceMigratedData() {
  console.log('✨ Enhancing migrated data...\n')
  
  try {
    await updateNewSeriesMintLinks()
    console.log('')
    
    await optimizeImageUrls()
    console.log('')
    
    await enhanceDescriptions()
    console.log('')
    
    await updateFeaturedArtworks()
    console.log('')
    
    await fixDataInconsistencies()
    console.log('')
    
    console.log('🎉 Data enhancement completed successfully!')
    
  } catch (error) {
    console.error('❌ Enhancement failed:', error.message)
    process.exit(1)
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'enhance':
      await enhanceMigratedData()
      break
    case 'mint-links':
      await updateNewSeriesMintLinks()
      break
    case 'images':
      await optimizeImageUrls()
      break
    case 'descriptions':
      await enhanceDescriptions()
      break
    case 'featured':
      await updateFeaturedArtworks()
      break
    case 'fix':
      await fixDataInconsistencies()
      break
    default:
      console.log('✨ Data Enhancement Tools - Omentejovem')
      console.log('')
      console.log('Available commands:')
      console.log('  enhance      - Run all enhancement functions')
      console.log('  mint-links   - Update mint links for new series')
      console.log('  images       - Optimize image URLs')
      console.log('  descriptions - Enhance artwork descriptions')
      console.log('  featured     - Update featured artworks selection')
      console.log('  fix          - Fix data inconsistencies')
      console.log('')
      console.log('Examples:')
      console.log('  node scripts/enhance-data.js enhance')
      console.log('  node scripts/enhance-data.js featured')
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
  enhanceMigratedData,
  updateNewSeriesMintLinks,
  optimizeImageUrls,
  enhanceDescriptions,
  updateFeaturedArtworks,
  fixDataInconsistencies
}

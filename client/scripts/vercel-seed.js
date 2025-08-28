const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const { resolve } = require('path')

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Core data for seeding
const CORE_SERIES = [
  {
    slug: 'the-cycle',
    name: 'The Cycle',
    cover_image_url: 'https://i.seadn.io/s/raw/files/ed5d5b2508bd188b00832ac86adb57ba.jpg?w=500&auto=format'
  },
  {
    slug: 'omentejovem-1-1s',
    name: 'OMENTEJOVEM 1/1s',
    cover_image_url: 'https://i.seadn.io/gcs/files/cacbfeb217dd1be2d79a65a765ca550f.jpg?w=500&auto=format'
  },
  {
    slug: 'new-series',
    name: 'Stories on Circles',
    cover_image_url: '/new_series/1_Sitting_at_the_Edge.jpg'
  }
]

const CORE_ARTWORKS = [
  {
    slug: 'the-flower',
    title: 'The Flower',
    token_id: '5',
    mint_date: '2023-10-17',
    mint_link: 'https://opensea.io/assets/ethereum/0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43/5',
    type: 'single',
    image_url: 'https://nft-cdn.alchemy.com/eth-mainnet/37a6828e1258729749dec4e599ff3a9a',
    is_featured: true,
    is_one_of_one: true,
    posted_at: '2023-10-17T02:39:35Z'
  },
  {
    slug: 'the-seed', 
    title: 'The Seed',
    token_id: '6',
    mint_date: '2023-10-17',
    mint_link: 'https://opensea.io/assets/ethereum/0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43/6',
    type: 'single',
    image_url: 'https://nft-cdn.alchemy.com/eth-mainnet/cd486d85038abe77174c91422f96ac95',
    is_featured: true,
    is_one_of_one: true,
    posted_at: '2023-10-17T02:43:11Z'
  },
  {
    slug: 'the-dot',
    title: 'The Dot',
    token_id: '1',
    mint_date: '2022-11-03',
    mint_link: 'https://opensea.io/assets/ethereum/0xfda33af4770d844dc18d8788c7bf84accfac79ad/1',
    type: 'single',
    image_url: 'https://nft-cdn.alchemy.com/eth-mainnet/f9baf6dc256e300d501ef4a512613922',
    is_featured: true,
    is_one_of_one: true,
    posted_at: '2022-11-03T18:02:35Z'
  },
  {
    slug: 'sitting-at-the-edge',
    title: 'Sitting at the Edge',
    token_id: '1',
    mint_date: '2025-05-30',
    mint_link: null,
    type: 'single',
    image_url: '/new_series/1_Sitting_at_the_Edge.jpg',
    is_featured: true,
    is_one_of_one: true,
    posted_at: '2025-05-30T02:43:59Z'
  }
]

const CORE_ARTIFACTS = [
  {
    title: 'Stories on Circles Collection',
    description: 'Physical and digital exploration of circular narratives',
    highlight_video_url: '/crate.mp4',
    link_url: 'https://www.omentejovem.com/',
    image_url: '/S&C Cover.jpg'
  },
  {
    title: 'The Cycle Collection',
    description: 'A meditation on cycles of nature and existence',
    highlight_video_url: null,
    link_url: 'https://opensea.io/collection/the3cycle',
    image_url: '/TheCycleCover.jpg'
  }
]

const ABOUT_CONTENT = {
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'About Omentejovem' }]
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Omentejovem is a digital artist exploring the intersection of technology, nature, and human creativity. Through abstract digital compositions, the work investigates cycles of existence, emotional landscapes, and the relationship between artist and collector in the digital art space.'
          }
        ]
      }
    ]
  }
}

function seedOnDeploy() {
  return new Promise(async (resolve) => {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('⚠️ Supabase credentials not found, skipping seed')
      return resolve()
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
      console.log('🌱 Starting automatic database seeding...')

      // Check if core data already exists
      const { data: existingData } = await supabase
        .from('artworks')
        .select('id')
        .limit(1)

      if (existingData && existingData.length > 0) {
        console.log('✅ Database already seeded - skipping')
        console.log('🎉 Seeding check completed!')
        return resolve()
      }

      console.log('🗃️ Running database seed...')
      await runSeed(supabase)

      console.log('🎉 Database seeding completed successfully!')
      resolve()

    } catch (error) {
      console.error('❌ Seeding error:', error.message)
      // Don't fail the build on seeding errors
      resolve()
    }
  })
}

function runSeed(supabase) {
  return new Promise(async (resolve, reject) => {
    try {
      // Insert series
      console.log('📦 Creating series...')
      for (const series of CORE_SERIES) {
        const { error } = await supabase
          .from('series')
          .upsert(series, { onConflict: 'slug' })
        
        if (error) {
          console.log('⚠️ Series error:', error.message)
        } else {
          console.log('✅ Series:', series.name)
        }
      }

      // Insert artworks  
      console.log('🎨 Creating artworks...')
      for (const artwork of CORE_ARTWORKS) {
        const { error } = await supabase
          .from('artworks')
          .upsert(artwork, { onConflict: 'slug' })
          
        if (error) {
          console.log('⚠️ Artwork error:', error.message)
        } else {
          console.log('✅ Artwork:', artwork.title)
        }
      }

      // Seed artifacts
      console.log('🏺 Creating artifacts...')
      for (const artifact of CORE_ARTIFACTS) {
        const { error } = await supabase.from('artifacts').insert(artifact)
        if (!error || error.message.includes('duplicate')) {
          console.log('✅ Artifact:', artifact.title)
        }
      }

      // Seed about page
      console.log('📄 Creating about page...')
      const { error: aboutError } = await supabase.from('about_page').upsert(ABOUT_CONTENT)
      if (!aboutError) {
        console.log('✅ About page created')
      }

      console.log('✅ Core data seeded successfully!')
      resolve()
      
    } catch (error) {
      reject(error)
    }
  })
}

// Export function
module.exports = { 
  seedOnDeploy
}

// Execute if run directly
if (require.main === module) {
  seedOnDeploy().then(() => {
    console.log('Script completed')
    process.exit(0)
  }).catch(err => {
    console.error('Script failed:', err)
    process.exit(0)
  })
}

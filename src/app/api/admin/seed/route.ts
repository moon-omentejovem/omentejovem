import { supabaseConfig } from '@/lib/supabase/config'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to generate slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Helper function to convert description to Tiptap JSON format
function convertDescriptionToTiptap(description: string | null) {
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
function isOneOfOne(metadata: any): boolean {
  // Check if it's ERC721 (usually 1/1) vs ERC1155 (usually editions)
  if (metadata.tokenType === 'ERC721') return true
  if (metadata.tokenType === 'ERC1155') return false

  // Additional checks based on collection/contract
  const oneOfOneCollections = ['omentejovem', 'the3cycle']
  return oneOfOneCollections.includes(metadata.collection?.slug)
}

// Helper function to determine artwork type
function getArtworkType(metadata: any): string {
  return metadata.tokenType === 'ERC721' ? 'single' : 'edition'
}

// Helper function to get OpenSea URL
function getOpenSeaUrl(metadata: any): string | null {
  const { contract, tokenId } = metadata
  if (!contract?.address || !tokenId) return null
  return `https://opensea.io/assets/ethereum/${contract.address}/${tokenId}`
}

// Helper function to get the best image URL (prefer cached over original)
function getBestImageUrl(metadata: any): string | null {
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
    the3cycle: {
      slug: 'the-cycle',
      name: 'The Cycle'
    },
    omentejovem: {
      slug: 'omentejovem-1-1s',
      name: 'OMENTEJOVEM 1/1s'
    },
    shapesncolors: {
      slug: 'shapes-colors',
      name: 'Shapes & Colors'
    },
    'omentejovem-editions': {
      slug: 'omentejovem-editions',
      name: "OMENTEJOVEM's Editions"
    },
    'new-series': {
      slug: 'new-series',
      name: 'Stories on Circles'
    }
  }
}

// Stories on Circles artworks (new series)
function getStoriesOnCirclesArtworks() {
  const baseArtworks = [
    {
      id: 1,
      title: 'Sitting at the Edge',
      filename: '1_Sitting_at_the_Edge.jpg'
    },
    {
      id: 2,
      title: 'Two Voices, One Circle',
      filename: '2_Two_Voices,_One_Circle.jpg'
    },
    {
      id: 3,
      title: 'The Ground Was My Teacher',
      filename: '3_The_Ground_Was_My_Teacher.jpg'
    },
    {
      id: 4,
      title: 'I Had Dreams About You',
      filename: '4_I_Had_Dreams_About_You.jpg'
    },
    {
      id: 5,
      title: 'Mapping the Unseen',
      filename: '5_Mapping_the_Unseen.jpg'
    },
    {
      id: 6,
      title: 'Playing Chess with Love',
      filename: '6_Playing_Chess_with_Love.jpg'
    },
    {
      id: 7,
      title: 'All Time High Discovery',
      filename: '7_All_Time_High_Discovery.jpg'
    },
    {
      id: 8,
      title: "I Am Where You Aren't",
      filename: '8_I_Am_Where_You_Arent.jpg'
    },
    { id: 9, title: 'Before Birth', filename: '9_Before_Birth.jpg' },
    { id: 10, title: 'He Left as a Dot', filename: '10_He_Left_as_a_Dot.jpg' }
  ]

  return baseArtworks.map((item) => ({
    slug: generateSlug(item.title),
    title: item.title,
    token_id: item.id.toString(),
    mint_date: '2025-05-30',
    mint_link: null,
    type: 'single',
    video_url: `/new_series/videos/${item.filename.replace('.jpg', '.mp4')}`,
    is_featured: item.id === 1, // Feature the first one
    is_one_of_one: true,
    posted_at: '2025-05-30T02:43:59Z'
  }))
}

// Core artifacts
function getCoreArtifacts() {
  return [
    {
      title: 'Stories on Circles Collection',
      description: 'Physical and digital exploration of circular narratives',
      collection_label: 'Collection',
      highlight_video_url: '/crate.mp4',
      link_url: 'https://www.omentejovem.com/'
    },
    {
      title: 'The Cycle Collection',
      description: 'A meditation on cycles of nature and existence',
      collection_label: 'Collection',
      highlight_video_url: null,
      link_url: 'https://opensea.io/collection/the3cycle'
    }
  ]
}

// About page content
function getAboutContent() {
  return {
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
}

// Function to load and process token metadata from public files
async function loadTokenMetadata() {
  try {
    // Simulated fetch - in production you might read from static files
    // For now, return the core artworks that we know about
    return [
      {
        contract: { address: '0x826B11A95a9393E8a3CC0c2A7Dfc9ACCb4FF4e43' },
        tokenId: '5',
        tokenType: 'ERC721',
        name: 'The Flower',
        description:
          '"The Flower" is the second artwork from "The Cycle" collection released via the RarePass.',
        image: {
          cachedUrl:
            'https://nft-cdn.alchemy.com/eth-mainnet/37a6828e1258729749dec4e599ff3a9a'
        },
        collection: { slug: 'the3cycle' }
      },
      {
        contract: { address: '0x826B11A95a9393E8a3CC0c2A7Dfc9ACCb4FF4e43' },
        tokenId: '6',
        tokenType: 'ERC721',
        name: 'The Seed',
        description:
          '"The Seed" is the first artwork from "The Cycle" collection released via the RarePass.',
        image: {
          cachedUrl:
            'https://nft-cdn.alchemy.com/eth-mainnet/cd486d85038abe77174c91422f96ac95'
        },
        collection: { slug: 'the3cycle' }
      },
      {
        contract: { address: '0xfdA33af4770D844DC18D8788C7Bf84accfac79aD' },
        tokenId: '1',
        tokenType: 'ERC721',
        name: 'The Dot',
        description: 'The Dot, 2022.',
        image: {
          cachedUrl:
            'https://nft-cdn.alchemy.com/eth-mainnet/f9baf6dc256e300d501ef4a512613922'
        },
        collection: { slug: 'omentejovem' }
      }
    ]
  } catch (error) {
    console.warn('Could not load token metadata, using basic data:', error)
    return []
  }
}

// Function to load mint dates
async function loadMintDates() {
  try {
    // Return a basic mapping of known mint dates
    return new Map([
      [
        '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:5',
        '2023-10-17T02:39:35.000Z'
      ],
      [
        '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:6',
        '2023-10-17T02:43:11.000Z'
      ],
      [
        '0xfda33af4770d844dc18d8788c7bf84accfac79ad:1',
        '2022-11-03T18:02:35.000Z'
      ]
    ])
  } catch (error) {
    console.warn('Could not load mint dates:', error)
    return new Map()
  }
}

// Function to process a single NFT metadata into artwork format
function processMetadataToArtwork(
  metadata: any,
  mintDates: Map<string, string>
) {
  const contractKey = `${metadata.contract.address.toLowerCase()}:${metadata.tokenId}`
  const mintDate = mintDates.get(contractKey) || '2022-01-01T12:00:00Z'

  const artwork: Record<string, any> = {
    slug: generateSlug(metadata.name),
    title: metadata.name,
    description: convertDescriptionToTiptap(metadata.description),
    token_id: metadata.tokenId,
    mint_date: mintDate.split('T')[0], // Just the date part
    mint_link: getOpenSeaUrl(metadata),
    type: getArtworkType(metadata),
    is_featured: false, // Will be set manually for specific pieces
    is_one_of_one: isOneOfOne(metadata),
    posted_at: mintDate
  }

  // Remove null/undefined values
  Object.keys(artwork).forEach((key) => {
    if (artwork[key] === null || artwork[key] === undefined) {
      delete artwork[key]
    }
  })

  return artwork
}

async function seedDatabase() {
  const supabase = createClient(
    supabaseConfig.url,
    supabaseConfig.serviceRoleKey
  )

  const results = {
    series: { created: 0, errors: [] as string[] },
    artworks: { created: 0, errors: [] as string[] },
    artifacts: { created: 0, errors: [] as string[] },
    aboutPage: { created: false, error: null as string | null }
  }

  // Check if core data already exists
  const { data: existingData } = await supabase
    .from('artworks')
    .select('id')
    .limit(1)

  if (existingData && existingData.length > 0) {
    console.log('✅ Database already seeded - skipping')
    return { alreadySeeded: true, results }
  }

  console.log('🗃️ Running comprehensive database seed...')

  // Get series mapping and create series
  const seriesMapping = getSeriesMapping()
  const createdSeries = new Map()

  console.log('📦 Creating series...')
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
        results.series.created++
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      results.series.errors.push(`${seriesData.name}: ${errorMsg}`)
    }
  }

  // Load and process legacy token metadata
  console.log('🎨 Processing legacy artworks...')
  const tokenMetadata = await loadTokenMetadata()
  const mintDates = await loadMintDates()

  for (const metadata of tokenMetadata) {
    try {
      const artwork = processMetadataToArtwork(metadata, mintDates)

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
          console.warn(
            `⚠️ Could not create series relation for ${artwork.title}:`,
            relationError.message
          )
        }
      }

      console.log(`✅ Created artwork: ${artwork.title}`)
      results.artworks.created++
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      results.artworks.errors.push(`${metadata.name}: ${errorMsg}`)
    }
  }

  // Add Stories on Circles artworks
  console.log('� Creating Stories on Circles artworks...')
  const storiesArtworks = getStoriesOnCirclesArtworks()
  const storiesSeriesId = createdSeries.get('new-series')

  for (const artwork of storiesArtworks) {
    try {
      const { data: existingArtwork } = await supabase
        .from('artworks')
        .select('id, slug')
        .eq('slug', artwork.slug)
        .single()

      if (existingArtwork) {
        console.log(`⚠️ Artwork already exists: ${artwork.title}`)
        continue
      }

      const { data: newArtwork, error: artworkError } = await supabase
        .from('artworks')
        .insert(artwork)
        .select('id, slug')
        .single()

      if (artworkError) throw artworkError

      // Create series relationship
      if (storiesSeriesId) {
        const { error: relationError } = await supabase
          .from('series_artworks')
          .insert({
            series_id: storiesSeriesId,
            artwork_id: newArtwork.id
          })

        if (relationError && !relationError.message.includes('duplicate')) {
          console.warn(
            `⚠️ Could not create series relation for ${artwork.title}:`,
            relationError.message
          )
        }
      }

      console.log(`✅ Created Stories artwork: ${artwork.title}`)
      results.artworks.created++
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      results.artworks.errors.push(`${artwork.title}: ${errorMsg}`)
    }
  }

  // Seed artifacts
  console.log('🏺 Creating artifacts...')
  const artifacts = getCoreArtifacts()

  for (const artifact of artifacts) {
    try {
      const { error } = await supabase.from('artifacts').insert(artifact)
      if (!error || error.message.includes('duplicate')) {
        console.log('✅ Artifact:', artifact.title)
        results.artifacts.created++
      } else {
        results.artifacts.errors.push(`${artifact.title}: ${error.message}`)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      results.artifacts.errors.push(`${artifact.title}: ${errorMsg}`)
    }
  }

  // Seed about page
  console.log('📄 Creating about page...')
  try {
    const { error: aboutError } = await supabase
      .from('about_page')
      .upsert(getAboutContent())

    if (!aboutError) {
      console.log('✅ About page created')
      results.aboutPage.created = true
    } else {
      results.aboutPage.error = aboutError.message
    }
  } catch (err) {
    results.aboutPage.error =
      err instanceof Error ? err.message : 'Unknown error'
  }

  // Set featured artworks
  console.log('🌟 Setting featured artworks...')
  const featuredSlugs = [
    'the-flower',
    'the-seed',
    'the-dot',
    'sitting-at-the-edge'
  ]

  for (const slug of featuredSlugs) {
    try {
      const { error } = await supabase
        .from('artworks')
        .update({ is_featured: true })
        .eq('slug', slug)

      if (!error) {
        console.log(`⭐ Featured: ${slug}`)
      }
    } catch (err) {
      console.warn(`Could not feature ${slug}:`, err)
    }
  }

  console.log('✅ Comprehensive data seeding completed!')
  return { alreadySeeded: false, results }
}

// POST /api/admin/seed - Comprehensive database seeding endpoint
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting comprehensive database seeding...')

    // Validate environment variables
    if (!supabaseConfig.url || !supabaseConfig.serviceRoleKey) {
      return NextResponse.json(
        {
          error: 'Missing required Supabase credentials',
          details:
            'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
        },
        { status: 500 }
      )
    }

    const seedResult = await seedDatabase()

    if (seedResult.alreadySeeded) {
      return NextResponse.json({
        success: true,
        message: 'Database was already seeded',
        alreadySeeded: true
      })
    }

    // Check if there were any errors
    const hasErrors =
      seedResult.results.series.errors.length > 0 ||
      seedResult.results.artworks.errors.length > 0 ||
      seedResult.results.artifacts.errors.length > 0 ||
      seedResult.results.aboutPage.error

    return NextResponse.json({
      success: !hasErrors,
      message: hasErrors
        ? 'Database seeded with some errors'
        : 'Comprehensive database seeding completed successfully',
      details: seedResult.results,
      alreadySeeded: false
    })
  } catch (error) {
    console.error('Comprehensive seed error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Seeding failed', details: errorMessage },
      { status: 500 }
    )
  }
}

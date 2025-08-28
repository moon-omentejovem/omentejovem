import mintDates from '@/../public/mint-dates.json'
import tokenMetadata from '@/../public/token-metadata.json'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { CreateArtworkSchema, CreateSeriesSchema } from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { NextRequest, NextResponse } from 'next/server'

type ArtworkInsert = Database['public']['Tables']['artworks']['Insert']
type SeriesInsert = Database['public']['Tables']['series']['Insert']

// Function to convert description to Tiptap format
function convertDescriptionToTiptap(description: string | null): any {
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

// Function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove double hyphens
    .trim()
}

// Map collection slugs to series info
const COLLECTION_SERIES_MAP: Record<
  string,
  { name: string; slug: string; coverImage?: string }
> = {
  the3cycle: {
    name: 'The Cycle',
    slug: 'the-cycle',
    coverImage:
      'https://i.seadn.io/s/raw/files/ed5d5b2508bd188b00832ac86adb57ba.jpg'
  },
  omentejovem: {
    name: 'OMENTEJOVEM 1/1s',
    slug: 'omentejovem-ones',
    coverImage:
      'https://i.seadn.io/gcs/files/cacbfeb217dd1be2d79a65a765ca550f.jpg'
  },
  shapesncolors: {
    name: 'Shapes & Colors',
    slug: 'shapes-and-colors',
    coverImage:
      'https://i.seadn.io/gcs/files/9d7eb58db2c4fa4cc9dd93273c6d3e51.png'
  },
  'omentejovem-editions': {
    name: 'OMENTEJOVEM Editions',
    slug: 'omentejovem-editions',
    coverImage:
      'https://i.seadn.io/gae/_ZzhhYKfpH4to7PQ0RJkr8REqu_BamJNFNe17NnOkFg1rhFiC_xcioL969hFj5Hri7FIm1hruaKEfUOupzhz3uQk6XwoApIPtgcKFw'
  },
  superrare: {
    name: 'SuperRare Collection',
    slug: 'superrare',
    coverImage:
      'https://i.seadn.io/gae/-1VbTF_qOdwTUTxW8KzJbFcMX0-mDF-BJM-gmmRl8ihvoo53PF_1z1m1snLXxwcxVFyJH7wk_kouq-KVyB55N9U'
  },
  'stories-on-circles': {
    name: 'Stories on Circles',
    slug: 'stories-on-circles',
    coverImage:
      'https://ipfs.io/ipfs/bafybeiccb7a5l5wyrpvcte2ierisbc5ptfkfjztmdrrb74ohiaiudbzlea'
  }
}

// Define featured artworks based on historical importance
const FEATURED_ARTWORKS = [
  'the-flower',
  'the-seed',
  'the-fruit',
  'the-dot',
  'the-moon',
  'between-the-sun-and-moon',
  'out-of-babylon',
  'creative-workaholic',
  'happiness-cycle',
  'cheap-problems',
  'before-cycles-could-turn-in-stories'
]

// Define 1/1 collections
const ONE_OF_ONE_COLLECTIONS = [
  'the3cycle',
  'omentejovem',
  'superrare',
  'stories-on-circles'
]

function processTokenMetadata() {
  const series: SeriesInsert[] = []
  const artworks: ArtworkInsert[] = []
  const seriesArtworkRelations: {
    series_slug: string
    artwork_slug: string
  }[] = []

  // Create series from collection data
  const processedSeries = new Set<string>()

  // Process all tokens from metadata
  for (const token of tokenMetadata as any[]) {
    try {
      const collectionSlug = token.collection?.slug
      if (!collectionSlug || processedSeries.has(collectionSlug)) continue

      const seriesInfo = COLLECTION_SERIES_MAP[collectionSlug]
      if (seriesInfo) {
        series.push({
          slug: seriesInfo.slug,
          name: seriesInfo.name,
          cover_image_url: seriesInfo.coverImage || null
        })
        processedSeries.add(collectionSlug)
      }
    } catch (error) {
      console.warn('Error processing series for token:', token.tokenId, error)
    }
  }

  // Process artworks
  for (const token of tokenMetadata as any[]) {
    try {
      if (!token.name || !token.tokenId) continue

      const slug = generateSlug(token.name)
      const collectionSlug = token.collection?.slug
      const contractAddress = token.contract?.address

      // Find mint date
      const mintDateInfo = (mintDates as any[]).find(
        (m) =>
          m?.contractAddress?.toLowerCase() ===
            contractAddress?.toLowerCase() && m?.tokenId === token.tokenId
      )

      // Determine artwork type
      const isEdition =
        token.contract?.tokenType === 'ERC1155' ||
        collectionSlug === 'omentejovem-editions' ||
        (token.contract?.totalSupply &&
          parseInt(token.contract.totalSupply) > 1)

      const artwork: ArtworkInsert = {
        slug,
        title: token.name,
        description: convertDescriptionToTiptap(token.description),
        token_id: `${contractAddress}:${token.tokenId}`,
        mint_date: mintDateInfo?.mintDate || null,
        mint_link: `https://opensea.io/assets/${contractAddress?.includes('KT') ? 'tezos' : 'ethereum'}/${contractAddress}/${token.tokenId}`,
        type: isEdition ? 'edition' : 'single',
        editions_total: isEdition
          ? parseInt(token.contract?.totalSupply || '1') || null
          : null,
        image_url: token.image?.originalUrl || token.image?.cachedUrl || '',
        is_featured: FEATURED_ARTWORKS.includes(slug),
        is_one_of_one: ONE_OF_ONE_COLLECTIONS.includes(collectionSlug || ''),
        posted_at: mintDateInfo?.mintDate || new Date().toISOString()
      }

      artworks.push(artwork)

      // Create series relationship
      if (collectionSlug && COLLECTION_SERIES_MAP[collectionSlug]) {
        seriesArtworkRelations.push({
          series_slug: COLLECTION_SERIES_MAP[collectionSlug].slug,
          artwork_slug: slug
        })
      }
    } catch (error) {
      console.warn('Error processing artwork for token:', token.tokenId, error)
    }
  }

  return { series, artworks, seriesArtworkRelations }
}

// Sample artifacts data
const sampleArtifacts = [
  {
    title: 'The Making Of "The Cycle"',
    description:
      'Behind the scenes content showing the creation process of The Cycle collection.',
    highlight_video_url: 'https://player.vimeo.com/video/example1',
    link_url: 'https://www.omentejovem.com/blog/making-of-the-cycle',
    image_url:
      'https://i.seadn.io/s/raw/files/2f3bff82feaadef5efe51338d20bdfd7.png'
  },
  {
    title: 'Artist Statement 2023',
    description:
      "A comprehensive artist statement reflecting on the journey and evolution of omentejovem's work.",
    highlight_video_url: null,
    link_url: 'https://www.omentejovem.com/artist-statement-2023',
    image_url:
      'https://i.seadn.io/gcs/files/cacbfeb217dd1be2d79a65a765ca550f.jpg'
  },
  {
    title: 'SuperRare Interview',
    description:
      'In-depth interview about the creative process and inspiration behind the SuperRare collection.',
    highlight_video_url: 'https://player.vimeo.com/video/example2',
    link_url: 'https://editorial.superrare.com/omentejovem-interview',
    image_url:
      'https://i.seadn.io/gae/-1VbTF_qOdwTUTxW8KzJbFcMX0-mDF-BJM-gmmRl8ihvoo53PF_1z1m1snLXxwcxVFyJH7wk_kouq-KVyB55N9U'
  }
]

// Sample about page content
const sampleAboutPage = {
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'About omentejovem' }]
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'omentejovem is a digital artist exploring the intersection of abstract art, emotion, and technology. Through NFTs and digital mediums, the work captures moments of introspection, cycles of life, and the beauty found in simplicity.'
          }
        ]
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'The artistic journey began with abstract digital compositions that evolved into narrative pieces exploring themes of identity, belonging, and human connection. Each piece is a reflection on personal experiences and universal emotions that resonate across digital and physical spaces.'
          }
        ]
      }
    ]
  }
}

// POST /api/admin/seed - Seed the database with historical NFT data
export async function POST(request: NextRequest) {
  try {
    console.log('Starting database seeding process...')

    // Process historical metadata
    const { series, artworks, seriesArtworkRelations } = processTokenMetadata()

    console.log(
      `Processing ${series.length} series, ${artworks.length} artworks, ${seriesArtworkRelations.length} relationships`
    )

    // Insert series first
    for (const seriesData of series) {
      try {
        const validatedSeries = CreateSeriesSchema.parse(seriesData)
        const { data: series, error } = await supabaseAdmin
          .from('series')
          .upsert(
            validatedSeries as Database['public']['Tables']['series']['Insert'],
            { onConflict: 'slug' }
          )
          .select()
          .single()

        if (error) throw error
        console.log(`✓ Series created/updated: ${series.name}`)
      } catch (error) {
        console.error('Error processing series:', seriesData.name, error)
      }
    }

    // Insert artworks
    let artworkCount = 0
    for (const artworkData of artworks) {
      try {
        const validatedArtwork = CreateArtworkSchema.parse(artworkData)

        const { data: artwork, error } = await supabaseAdmin
          .from('artworks')
          .upsert(
            validatedArtwork as Database['public']['Tables']['artworks']['Insert'],
            { onConflict: 'slug' }
          )
          .select()
          .single()

        if (error) throw error

        artworkCount++
        console.log(
          `✓ Artwork ${artworkCount}/${artworks.length}: ${artwork.title}`
        )
      } catch (error) {
        console.error('Error processing artwork:', artworkData.title, error)
      }
    }

    // Create series-artwork relationships
    for (const relation of seriesArtworkRelations) {
      try {
        // Get series and artwork IDs
        const { data: series } = await supabaseAdmin
          .from('series')
          .select('id')
          .eq('slug', relation.series_slug)
          .single()

        const { data: artwork } = await supabaseAdmin
          .from('artworks')
          .select('id')
          .eq('slug', relation.artwork_slug)
          .single()

        if (series && artwork) {
          await supabaseAdmin
            .from('series_artworks')
            .upsert(
              { series_id: series.id, artwork_id: artwork.id },
              { onConflict: 'series_id,artwork_id' }
            )
        }
      } catch (error) {
        console.warn(
          'Error creating series-artwork relationship:',
          relation,
          error
        )
      }
    }

    // Insert sample artifacts
    for (const artifactData of sampleArtifacts) {
      try {
        const { error } = await supabaseAdmin
          .from('artifacts')
          .insert(artifactData)

        if (error && !error.message.includes('duplicate')) throw error
      } catch (error) {
        console.warn('Error inserting artifact:', artifactData.title, error)
      }
    }

    // Insert/update about page
    try {
      const { error } = await supabaseAdmin
        .from('about_page')
        .upsert(sampleAboutPage)

      if (error) throw error
      console.log('✓ About page created/updated')
    } catch (error) {
      console.error('Error creating about page:', error)
    }

    console.log('✅ Database seeding completed successfully!')

    return NextResponse.json({
      message: 'Database seeded successfully',
      stats: {
        series: series.length,
        artworks: artworks.length,
        relationships: seriesArtworkRelations.length,
        artifacts: sampleArtifacts.length
      }
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error },
      { status: 500 }
    )
  }
}

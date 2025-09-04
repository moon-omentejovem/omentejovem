import { NFT } from '@/api/resolver/types'
import type { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/server'
import { PortfolioContentProvider } from './provider'

type Artwork = Database['public']['Tables']['artworks']['Row']
type Series = Database['public']['Tables']['series']['Row']
type SeriesArtwork = Database['public']['Tables']['series_artworks']['Row']

interface ArtworkWithSeries extends Artwork {
  /**
   * Optimized image path stored on Supabase (optional while schema evolves)
   */
  image_cached_path?: string | null
  series_artworks: (SeriesArtwork & {
    series: Series
  })[]
}

interface PortfolioPageProps {
  searchParams: {
    type?: 'single' | 'edition'
    series?: string
    featured?: 'true'
    one_of_one?: 'true'
  }
}

// Convert Supabase artwork to NFT format for compatibility
function convertArtworkToNFT(artwork: ArtworkWithSeries): NFT {
  const optimizedImage = artwork.image_cached_path || artwork.image_url || ''

  return {
    nft_id: `${artwork.slug}`,
    chain: 'ethereum' as const,
    contract: {
      address: artwork.token_id || 'unknown',
      name: artwork.title,
      symbol: artwork.slug,
      totalSupply: artwork.editions_total?.toString() || '1',
      tokenType: artwork.type === 'single' ? 'ERC721' : 'ERC1155',
      contractDeployer: 'omentejovem',
      deployedBlockNumber: 0,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: artwork.title,
        collectionSlug: artwork.slug,
        safelistRequestStatus: 'verified',
        imageUrl: optimizedImage,
        description:
          typeof artwork.description === 'string' ? artwork.description : '',
        externalUrl: artwork.mint_link,
        twitterUsername: 'omentejovem',
        discordUrl: '',
        bannerImageUrl: optimizedImage,
        lastIngestedAt: artwork.updated_at || artwork.created_at || ''
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: artwork.token_id || '1',
    tokenType: artwork.type === 'single' ? 'ERC721' : 'ERC1155',
    name: artwork.title,
    description:
      typeof artwork.description === 'string' ? artwork.description : '',
    tokenUri: artwork.image_url || '',
    image: {
      cachedUrl: optimizedImage,
      thumbnailUrl: optimizedImage,
      pngUrl: optimizedImage,
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: artwork.image_url || '',
      displayUrl: optimizedImage
    },
    raw: {
      tokenUri: artwork.image_url || '',
      metadata: {
        image: artwork.image_url || '',
        createdBy: 'omentejovem',
        yearCreated: artwork.mint_date
          ? new Date(artwork.mint_date).getFullYear().toString()
          : '',
        name: artwork.title,
        description:
          typeof artwork.description === 'string' ? artwork.description : '',
        media: null,
        tags: artwork.series_artworks?.map((sa) => sa.series.name) || []
      },
      error: null
    },
    collection: {
      name:
        artwork.series_artworks?.[0]?.series.name || 'Omentejovem Collection',
      slug: artwork.series_artworks?.[0]?.series.slug || 'omentejovem',
      externalUrl: null,
      bannerImageUrl: optimizedImage
    },
    mint: {
      mintAddress: artwork.token_id || null,
      blockNumber: null,
      timestamp: artwork.mint_date || null,
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: artwork.updated_at || artwork.created_at || ''
  }
}

async function getPortfolioData(filters: PortfolioPageProps['searchParams']) {
  const supabase = await createClient()

  let query = supabase
    .from('artworks')
    .select(
      `
      *,
      series_artworks(
        series(name, slug)
      )
    `
    )
    .order('posted_at', { ascending: false })

  // Apply filters
  if (filters.type) {
    query = query.eq('type', filters.type)
  }

  if (filters.featured === 'true') {
    query = query.eq('is_featured', true)
  }

  if (filters.one_of_one === 'true') {
    query = query.eq('is_one_of_one', true)
  }

  if (filters.series) {
    // Filter by series slug - this requires a more complex query
    const { data: seriesData } = await supabase
      .from('series')
      .select('id')
      .eq('slug', filters.series)
      .single()

    if (seriesData) {
      const { data: seriesArtworks } = await supabase
        .from('series_artworks')
        .select('artwork_id')
        .eq('series_id', (seriesData as any).id)

      const artworkIds =
        (seriesArtworks as any[])?.map((sa) => sa.artwork_id) || []
      if (artworkIds.length > 0) {
        query = query.in('id', artworkIds)
      }
    }
  }

  const { data: artworks, error } = await query

  return {
    artworks: (artworks || []) as ArtworkWithSeries[],
    error
  }
}

export default async function PortfolioPage({
  searchParams
}: PortfolioPageProps) {
  const { artworks, error } = await getPortfolioData(searchParams)

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Portfolio</h1>
          <p className="text-neutral-400">{error.message}</p>
        </div>
      </div>
    )
  }

  // Convert artworks to NFT format for compatibility with existing components
  const nftImages: NFT[] = artworks.map(convertArtworkToNFT)

  return (
    <PortfolioContentProvider
      email="contact@omentejovem.com"
      images={nftImages}
    />
  )
}

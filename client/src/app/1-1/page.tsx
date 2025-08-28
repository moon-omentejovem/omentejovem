import type { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/server'
import { OneOfOneContentProvider } from './provider'
import { NFT } from '@/api/resolver/types'
import { ChainedFilter } from '@/components/ArtFilter/filters'

type Artwork = Database['public']['Tables']['artworks']['Row']
type Series = Database['public']['Tables']['series']['Row']
type SeriesArtwork = Database['public']['Tables']['series_artworks']['Row']

interface ArtworkWithSeries extends Artwork {
  series_artworks: (SeriesArtwork & {
    series: Series
  })[]
}

// Convert Supabase artwork to NFT format for compatibility
function convertArtworkToNFT(artwork: ArtworkWithSeries): NFT {
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
        imageUrl: artwork.image_url || '',
        description: typeof artwork.description === 'string' ? artwork.description : '',
        externalUrl: artwork.mint_link,
        twitterUsername: 'omentejovem',
        discordUrl: '',
        bannerImageUrl: artwork.image_url || '',
        lastIngestedAt: artwork.updated_at || artwork.created_at || ''
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: artwork.token_id || '1',
    tokenType: artwork.type === 'single' ? 'ERC721' : 'ERC1155',
    name: artwork.title,
    description: typeof artwork.description === 'string' ? artwork.description : '',
    tokenUri: artwork.image_url || '',
    image: {
      cachedUrl: artwork.image_url || '',
      thumbnailUrl: artwork.image_url || '',
      pngUrl: artwork.image_url || '',
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: artwork.image_url || '',
      displayUrl: artwork.image_url || ''
    },
    raw: {
      tokenUri: artwork.image_url || '',
      metadata: {
        image: artwork.image_url || '',
        createdBy: 'omentejovem',
        yearCreated: artwork.mint_date ? new Date(artwork.mint_date).getFullYear().toString() : '',
        name: artwork.title,
        description: typeof artwork.description === 'string' ? artwork.description : '',
        media: null,
        tags: artwork.series_artworks?.map(sa => sa.series.name) || []
      },
      error: null
    },
    collection: {
      name: artwork.series_artworks?.[0]?.series.name || 'Omentejovem Collection',
      slug: artwork.series_artworks?.[0]?.series.slug || 'omentejovem',
      externalUrl: null,
      bannerImageUrl: artwork.image_url || ''
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

async function getOneOfOneData() {
  const supabase = await createClient()

  const { data: artworks, error } = await supabase
    .from('artworks')
    .select(
      `
      *,
      series_artworks(
        *,
        series(*)
      )
    `
    )
    .eq('type', 'single')
    .eq('is_one_of_one', true)
    .order('posted_at', { ascending: false })

  if (error) {
    console.error('Error fetching 1/1 artworks:', error)
  }

  // Convert artworks to NFT format for compatibility with existing components
  const nftImages: NFT[] = (artworks as ArtworkWithSeries[] || []).map(convertArtworkToNFT)

  // Create filters for 1/1 artworks - simplified version
  const filters: ChainedFilter[] = [
    {
      label: '1/1 Collection',
      children: []
    }
  ]

  return {
    nftImages,
    filters,
    error
  }
}

export default async function OneOfOnePage() {
  const { nftImages, filters, error } = await getOneOfOneData()

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading 1/1 Artworks</h1>
          <p className="text-neutral-400">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <OneOfOneContentProvider
      email="contact@omentejovem.com"
      images={nftImages}
      filters={filters}
      totalPages={Math.ceil(nftImages.length / 12)}
    />
  )
}

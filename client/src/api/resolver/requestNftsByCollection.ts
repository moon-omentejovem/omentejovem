import { NFT } from './types'
import { api } from '../client'

const ALL_NFTS = [
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:5',
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:6',
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:4',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:1',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:2',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:3',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:4',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:5',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:6',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:7',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:8',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:9',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:10'
]

const THE_CYCLE_COLLECTION_ADDRESS =
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43'
const SHAPES_AND_COLORS_COLLECTION_ADDRESS =
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50'
const STORIES_ON_CIRCLES_COLLECTION_ADDRESS =
  '0x0000000000000000000000000000000000000000'

const THE_CYCLE_SLUG = 'the3cycle'
const SHAPES_AND_COLORS_SLUG = 'shapesncolors'
const STORIES_ON_CIRCLES_SLUG = 'storiesoncircles'

interface RequestCollectionNftsResponse {
  email: string
  images: NFT[]
}

export async function requestNftsByCollection(
  slug: string
): Promise<RequestCollectionNftsResponse> {
  if (slug === STORIES_ON_CIRCLES_SLUG) {
    // Return fake tokens for Stories on Circles collection
    const fakeTokens: NFT[] = [
      {
        nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:1`,
        chain: 'ethereum',
        contract: {
          address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
          name: 'Stories on Circles',
          symbol: 'SOC',
          totalSupply: '4',
          tokenType: 'ERC721',
          contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
          deployedBlockNumber: 1,
          openSeaMetadata: {
            floorPrice: 0,
            collectionName: 'Stories on Circles',
            collectionSlug: STORIES_ON_CIRCLES_SLUG,
            safelistRequestStatus: 'verified',
            imageUrl: '/new_series/1_Sitting_at_the_Edge.jpg',
            description: 'Stories on Circles Collection',
            externalUrl: null,
            twitterUsername: '',
            discordUrl: '',
            bannerImageUrl: '',
            lastIngestedAt: new Date().toISOString()
          },
          isSpam: false,
          spamClassifications: []
        },
        token_id: '1',
        tokenType: 'ERC721',
        name: 'Sitting at the Edge',
        description: 'Stories on Circles Collection',
        tokenUri: '',
        image: {
          cachedUrl: '/new_series/1_Sitting_at_the_Edge.jpg',
          thumbnailUrl: '/new_series/1_Sitting_at_the_Edge.jpg',
          pngUrl: '/new_series/1_Sitting_at_the_Edge.jpg',
          contentType: 'image/jpeg',
          size: 0,
          originalUrl: '/new_series/1_Sitting_at_the_Edge.jpg'
        },
        raw: {
          tokenUri: '',
          metadata: {
            image: '/new_series/1_Sitting_at_the_Edge.jpg',
            createdBy: '',
            yearCreated: '2024',
            name: 'Sitting at the Edge',
            description: 'Stories on Circles Collection',
            media: null,
            tags: []
          },
          error: null
        },
        collection: {
          name: 'Stories on Circles',
          slug: STORIES_ON_CIRCLES_SLUG,
          externalUrl: null,
          bannerImageUrl: ''
        },
        mint: {
          mintAddress: null,
          blockNumber: null,
          timestamp: null,
          transactionHash: null
        },
        owners: null,
        timeLastUpdated: new Date().toISOString()
      },
      {
        nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:2`,
        chain: 'ethereum',
        contract: {
          address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
          name: 'Stories on Circles',
          symbol: 'SOC',
          totalSupply: '4',
          tokenType: 'ERC721',
          contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
          deployedBlockNumber: 1,
          openSeaMetadata: {
            floorPrice: 0,
            collectionName: 'Stories on Circles',
            collectionSlug: STORIES_ON_CIRCLES_SLUG,
            safelistRequestStatus: 'verified',
            imageUrl: '/new_series/2_Two_Voices,_One_Circle.jpg',
            description: 'Stories on Circles Collection',
            externalUrl: null,
            twitterUsername: '',
            discordUrl: '',
            bannerImageUrl: '',
            lastIngestedAt: new Date().toISOString()
          },
          isSpam: false,
          spamClassifications: []
        },
        token_id: '2',
        tokenType: 'ERC721',
        name: 'Two Voices, One Circle',
        description: 'Stories on Circles Collection',
        tokenUri: '',
        image: {
          cachedUrl: '/new_series/2_Two_Voices,_One_Circle.jpg',
          thumbnailUrl: '/new_series/2_Two_Voices,_One_Circle.jpg',
          pngUrl: '/new_series/2_Two_Voices,_One_Circle.jpg',
          contentType: 'image/jpeg',
          size: 0,
          originalUrl: '/new_series/2_Two_Voices,_One_Circle.jpg'
        },
        raw: {
          tokenUri: '',
          metadata: {
            image: '/new_series/2_Two_Voices,_One_Circle.jpg',
            createdBy: '',
            yearCreated: '2024',
            name: 'Two Voices, One Circle',
            description: 'Stories on Circles Collection',
            media: null,
            tags: []
          },
          error: null
        },
        collection: {
          name: 'Stories on Circles',
          slug: STORIES_ON_CIRCLES_SLUG,
          externalUrl: null,
          bannerImageUrl: ''
        },
        mint: {
          mintAddress: null,
          blockNumber: null,
          timestamp: null,
          transactionHash: null
        },
        owners: null,
        timeLastUpdated: new Date().toISOString()
      },
      {
        nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:3`,
        chain: 'ethereum',
        contract: {
          address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
          name: 'Stories on Circles',
          symbol: 'SOC',
          totalSupply: '4',
          tokenType: 'ERC721',
          contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
          deployedBlockNumber: 1,
          openSeaMetadata: {
            floorPrice: 0,
            collectionName: 'Stories on Circles',
            collectionSlug: STORIES_ON_CIRCLES_SLUG,
            safelistRequestStatus: 'verified',
            imageUrl: '/new_series/3_The_Ground_Was_My_Teacher.jpg',
            description: 'Stories on Circles Collection',
            externalUrl: null,
            twitterUsername: '',
            discordUrl: '',
            bannerImageUrl: '',
            lastIngestedAt: new Date().toISOString()
          },
          isSpam: false,
          spamClassifications: []
        },
        token_id: '3',
        tokenType: 'ERC721',
        name: 'The Ground Was My Teacher',
        description: 'Stories on Circles Collection',
        tokenUri: '',
        image: {
          cachedUrl: '/new_series/3_The_Ground_Was_My_Teacher.jpg',
          thumbnailUrl: '/new_series/3_The_Ground_Was_My_Teacher.jpg',
          pngUrl: '/new_series/3_The_Ground_Was_My_Teacher.jpg',
          contentType: 'image/jpeg',
          size: 0,
          originalUrl: '/new_series/3_The_Ground_Was_My_Teacher.jpg'
        },
        raw: {
          tokenUri: '',
          metadata: {
            image: '/new_series/3_The_Ground_Was_My_Teacher.jpg',
            createdBy: '',
            yearCreated: '2024',
            name: 'The Ground Was My Teacher',
            description: 'Stories on Circles Collection',
            media: null,
            tags: []
          },
          error: null
        },
        collection: {
          name: 'Stories on Circles',
          slug: STORIES_ON_CIRCLES_SLUG,
          externalUrl: null,
          bannerImageUrl: ''
        },
        mint: {
          mintAddress: null,
          blockNumber: null,
          timestamp: null,
          transactionHash: null
        },
        owners: null,
        timeLastUpdated: new Date().toISOString()
      },
      {
        nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:4`,
        chain: 'ethereum',
        contract: {
          address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
          name: 'Stories on Circles',
          symbol: 'SOC',
          totalSupply: '4',
          tokenType: 'ERC721',
          contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
          deployedBlockNumber: 1,
          openSeaMetadata: {
            floorPrice: 0,
            collectionName: 'Stories on Circles',
            collectionSlug: STORIES_ON_CIRCLES_SLUG,
            safelistRequestStatus: 'verified',
            imageUrl: '/new_series/4_I_Had_Dreams_About_You.jpg',
            description: 'Stories on Circles Collection',
            externalUrl: null,
            twitterUsername: '',
            discordUrl: '',
            bannerImageUrl: '',
            lastIngestedAt: new Date().toISOString()
          },
          isSpam: false,
          spamClassifications: []
        },
        token_id: '4',
        tokenType: 'ERC721',
        name: 'I Had Dreams About You',
        description: 'Stories on Circles Collection',
        tokenUri: '',
        image: {
          cachedUrl: '/new_series/4_I_Had_Dreams_About_You.jpg',
          thumbnailUrl: '/new_series/4_I_Had_Dreams_About_You.jpg',
          pngUrl: '/new_series/4_I_Had_Dreams_About_You.jpg',
          contentType: 'image/jpeg',
          size: 0,
          originalUrl: '/new_series/4_I_Had_Dreams_About_You.jpg'
        },
        raw: {
          tokenUri: '',
          metadata: {
            image: '/new_series/4_I_Had_Dreams_About_You.jpg',
            createdBy: '',
            yearCreated: '2024',
            name: 'I Had Dreams About You',
            description: 'Stories on Circles Collection',
            media: null,
            tags: []
          },
          error: null
        },
        collection: {
          name: 'Stories on Circles',
          slug: STORIES_ON_CIRCLES_SLUG,
          externalUrl: null,
          bannerImageUrl: ''
        },
        mint: {
          mintAddress: null,
          blockNumber: null,
          timestamp: null,
          transactionHash: null
        },
        owners: null,
        timeLastUpdated: new Date().toISOString()
      }
    ]

    return {
      email: 'fake',
      images: fakeTokens
    }
  }

  const formattedQuery = ALL_NFTS?.filter((nft) => {
    const tokenAddress = nft.split(':')[0]
    if (slug === THE_CYCLE_SLUG) {
      return tokenAddress === THE_CYCLE_COLLECTION_ADDRESS
    }
    if (slug === SHAPES_AND_COLORS_SLUG) {
      return tokenAddress === SHAPES_AND_COLORS_COLLECTION_ADDRESS
    }
    return false
  }).map((nft) => {
    const tokenAddress = nft.split(':')[0]
    const tokenId = nft.split(':')[1]
    return {
      contractAddress: tokenAddress,
      tokenId: tokenId
    }
  })

  const data = await fetch(`${api.baseURL}`, {
    method: 'POST',
    headers: {
      'X-API-KEY': api.apiKey || '',
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tokens: formattedQuery
    })
  })

  console.log('!!!', data)

  const jsonData = await data.json()
  const DATA_MAPPED = jsonData as { nfts: NFT[] }

  return {
    email: 'fake',
    images: DATA_MAPPED.nfts
  }
}

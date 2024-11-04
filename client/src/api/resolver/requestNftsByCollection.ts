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

const THE_CYCLE_SLUG = 'the3cycle'
const SHAPES_AND_COLORS_SLUG = 'shapesncolors'

interface RequestCollectionNftsResponse {
  email: string
  images: NFT[]
}

export async function requestNftsByCollection(
  slug: string
): Promise<RequestCollectionNftsResponse> {
  const formattedQuery = ALL_NFTS?.filter((nft) => {
    const tokenAddress = nft.split(':')[0]
    if (slug === THE_CYCLE_SLUG) {
      return tokenAddress === THE_CYCLE_COLLECTION_ADDRESS
    }
    if (slug === SHAPES_AND_COLORS_SLUG) {
      return tokenAddress === SHAPES_AND_COLORS_COLLECTION_ADDRESS
    }
    return false
  })
    .map((nft) => {
      const tokenAddress = nft.split(':')[0]
      const tokenId = nft.split(':')[1]
      return `ethereum.${tokenAddress}.${tokenId}`
    })
    .filter((nft) => nft !== '')
    .join(',')

  const data = await fetch(`${api.baseURL}?nft_ids=${formattedQuery}`, {
    method: 'GET',
    headers: {
      'X-API-KEY': api.apiKey || '',
      Accept: 'application/json'
    }
  })

  const jsonData = await data.json()
  const DATA_MAPPED = jsonData as { nfts: NFT[] }

  return {
    email: 'fake',
    images: DATA_MAPPED.nfts
  }
}

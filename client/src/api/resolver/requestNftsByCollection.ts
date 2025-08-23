import { api } from '../client'
import { NFT } from './types'

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
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:10',
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7:1',
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7:2',
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7:3',
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7:4',
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7:5',
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7:6',
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7:7',
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7:8',
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7:9',
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7:10'
]

const THE_CYCLE_COLLECTION_ADDRESS =
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43'
const SHAPES_AND_COLORS_COLLECTION_ADDRESS =
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50'
const STORIES_ON_CIRCLES_COLLECTION_ADDRESS =
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7'

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
  const formattedQuery = ALL_NFTS?.filter((nft) => {
    const tokenAddress = nft.split(':')[0]
    if (slug === THE_CYCLE_SLUG) {
      return tokenAddress === THE_CYCLE_COLLECTION_ADDRESS
    }
    if (slug === SHAPES_AND_COLORS_SLUG) {
      return tokenAddress === SHAPES_AND_COLORS_COLLECTION_ADDRESS
    }
    if (slug === STORIES_ON_CIRCLES_SLUG) {
      return tokenAddress === STORIES_ON_CIRCLES_COLLECTION_ADDRESS
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

  console.log(
    JSON.stringify({
      tokens: formattedQuery
    })
  )
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

  let DATA_MAPPED: { nfts: NFT[] } = { nfts: [] }
  try {
    const jsonData = await data.json()
    DATA_MAPPED = jsonData as { nfts: NFT[] }
  } catch (e) {
    console.error(e)
  }
  return {
    email: 'fake',
    images: DATA_MAPPED.nfts
  }
}

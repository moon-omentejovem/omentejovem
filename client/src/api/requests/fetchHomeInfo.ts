export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

import { ALL_NFTS } from '@/utils/constants'
import { HomeData, NFT } from '../resolver/types'
import { api } from '../client'

export async function fetchHomeInfo() {
  // Pick 3 random from ALL_NFTS that start with 0x
  const randomNfts = ALL_NFTS.sort(() => Math.random() - 0.5).slice(0, 5)

  const formattedQuery = randomNfts
    .map((nft) => {
      const prefix = nft.startsWith('KT') ? 'tezos.' : 'ethereum.'
      const tokenAddress = nft.split(':')[0]
      const tokenId = nft.split(':')[1]
      return `${prefix}${tokenAddress}.${tokenId}`
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

  const jsonData = (await data.json()) as { nfts: NFT[] }

  console.log(jsonData.nfts[0])

  const formattedNfts = jsonData.nfts.map((nft) => ({
    title: nft.name,
    createdAt: nft.created_date?.toString() || '',
    imageUrl: nft.previews.image_large_url
  }))

  return {
    title: 'Thales Machado',
    subtitle: 'omentejovem',
    nfts: formattedNfts
  } as HomeData
}

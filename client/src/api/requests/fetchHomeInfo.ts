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
    .filter((nft) => !nft.startsWith('KT'))
    .map((nft) => {
      const tokenAddress = nft.split(':')[0]
      const tokenId = nft.split(':')[1]
      return {
        contractAddress: `${tokenAddress}`,
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

  const dataJSON = await data.json()

  console.log(dataJSON.nfts[0])

  const formattedNfts = dataJSON.nfts.map((nft: NFT) => ({
    title: nft.name,
    createdAt: nft.timeLastUpdated?.toString() || '',
    imageUrl:
      nft.image.pngUrl || nft.image.cachedUrl || nft.image.originalUrl || ''
  }))

  return {
    title: 'Thales Machado',
    subtitle: 'omentejovem',
    nfts: formattedNfts
  } as HomeData
}

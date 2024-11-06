export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

import { ALL_NFTS } from '@/utils/constants'
import { HomeData, NFT } from '../resolver/types'
import { api } from '../client'

export async function fetchHomeInfo() {
  // Just to see which are unminted...
  const oldServerData = await fetch(`http://15.229.6.95/nfts/one-of-one`, {
    ...api,
    method: 'GET',
    next: { revalidate: 600 }
  })

  const oldServerDataJSON = await oldServerData.json()

  // console.log('oldServerDataJSON', oldServerDataJSON.nfts)

  for (let i = 0; i < oldServerDataJSON.nfts.length; i++) {
    const nft = oldServerDataJSON.nfts[i]
    if (nft.mintedDate == null) {
      console.log(nft)
    }
  }

  // Pick 3 random from ALL_NFTS that start with 0x
  const randomNfts = ALL_NFTS.filter((nft) => nft.startsWith('0x'))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  const formattedQuery = randomNfts
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

  const jsonData = (await data.json()) as { nfts: NFT[] }

  const formattedNfts = jsonData.nfts.map((nft) => ({
    title: nft.name,
    createdAt: nft.created_date?.toString() || '',
    imageUrl: nft.image_url
  }))

  return {
    title: 'Thales Machado',
    subtitle: 'omentejovem',
    nfts: formattedNfts
  } as HomeData
}

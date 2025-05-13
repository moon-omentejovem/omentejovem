export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

import { ALL_NFTS } from '@/utils/constants'
import { HomeData, NFT } from '../resolver/types'
import { api } from '../client'

export async function fetchHomeInfo() {
  try {
    // Get the NFTs array first
    const nfts = await ALL_NFTS()

    // Pick 5 random from ALL_NFTS that start with 0x and remove duplicates
    const randomNfts = [
      ...new Set(nfts.sort(() => Math.random() - 0.5).slice(0, 10))
    ]
      .filter((nft) => typeof nft === 'string' && !nft.startsWith('KT'))
      .slice(0, 5) as string[]

    // Format the query to include both contract address and token ID
    const formattedQuery = randomNfts.map((nft) => {
      const [address, tokenId] = nft.split(':')
      return { contractAddress: address, tokenId }
    })

    console.log('Fetching NFTs:', formattedQuery)

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

    if (!data.ok) {
      const errorText = await data.text()
      console.error('API Error Response:', errorText)
      throw new Error(
        `API request failed with status ${data.status}: ${errorText}`
      )
    }

    const dataJSON = await data.json()
    console.log('API Response:', dataJSON)

    if (!dataJSON.nfts || !Array.isArray(dataJSON.nfts)) {
      console.error('Unexpected API response structure:', dataJSON)
      return {
        title: 'Thales Machado',
        subtitle: 'omentejovem',
        nfts: []
      } as HomeData
    }

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
  } catch (error) {
    console.error('Error in fetchHomeInfo:', error)
    return {
      title: 'Thales Machado',
      subtitle: 'omentejovem',
      nfts: []
    } as HomeData
  }
}

'use server'

import { ALL_NFTS } from '@/utils/constants'
import { api } from '../client'
import { NFT } from '../resolver/types'
import fetch from 'node-fetch'
import mintDates from '../../../public/mint-dates.json'

interface MintDate {
  contractAddress: string
  tokenId: string
  mintDate: string
}

export async function fetchEditionNfts() {
  try {
    let ALL_DATA: { nfts: NFT[] } = { nfts: [] }

    // Get the NFTs array first
    const nfts = await ALL_NFTS()

    const formattedQuery = nfts
      .filter(
        (nft: unknown) => typeof nft === 'string' && !nft.startsWith('KT')
      )
      .map((nft: string) => {
        const [tokenAddress, tokenId] = nft.split(':')
        return {
          contractAddress: tokenAddress,
          tokenId: tokenId
        }
      })

    console.log('Fetching Edition NFTs:', formattedQuery)

    // Fetch each batch
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

    const jsonData = (await data.json()) as { nfts: NFT[] }

    if (!jsonData.nfts || !Array.isArray(jsonData.nfts)) {
      console.error('Unexpected API response structure:', jsonData)
      return { nfts: [] }
    }

    console.log('API Response received, processing NFTs...')

    // Order by mint date newest first
    ALL_DATA.nfts = jsonData.nfts.sort((a, b) => {
      const aMintDate = mintDates.find(
        (mint: MintDate | null) =>
          mint &&
          mint.contractAddress.toLowerCase() ===
            a.contract.address.toLowerCase() &&
          mint.tokenId === a.tokenId
      )?.mintDate

      const bMintDate = mintDates.find(
        (mint: MintDate | null) =>
          mint &&
          mint.contractAddress.toLowerCase() ===
            b.contract.address.toLowerCase() &&
          mint.tokenId === b.tokenId
      )?.mintDate

      if (!aMintDate) return 1
      if (!bMintDate) return -1

      a.mint.timestamp = aMintDate
      b.mint.timestamp = bMintDate

      return new Date(bMintDate).getTime() - new Date(aMintDate).getTime()
    })

    // Only return if contract.type === 'ERC721'
    ALL_DATA.nfts = ALL_DATA.nfts.filter((nft) => {
      if (nft.contract.address.startsWith('KT')) {
        return nft.tokenType !== 'ERC1155'
      }
      return nft.contract.tokenType === 'ERC1155'
    })

    // Add the chain to the nft
    ALL_DATA.nfts = ALL_DATA.nfts.map((nft) => {
      // @ts-ignore
      nft.chain = nft.contract.address.startsWith('KT') ? 'tezos' : 'ethereum'
      return nft
    })

    return ALL_DATA
  } catch (error) {
    console.error('Error in fetchEditionNfts:', error)
    return { nfts: [] }
  }
}

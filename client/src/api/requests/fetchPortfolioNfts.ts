'use server'

import { api } from '../client'
import { NFT } from '../resolver/types'
import fetch from 'node-fetch'
import {
  ALL_NFTS,
  FAKE_TOKENS,
  STORIES_ON_CIRCLES_COLLECTION_ADDRESS
} from '@/utils/constants'
import mintDates from '../../../public/mint-dates.json'

interface MintDate {
  contractAddress: string
  tokenId: string
  mintDate: string
}

export async function fetchPortfolioNfts() {
  let ALL_DATA: { nfts: NFT[] } = { nfts: [] }

  // Get the NFTs array first
  let nfts = await ALL_NFTS()

  console.log('nfts', nfts)

  const formattedQuery = nfts
    .filter((nft: unknown) => typeof nft === 'string' && !nft.startsWith('KT'))
    .map((nft: string) => {
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

  const jsonData = (await data.json()) as { nfts: NFT[] }
  nfts = [...jsonData.nfts, ...FAKE_TOKENS]

  // Order by mint date newest first
  nfts.sort((a: NFT, b: NFT) => {
    let aMintDate = mintDates.find(
      (mint: MintDate | null) =>
        mint &&
        mint.contractAddress.toLowerCase() ===
          a.contract.address.toLowerCase() &&
        mint.tokenId === a.tokenId
    )?.mintDate

    let bMintDate = mintDates.find(
      (mint: MintDate | null) =>
        mint &&
        mint.contractAddress.toLowerCase() ===
          b.contract.address.toLowerCase() &&
        mint.tokenId === b.tokenId
    )?.mintDate

    // If it is the fake tokens then get the date from mint.timestamp
    if (a.contract.address === STORIES_ON_CIRCLES_COLLECTION_ADDRESS) {
      aMintDate = a.mint.timestamp || ''
    }

    if (b.contract.address === STORIES_ON_CIRCLES_COLLECTION_ADDRESS) {
      bMintDate = b.mint.timestamp || ''
    }

    if (!aMintDate) return 1
    if (!bMintDate) return -1

    a.mint.timestamp = aMintDate
    b.mint.timestamp = bMintDate

    return new Date(bMintDate).getTime() - new Date(aMintDate).getTime()
  })

  // Add the display URL if it's in the mintDates
  nfts = nfts.map((nft: NFT) => {
    const mintDate = mintDates.find(
      (mint: MintDate | null) =>
        mint &&
        mint.contractAddress.toLowerCase() ===
          nft.contract.address.toLowerCase() &&
        mint.tokenId === nft.tokenId
    )

    if (mintDate) {
      nft.image.displayUrl = mintDate.imageUrl || undefined
    }

    return nft
  })

  // Add the chain to the nft
  nfts = nfts.map((nft: NFT) => {
    // @ts-ignore
    nft.chain = nft.contract.address.startsWith('KT') ? 'tezos' : 'ethereum'
    return nft
  })

  return { nfts }
}

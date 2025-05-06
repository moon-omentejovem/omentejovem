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
  let ALL_DATA: { nfts: NFT[] } = { nfts: [] }

  const formattedQuery = ALL_NFTS.filter((nft) => !nft.startsWith('KT')).map(
    (nft) => {
      const tokenAddress = nft.split(':')[0]
      const tokenId = nft.split(':')[1]
      return {
        contractAddress: `${tokenAddress}`,
        tokenId: tokenId
      }
    }
  )

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

  const jsonData = (await data.json()) as { nfts: NFT[] }
  const DATA_MAPPED = jsonData as { nfts: NFT[] }

  console.log('yooo', jsonData.nfts[0])

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
}

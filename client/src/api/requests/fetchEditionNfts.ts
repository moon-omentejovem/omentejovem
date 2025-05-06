'use server'

import { ALL_NFTS } from '@/utils/constants'
import { api } from '../client'
import { NFT } from '../resolver/types'
import fetch from 'node-fetch'

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

  // Order by created_date newest first
  ALL_DATA.nfts = jsonData.nfts.sort((a, b) => {
    return (
      new Date(b.timeLastUpdated || '').getTime() -
      new Date(a.timeLastUpdated || '').getTime()
    )
  })

  // Only return if contract.type === 'ERC721'
  ALL_DATA.nfts = ALL_DATA.nfts.filter((nft) => {
    if (nft.contract.address.startsWith('KT')) {
      return nft.tokenType !== 'ERC1155'
    }
    return nft.contract.tokenType === 'ERC1155'
  })

  return ALL_DATA
}

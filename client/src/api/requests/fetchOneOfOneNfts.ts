'use server'

import { api } from '../client'
import { NFT } from '../resolver/types'
import fetch from 'node-fetch'
import { ALL_NFTS } from '@/utils/constants'

export async function fetchOneOfOneNfts() {
  let ALL_DATA: { nfts: NFT[] } = { nfts: [] }

  const formattedQuery = ALL_NFTS.map((nft) => {
    const prefix = nft.startsWith('KT') ? 'tezos.' : 'ethereum.'
    const tokenAddress = nft.split(':')[0]
    const tokenId = nft.split(':')[1]
    return `${prefix}${tokenAddress}.${tokenId}`
  }).filter((nft) => nft !== '')

  // Batch into groups of 50
  const batches = formattedQuery.reduce((acc, nft, index) => {
    const batchIndex = Math.floor(index / 50)
    acc[batchIndex] = acc[batchIndex] || []
    acc[batchIndex].push(nft)
    return acc
  }, [] as string[][])

  // Fetch each batch
  for (const batch of batches) {
    const data = await fetch(`${api.baseURL}?nft_ids=${batch.join(',')}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': api.apiKey || '',
        Accept: 'application/json'
      }
    })

    const jsonData = (await data.json()) as { nfts: NFT[] }
    ALL_DATA.nfts = [...ALL_DATA.nfts, ...jsonData.nfts]
  }

  // Order by created_date newest first
  ALL_DATA.nfts.sort((a, b) => {
    return (
      new Date(b.created_date || '').getTime() -
      new Date(a.created_date || '').getTime()
    )
  })

  // Only return if contract.type === 'ERC721'
  ALL_DATA.nfts = ALL_DATA.nfts.filter((nft) => {
    if (nft.contract_address.startsWith('KT')) {
      return nft.token_count === 1
    }
    return nft.contract.type === 'ERC721' || nft.contract.type === 'erc721'
  })

  return ALL_DATA
}

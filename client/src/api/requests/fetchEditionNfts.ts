'use server'

import { ALL_NFTS } from '@/utils/constants'
import { api } from '../client'
import { NFT } from '../resolver/types'
import fetch from 'node-fetch'

export async function fetchEditionNfts() {
  let ALL_DATA: { nfts: NFT[] } = { nfts: [] }

  const formattedQuery = ALL_NFTS.map((nft) => {
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

  const jsonData = await data.json()
  ALL_DATA = jsonData as { nfts: NFT[] }

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
      return nft.token_count !== 1
    }
    return nft.contract.type === 'ERC1155'
  })

  return ALL_DATA
}

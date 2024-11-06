'use server'

import { api } from '../client'
import { NFT } from '../resolver/types'
import fetch from 'node-fetch'
import { ALL_NFTS } from '@/utils/constants'

export async function fetchPortfolioNfts() {
  let ALL_DATA: { nfts: NFT[] } = { nfts: [] }

  const formattedQuery = ALL_NFTS.map((nft) => {
    if (nft.startsWith('KT')) {
      return ''
    }
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

  const jsonData = await data.json()
  ALL_DATA = jsonData as { nfts: NFT[] }

  // Order by created_date newest first
  ALL_DATA.nfts.sort((a, b) => {
    return (
      new Date(b.created_date || '').getTime() -
      new Date(a.created_date || '').getTime()
    )
  })

  return ALL_DATA
}

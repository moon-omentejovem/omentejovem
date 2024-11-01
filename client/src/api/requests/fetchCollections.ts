'use server'

import { api } from '../client'
import { NFT } from '../resolver/types'
import fetch from 'node-fetch'

const ALL_NFTS = [
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:5',
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:6',
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:4',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:1',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:2',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:3',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:4',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:5',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:6',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:7',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:8',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:9',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:10'
]

export async function fetchCollections() {
  let ALL_DATA: { collections: NFT[] } = { collections: [] }

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
  ALL_DATA = jsonData as { collections: NFT[] }

  // Order by created_date newest first
  ALL_DATA.collections.sort((a, b) => {
    return (
      new Date(b.created_date || '').getTime() -
      new Date(a.created_date || '').getTime()
    )
  })

  return ALL_DATA
}

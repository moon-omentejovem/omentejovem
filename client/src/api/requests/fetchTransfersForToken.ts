'use server'

import { api } from '../client'
import fetch from 'node-fetch'
import { TransferFromAPI } from '../resolver/types'

export async function fetchTransfersForToken(
  chain: string,
  contractAddress: string,
  tokenId: string
): Promise<TransferFromAPI[]> {
  // Fetch each batch
  const data = await fetch(
    `${api.transfersURL}/${chain}/${contractAddress}/${tokenId}`,
    {
      method: 'GET',
      headers: {
        'X-API-KEY': api.apiKey || '',
        Accept: 'application/json'
      }
    }
  )

  const jsonData = await data.json()
  return (jsonData as { transfers: TransferFromAPI[] }).transfers
}

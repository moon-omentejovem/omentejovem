'use server'

import { api } from '../client'

export async function fetchEditionNfts() {
  const data = await fetch(`${api.baseURL}/nfts/edition`, {
    ...api,
    method: 'GET',
    next: { revalidate: 600 }
  })

  const jsonData = await data.json()
  return jsonData as { nfts: any[] }
}

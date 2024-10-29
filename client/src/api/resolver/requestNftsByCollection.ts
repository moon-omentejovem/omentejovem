import { NFT } from './types'
import { api } from '../client'

interface RequestCollectionNftsResponse {
  email: string
  images: NFT[]
}

export async function requestNftsByCollection(
  slug: string
): Promise<RequestCollectionNftsResponse> {
  const data = await fetch(`${api.baseURL}/nfts/collections/${slug}`, {
    ...api,
    method: 'GET',
    next: { revalidate: 600 }
  })

  const jsonData = await data.json()

  return {
    email: 'fake',
    images: jsonData.nfts
  }
}

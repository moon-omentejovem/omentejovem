'use server'

import { api } from '../client'
import { CollectionsResponse } from '../resolver/types'

export async function fetchCollections() {
  const data = await fetch(`${api.baseURL}/collections`, {
    ...api,
    method: 'GET'
  })

  const jsonData = await data.json()
  return jsonData as CollectionsResponse
}

'use server'

import { api } from '../client'
import { HomeData } from '../resolver/types'

export async function fetchHomeInfo() {
  const data = await fetch(`${api.baseURL}/home`, {
    ...api,
    method: 'GET'
  })

  const jsonData = await data.json()
  return jsonData as HomeData
}

'use server'

import { api } from '../client'
import { NftArt } from '../resolver/types'

export async function fetchOneOfOneNfts() {
	const data = await fetch(
		`${api.baseURL}/nfts/one-of-one`,
		{
			...api,
			method: 'GET',
		},
	)
  
	const jsonData = await data.json()
	return jsonData as { nfts: NftArt[] }
}
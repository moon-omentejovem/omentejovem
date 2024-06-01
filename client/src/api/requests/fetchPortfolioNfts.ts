'use server'

import { api } from '../client'
import { NftArt } from '../resolver/types'

export async function fetchPortfolioNfts() {
	const data = await fetch(
		`${api.baseURL}/nfts`,
		{
			...api,
			method: 'GET',
		},
	)

	const jsonData = await data.json()
	return jsonData as { nfts: NftArt[] }
}

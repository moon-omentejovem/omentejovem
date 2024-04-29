'use server'

import { GetNftEventsResponse } from '../../@types'
import { NftClient } from '../../nftClient'

interface FetchNftProperties {
	addressId: string
	nftId: string
}

export async function fetchNftEvents({ addressId, nftId }: FetchNftProperties) {
	const client = await NftClient.getInstance()

	const data = await fetch(
		`${client.openSeaApi.baseURL}/events/chain/ethereum/contract/${addressId}/nfts/${nftId}?event_type=transfer&limit=4`,
		{
			...client.openSeaApi,
			method: 'GET',
		},
	)

	const jsonData = await data.json()

	return { data: jsonData } as { data: GetNftEventsResponse }
}

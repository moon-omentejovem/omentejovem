'use server'

import { GetNftResponse } from '../../@types'
import { NftClient } from '../../nftClient'

interface GetNftProperties {
	addressId: string
	nftId: string
}

export async function getNft({ addressId, nftId }: GetNftProperties) {
	const client = await NftClient.getInstance()

	const data = await fetch(
		`${client.openSeaApi.baseURL}/chain/ethereum/contract/${addressId}/nfts/${nftId}`,
		{
			...client.openSeaApi,
			method: 'GET',
		},
	)

	const jsonData = await data.json()

	return { data: jsonData } as { data: GetNftResponse }
}

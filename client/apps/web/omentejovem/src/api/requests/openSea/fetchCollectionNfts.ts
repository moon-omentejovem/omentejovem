'use server'

import { GetNftResponse } from '../../@types'
import { NftClient } from '../../nftClient'

export async function fetchCollectionNfts(collection: string) {
	const client = await NftClient.getInstance()

	// https://docs.opensea.io/reference/list_nfts_by_collection
	const data = await fetch(`${client.openSeaApi.baseURL}/collection/${collection}/nfts`, {
		...client.openSeaApi,
		method: 'GET',
	})

	const jsonData = await data.json()

	return { data: jsonData } as { data: { nfts: GetNftResponse['nft'][] } }
}

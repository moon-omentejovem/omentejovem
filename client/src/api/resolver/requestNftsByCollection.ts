import { NftArt } from './types'
import { api } from '../client'

interface RequestCollectionNftsResponse {
	email: string
	images: NftArt[]
}

export async function requestNftsByCollection(
	slug: string,
): Promise<RequestCollectionNftsResponse> {

	const data = await fetch(
		`${api.baseURL}/nfts/collections/${slug}`,
		{
			...api,
			method: 'GET',
		},
	)

	const jsonData = await data.json()

	return {
		email: 'fake',
		images: jsonData.nfts
	};
}

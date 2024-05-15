import { CmsNft } from '@/api/@types'
import { fetchCollections, getNftUrlById } from '@/api/requests'
import { NftClient } from '../nftClient'
import { formatObjktNfts } from './formatObjktNfts'
import { formatOpenSeaNfts } from './formatOpenSeaNfts'
import { generateApiNfts } from './generateApiNfts'
import { ICmsNft } from './requestNfts'
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
		email: "fake",
		images: jsonData.nfts
	};
}

'use server'

import { CmsNft, CollectionsResponse } from '../../@types'
import { api } from '../../client'

export async function fetchCollections() {
	const data = await fetch(
		`${api.baseURL}/collections`,
		{
			...api,
			method: 'GET',
		},
	)

	const jsonData = await data.json()
	return jsonData as CollectionsResponse
}

export async function getNftUrlById(cmsNftId: number) {
	const data = await fetch(
		`${api.baseURL}/nft?include=${cmsNftId}&_embed=wp:featuredmedia&_fields=_links.wp:featuredmedia,_embedded,acf&acf_format=standard&per_page=50`,
		{
			...api,
			method: 'GET',
		},
	)

	const jsonData = await data.json()
	return { data: jsonData } as { data: CmsNft[] }
}

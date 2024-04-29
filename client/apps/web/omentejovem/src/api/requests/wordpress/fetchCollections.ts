'use server'

import { CmsNft, CollectionsPage } from '../../@types'
import { api } from '../../client'

export async function fetchCollections() {
	const data = await fetch(
		`${api.baseURL}/pages?slug=collections&_fields=acf&acf_format=standard`,
		{
			...api,
			method: 'GET',
		},
	)

	const jsonData = await data.json()
	return { data: jsonData } as { data: CollectionsPage[] }
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

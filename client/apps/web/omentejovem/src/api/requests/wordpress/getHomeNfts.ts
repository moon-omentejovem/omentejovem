'use server'

import { api } from '../../client'
import { CmsArt, CmsNft } from '../../@types'

export async function getHomeNfts() {
	const data = await fetch(
		`${api.baseURL}/nft?tags=10&_embed=wp:featuredmedia&_fields=_links.wp:featuredmedia,_embedded,acf,title&acf_format=standard&per_page=50`,
		{
			...api,
			method: 'GET',
		},
	)

	const jsonData = await data.json()
	return { data: jsonData } as { data: CmsNft[] }
}

export async function getHomeArts() {
	const data = await fetch(
		`${api.baseURL}/art?tags=10&_embed=wp:featuredmedia&_fields=_links.wp:featuredmedia,_embedded,acf,title&acf_format=standard&per_page=50`,
		{
			...api,
			method: 'GET',
		},
	)

	const jsonData = await data.json()
	return { data: jsonData } as { data: CmsArt[] }
}

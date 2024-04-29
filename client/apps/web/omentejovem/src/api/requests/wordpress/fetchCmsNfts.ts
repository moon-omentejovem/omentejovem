'use server'

import { CmsArt, CmsNft } from '../../@types'
import { api } from '../../client'

export async function fetchPortfolioNfts(page: number, filters: string = '') {
	const url = new URL('/wordpress/index.php/wp-json/wp/v2/nft', api.baseURL)
	const defaultParams = new URLSearchParams({
		tags: '4',
		_embed: 'wp:featuredmedia',
		_fields: '_links.wp:featuredmedia,_embedded,acf,title',
		acf_format: 'standard',
		per_page: '8',
		orderBy: 'date',
		page: `${page}`,
	}).toString()

	url.search = defaultParams + `&${filters}`

	const data = await fetch(url, {
		...api,
		method: 'GET',
	})

	if (data.status !== 200) {
		return { data: [], totalPages: '0' }
	}

	const jsonData = await data.json()
	const totalPages = data.headers.get('X-WP-TotalPages')

	return { data: jsonData, totalPages: totalPages ?? '0' } as { data: CmsNft[]; totalPages: string }
}

export async function fetchOneOfOneNfts(page: number, filters: string = '') {
	const url = new URL('/wordpress/index.php/wp-json/wp/v2/nft', api.baseURL)
	const defaultParams = new URLSearchParams({
		tags: '5',
		_embed: 'wp:featuredmedia',
		_fields: '_links.wp:featuredmedia,_embedded,acf,title',
		acf_format: 'standard',
		per_page: '8',
		orderBy: 'date',
		page: `${page}`,
	}).toString()

	url.search = defaultParams + `&${filters}`

	const data = await fetch(url, {
		...api,
		method: 'GET',
	})

	if (data.status !== 200) {
		return { data: [], totalPages: '0' }
	}

	const jsonData = await data.json()
	const totalPages = data.headers.get('X-WP-TotalPages')

	return { data: jsonData, totalPages: totalPages ?? '0' } as { data: CmsNft[]; totalPages: string }
}

export async function fetchEditionsNfts(page: number, filters: string = '') {
	const url = new URL('/wordpress/index.php/wp-json/wp/v2/nft', api.baseURL)
	const defaultParams = new URLSearchParams({
		tags: '6',
		_embed: 'wp:featuredmedia',
		_fields: '_links.wp:featuredmedia,_embedded,acf,title',
		acf_format: 'standard',
		per_page: '8',
		orderBy: 'date',
		page: `${page}`,
	}).toString()

	url.search = defaultParams + `&${filters}`

	const data = await fetch(url, {
		...api,
		method: 'GET',
	})

	if (data.status !== 200) {
		return { data: [], totalPages: '0' }
	}

	const jsonData = await data.json()
	const totalPages = data.headers.get('X-WP-TotalPages')

	return { data: jsonData, totalPages: totalPages ?? '0' } as { data: CmsNft[]; totalPages: string }
}

export async function fetchPortfolioArts(page: number, filters: string = '') {
	const url = new URL('/wordpress/index.php/wp-json/wp/v2/art', api.baseURL)
	const defaultParams = new URLSearchParams({
		tags: '4',
		_embed: 'wp:featuredmedia',
		_fields: '_links.wp:featuredmedia,_embedded,acf,title',
		acf_format: 'standard',
		per_page: '8',
		orderBy: 'date',
		page: `${page}`,
	}).toString()

	url.search = defaultParams + `&${filters}`

	const data = await fetch(url, {
		...api,
		method: 'GET',
	})

	if (data.status !== 200) {
		return { data: [] }
	}

	const jsonData = await data.json()
	return { data: jsonData } as { data: CmsArt[] }
}

export async function fetchOneOfOneArts(page: number, filters: string = '') {
	const url = new URL('/wordpress/index.php/wp-json/wp/v2/art', api.baseURL)
	const defaultParams = new URLSearchParams({
		tags: '5',
		_embed: 'wp:featuredmedia',
		_fields: '_links.wp:featuredmedia,_embedded,acf,title',
		acf_format: 'standard',
		per_page: '8',
		orderBy: 'date',
		page: `${page}`,
	}).toString()

	url.search = defaultParams + `&${filters}`

	const data = await fetch(url, {
		...api,
		method: 'GET',
	})

	if (data.status !== 200) {
		return { data: [] }
	}

	const jsonData = await data.json()
	return { data: jsonData } as { data: CmsArt[] }
}

export async function fetchEditionsArts(page: number, filters: string = '') {
	const url = new URL('/wordpress/index.php/wp-json/wp/v2/art', api.baseURL)
	const defaultParams = new URLSearchParams({
		tags: '6',
		_embed: 'wp:featuredmedia',
		_fields: '_links.wp:featuredmedia,_embedded,acf,title',
		acf_format: 'standard',
		per_page: '8',
		orderBy: 'date',
		page: `${page}`,
	}).toString()

	url.search = defaultParams + `&${filters}`

	const data = await fetch(url, {
		...api,
		method: 'GET',
	})

	if (data.status !== 200) {
		return { data: [] }
	}

	const jsonData = await data.json()
	return { data: jsonData } as { data: CmsArt[] }
}

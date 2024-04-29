'use server'

import { AboutPage, PressTalk } from '@/app/about/@types/wordpress'
import { api } from '../../client'

export async function getAboutInfo() {
	const data = await fetch(`${api.baseURL}/pages?slug=about&acf_format=standard`, {
		...api,
		method: 'GET',
	})

	const jsonData = await data.json()
	return { data: jsonData } as { data: AboutPage[] }
}

export async function fetchAboutTalks() {
	const data = await fetch(
		`${api.baseURL}/posts?categories=12&_fields=acf,title&acf_format=standard`,
		{
			...api,
			method: 'GET',
		},
	)

	const jsonData = await data.json()
	return { data: jsonData } as { data: PressTalk[] }
}

export async function fetchAboutPress() {
	const data = await fetch(
		`${api.baseURL}/posts?categories=13&_fields=acf,title&acf_format=standard`,
		{
			...api,
			method: 'GET',
		},
	)

	const jsonData = await data.json()
	return { data: jsonData } as { data: PressTalk[] }
}

export async function fetchAboutExhibitions() {
	const data = await fetch(
		`${api.baseURL}/posts?categories=14&_fields=acf,title&acf_format=standard`,
		{
			...api,
			method: 'GET',
		},
	)

	const jsonData = await data.json()
	return { data: jsonData } as { data: PressTalk[] }
}

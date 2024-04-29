'use server'

import { api } from '../../client'
import { HomePage } from '../../@types'

export async function getHomeInfo() {
	const data = await fetch(`${api.baseURL}/pages?slug=home`, {
		...api,
		method: 'GET',
	})

	const jsonData = await data.json()
	return { data: jsonData } as { data: HomePage[] }
}

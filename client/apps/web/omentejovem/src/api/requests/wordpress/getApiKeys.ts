'use server'

import { api } from '../../client'
import { ApiKeys } from '../../@types'

export async function getApiKeys() {
	const data = await fetch(`${api.baseURL}/api-key`, {
		...api,
		method: 'GET',
	})

	const jsonData = await data.json()
	return { data: jsonData } as { data: ApiKeys[] }
}

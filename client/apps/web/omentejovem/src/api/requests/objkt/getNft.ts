import {
	FetchObjktNftTransfersQueryResult,
	GetObjktNftQueryResult,
	fetchObjktNftTransfersQuery,
	getObjktNftQuery,
} from './graphql'

interface GetObjktNftVariables {
	tokenId: string
	fa2: string
	userAddress: string
}

export async function getObjktNft(
	variables: GetObjktNftVariables,
): Promise<GetObjktNftQueryResult> {

	
	const data = await fetch('https://data.objkt.com/v3/graphql', {
		method: 'POST',
		body: JSON.stringify({
			query: getObjktNftQuery,
			variables,
		}),
		headers: {
			'Content-Type': 'application/json',
		},
		next: {
			revalidate: 3600,
		},
	})

	const jsonData = await data.json()

	const response = jsonData.data as GetObjktNftQueryResult

	const dataEvents = await fetch('https://data.objkt.com/v3/graphql', {
		method: 'POST',
		body: JSON.stringify({
			query: fetchObjktNftTransfersQuery,
			variables: {
				order_by: [
					{
						timestamp: 'desc',
					},
					{
						id: 'desc',
					},
				],
				limit: 2,
				offset: 0,
				where: {
					token: {
						_or: [
							{
								decimals: {
									_is_null: true,
								},
							},
							{
								decimals: {
									_eq: 0,
								},
							},
						],
					},
					reverted: {
						_neq: true,
					},
					event_type: {
						_eq: 'transfer',
					},
					token_pk: {
						_eq: 5986336,
					},
				},
			},
		}),
		headers: {
			'Content-Type': 'application/json',
		},
		next: {
			revalidate: 3600,
		},
	})

	const jsonEventsData = await dataEvents.json()
	
	console.log(jsonEventsData)

	const transactions = jsonEventsData as { data: FetchObjktNftTransfersQueryResult }

	return { ...response, transactions: transactions.data }
}

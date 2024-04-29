import { gql } from 'graphql-request'

export interface GetObjktNftQueryResult {
	token: {
		pk: number
		token_id: string
		fa_contract: string
		artifact_uri: string
		description: string
		display_uri: string
		supply: number
		name: string
		mime: string
		metadata: string
		timestamp: string
		fa: {
			name: string
			path: string
		}
	}[]
	transactions: FetchObjktNftTransfersQueryResult
}

export const getObjktNftQuery = gql`
	query tokenGetToken($tokenId: String!, $fa2: String!, $userAddress: String) {
		token(where: { token_id: { _eq: $tokenId }, fa_contract: { _eq: $fa2 } }, limit: 1) {
			...TokenToken
			holders(where: { holder_address: { _eq: $userAddress }, quantity: { _gt: "0" } }) {
				...TokenTokenUser
				__typename
			}
			__typename
		}
		collection_offers: offer_active(
			order_by: { price_xtz: desc }
			where: { collection_offer: { _eq: $fa2 } }
		) {
			...TokenOfferActive
			__typename
		}
	}

	fragment TokenToken on token {
		pk
		token_id
		fa_contract
		artifact_uri
		description
		display_uri
		supply
		name
		mime
		metadata
		timestamp
		fa {
			name
			path
			__typename
		}
		__typename
	}

	fragment TokenOfferActive on offer_active {
		marketplace_contract
		bigmap_key
		expiry
		price
		price_xtz
		shares
		buyer {
			address
			alias
			tzdomain
			twitter
			logo
			__typename
		}
		currency {
			fa_contract
			decimals
			type
			symbol
			__typename
		}
		__typename
	}

	fragment TokenTokenUser on token_holder {
		holder_address
		quantity
		holder {
			address
			alias
			tzdomain
			logo
			__typename
		}
		__typename
	}
`
export interface FetchObjktNftTransfersQueryResult {
	event: {
		id: number
		timestamp: string
		token_pk: number
		fa_contract: string
		ophash: string
		level: number
		creator: {
			address: string
			alias: string | null
			tzdomain: string | null
			logo: string | null
		}
		recipient: {
			address: string
			alias: string | null
			tzdomain: string | null
			logo: string | null
		}
	}[]
}

export const fetchObjktNftTransfersQuery = gql`
	query activityEventsSimple(
		$where: event_bool_exp!
		$order_by: [event_order_by!] = {}
		$limit: Int = 100
		$offset: Int = 0
	) {
		event(order_by: $order_by, limit: $limit, offset: $offset, where: $where) {
			...ActivityEvent
			__typename
		}
	}

	fragment ActivityEvent on event {
		id
		timestamp
		token_pk
		fa_contract
		ophash
		level
		creator {
			...ActivityEventHolder
			__typename
		}
		recipient {
			...ActivityEventHolder
			__typename
		}
		__typename
	}

	fragment ActivityEventHolder on holder {
		address
		alias
		tzdomain
		logo
		__typename
	}
`

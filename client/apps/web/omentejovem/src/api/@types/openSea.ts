interface NftOwner {
	address: string
	quantity: string
}

export interface OpenSeaNft {
	identifier: string
	name: string
	contract: string
	description: string
	updated_at: string
	created_at: string
	image_url: string
	nft_url: string
}

export interface GetNftResponse {
	nft: OpenSeaNft
	owners: NftOwner[] | null
}

export interface NftTransferEvent {
	eventType: 'transfer'
	chain: 'ethereum'
	transaction: string
	fromAddress: string
	toAddress: string
	eventTimestamp: number
}

export interface GetNftEventsResponse {
	asset_events: NftTransferEvent[]
}

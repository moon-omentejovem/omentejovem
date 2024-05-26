export function isNftArt(value: unknown): value is NftArt {
	return typeof value === 'object' && !!value && 'mintedDate' in value && 'nftChain' in value
}

export interface NftContractButton {
	label: string
	status: boolean
}

type EthKey = string | `${string}_button` | `${string}_url`

export interface NftArt {
	name: string
	url: string
	description: string
	createdAt: string
	availablePurchase?: {
		active: boolean
		status: boolean
		text: string
		textAvailable: string
		url: string
	}
	contracts?: {
		eth: {
			[x in EthKey]: boolean | string | NftContractButton
		}
		xtz: {
			[x in EthKey]: boolean | string | NftContractButton
		}
	}[]
	videoProcess?: string
	nftChain: 'ethereum' | 'tezos' | 'unknown'
	etherscan: boolean
	id: string
	address: string
	mintedDate: string
	nftUrl: string
	makeOffer: {
		active: boolean
		buttonText: string
	}
	owner?: {
		address: string
		url: string
	}
	transactions?: NftTransferEvent[],
	externalLinks: ExternalLink[]
}

export interface NftTransferEvent {
	fromAddress: string
	toAddress: string,
	eventDate: Date,
	eventType: string
}

export interface ExternalLink {
	name: string,
	url: string
}

export interface Collection {
	name: string
	year: string
	slug: string
	nftImageUrls: string[]
}

export interface CollectionsResponse {
	collections: Collection[]
}

export interface HomeData {
	title: string
	subtitle: string
}

import { NftData, NftTransferEvent } from '@/api/@types'

export interface ArtImage {
	name: string
	url: string
	description: string
	created_at: string
	available_purchase?: NftData['available_purchase']
	contracts?: NftData['contracts']
	video_process?: string
}

export function isNftArt(value: unknown): value is NftArt {
	return typeof value === 'object' && !!value && 'mintedDate' in value && 'nftChain' in value
}

export interface NftArt {
	name: string
	url: string
	description: string
	createdAt: string
	availablePurchase?: NftData['available_purchase']
	contracts?: NftData['contracts']
	videoProcess?: string
	nftChain: 'ethereum' | 'tezos' | 'unknown'
	etherscan: boolean
	id: string
	address: string
	mintedDate: string
	nftUrl: string
	makeOffer: NftData['make_offer']
	owner?: {
		address: string
		url: string
	}
	transactions?: NftTransferEvent[],
	externalLinks: ExternalLink[]
}

export interface ExternalLink {
	name: string,
	url: string
}

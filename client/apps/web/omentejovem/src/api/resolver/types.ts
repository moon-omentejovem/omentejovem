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

export interface NftArt extends ArtImage {
	nftChain: 'ethereum' | 'tezos' | 'unknown'
	etherscan: boolean
	id: string
	address: string
	mintedDate: string
	nft_url: string
	contracts: NftData['contracts']
	makeOffer: NftData['make_offer']
	owner?: {
		address: string
		url: string
	}
	transactions?: NftTransferEvent[]
}

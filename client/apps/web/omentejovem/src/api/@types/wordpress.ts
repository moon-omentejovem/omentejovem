export interface AboutData {
	title: string
	subtitle: string
	subtitle_art: string | false
	bio: string
	social_media: {
		twitter: string
		instagram: string
		aotm: string
		superrare: string
		foundation: string
		opensea: string
		objkt: string
	}
	contact: {
		email: string
	}
}

export interface AboutPage {
	acf: AboutData
}

export interface ApiKeys {
	title: {
		rendered: string
	}
	acf: {
		key: string
	}
}

export interface HomeData {
	title: string
	subtitle: string
}

export interface HomePage {
	acf: HomeData
}

export interface NftContractButton {
	label: string
	status: boolean
}

type EthKey = string | `${string}_button` | `${string}_url`

export interface NftData {
	opensea: string
	etherscan: boolean
	objkt: {
		token: string
		id: string
	}
	creation_date: string
	quantity: number
	video_process: string
	description: string
	available_purchase: {
		active: boolean
		status: boolean
		text: string
		text_available: string
		url: string
	}
	make_offer: {
		active: boolean
		button_text: string
	}
	contracts: {
		eth: {
			[x in EthKey]: boolean | string | NftContractButton
		}
		xtz: {
			[x in EthKey]: boolean | string | NftContractButton
		}
	}
}

export interface CmsNft {
	id: number
	title: {
		rendered: string
	}
	acf: NftData
	_embedded: {
		'wp:featuredmedia': {
			source_url: string
		}[]
	}
}

export interface Collection {
	slug: string
	title: string
	year: number
	background_url: string[]
	nfts: number[]
}

export interface CollectionsData {
	[x: string]: Collection
}

export interface CollectionsPage {
	acf: CollectionsData
}

export type CmsArt = CmsNft

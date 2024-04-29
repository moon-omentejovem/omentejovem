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
		'e-mail': string
	}
}

export interface AboutPage {
	acf: AboutData
}

export interface PressTalk {
	title: {
		rendered: string
	}
	acf: {
		link: string
	}
}

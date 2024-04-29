import { parseDate } from '@/utils/parseDate'
import { v4 } from 'uuid'
import { CmsNft } from '../@types'
import { ArtImage } from './types'

export function formatArts(cmsArts: CmsNft[]): ArtImage[] {
	return cmsArts.map((singleArt) => {
		const cmsArt = singleArt.acf

		const parsedDate = cmsArt?.creation_date?.includes('/')
			? cmsArt.creation_date
			: parseDate(cmsArt?.creation_date ?? '')

		return {
			nftChain: 'unknown',
			id: v4(),
			name: singleArt.title.rendered,
			etherscan: cmsArt?.etherscan,
			url: singleArt?._embedded?.['wp:featuredmedia'][0].source_url,
			nft_url: singleArt?._embedded?.['wp:featuredmedia'][0].source_url,
			description: cmsArt.description,
			video_process: cmsArt?.video_process,
			available_purchase: cmsArt?.available_purchase,
			contracts: cmsArt?.contracts,
			makeOffer: cmsArt?.make_offer,
			mintedDate: parsedDate,
			created_at: parsedDate,
		}
	}) as ArtImage[]
}

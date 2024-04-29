import { parseDate } from '@/utils/parseDate'
import { GetAllNftInformationResponse, ICmsNft } from './requestNfts'
import { ArtImage } from './types'
import { fromUnixTime } from 'date-fns'

export function formatOpenSeaNfts(
	openSeaNfts: GetAllNftInformationResponse[],
	cmsNft: Map<string, ICmsNft>,
): ArtImage[] {
	return openSeaNfts
		.map((singleNft) => {
			const { nft, owners } = singleNft.nft
			const transactions = singleNft.events

			if (!nft || !singleNft) return undefined

			const cmsData = cmsNft.get(`${nft.contract}:${nft.identifier}`)

			const parsedDate = cmsData?.creation_date.includes('/')
				? cmsData.creation_date
				: parseDate(cmsData?.creation_date ?? '')

			const mintedTransaction = transactions?.find((transaction) =>
				/0x[0]{40}$/i.test(transaction.from_address),
			)

			return {
				nftChain: 'ethereum',
				id: nft.identifier,
				address: nft.contract,
				name: nft.name,
				etherscan: cmsData?.etherscan,
				url: cmsData?._embedded?.['wp:featuredmedia'][0].source_url ?? nft.image_url,
				nft_url: nft.image_url,
				description: cmsData?.description ? cmsData.description : nft.description,
				video_process: cmsData?.video_process ? cmsData.video_process : undefined,
				available_purchase: cmsData?.available_purchase,
				contracts: cmsData?.contracts,
				makeOffer: cmsData?.make_offer,
				mintedDate: !!mintedTransaction?.event_timestamp
					? fromUnixTime(mintedTransaction.event_timestamp).toISOString()
					: parsedDate,
				created_at: nft.created_at?.trim()
					? nft.created_at.trim()
					: cmsData?.creation_date
					  ? parsedDate
					  : nft.updated_at,
				...(owners && {
					owner: {
						address: owners[0].address ?? 'More than 50 owners',
						url: `https://etherscan.io/address/${owners[0].address}`,
					},
				}),
				transactions,
			}
		})
		.filter(Boolean) as ArtImage[]
}

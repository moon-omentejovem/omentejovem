import { parseDate } from '@/utils/parseDate'
import { GetObjktNftQueryResult } from '../requests/objkt'
import { ICmsNft } from './requestNfts'
import { ArtImage, NftArt } from './types'

export function formatObjktNfts(
	objktNfts: GetObjktNftQueryResult[],
	cmsNft: Map<string, ICmsNft>,
): NftArt[] {
	return objktNfts.map((singleNft) => {
		const { token, transactions } = singleNft
		const nft = token[0]
		const cmsData = cmsNft.get(`${nft.token_id}:${nft.fa_contract}`)

		const parsedDate = cmsData?.creation_date.includes('/')
			? cmsData.creation_date
			: parseDate(cmsData?.creation_date ?? '')

		const displayUrl = nft.display_uri.split('/').at(-1)
		const nftUrl = nft.artifact_uri.split('/').at(-1)

		return {
			nftChain: 'tezos',
			id: nft.token_id,
			address: nft.fa_contract,
			name: nft.name,
			url:
				cmsData?._embedded?.['wp:featuredmedia'][0].source_url ??
				`https://cloudflare-ipfs.com/ipfs/${displayUrl}`,
			nftUrl: `https://cloudflare-ipfs.com/ipfs/${nftUrl}`,
			description: cmsData?.description ? cmsData.description : nft.description,
			videoProcess: cmsData?.video_process ? cmsData.video_process : undefined,
			mintedDate: nft.timestamp,
			availablePurchase: cmsData?.available_purchase,
			contracts: cmsData?.contracts,
			makeOffer: null,
			createdAt: parsedDate,
			transactions: transactions.event.map((transaction) => ({
				transaction: transaction.ophash,
				from_address: transaction.creator.address,
				to_address: transaction.recipient.address,
				event_timestamp: new Date(transaction.timestamp).getTime(),
			})),
			etherscan: false
		}
	})
}

import { CmsArt, CmsNft, GetNftResponse, NftData, NftTransferEvent } from '@/api/@types'
import {
	fetchEditionsArts,
	fetchEditionsNfts,
	fetchNftEvents,
	fetchOneOfOneArts,
	fetchOneOfOneNfts,
	fetchPortfolioArts,
	fetchPortfolioNfts,
	getNft,
} from '@/api/requests'
import { Filter } from '@/components/Filter'
import { NftClient } from '../nftClient'
import { GetObjktNftQueryResult } from '../requests/objkt'
import { getObjktNft } from '../requests/objkt/getNft'
import { formatArts } from './formatArts'
import { formatObjktNfts } from './formatObjktNfts'
import { formatOpenSeaNfts } from './formatOpenSeaNfts'
import { generateFilters } from './generateFilters'
import { ArtImage } from './types'

export interface RequestNftsProperties {
	page: 'editions' | 'oneOfOne' | 'portfolio' | string
	currentPage?: number
	collectionsSlug?: string
	filterParams?: string
	onlyArts?: boolean
}

export interface RequestPortfolioArtsResponse {
	email: string
	images: ArtImage[]
	filters: Filter[]
	totalPages: number
}

export interface GetAllNftInformationResponse {
	nft: GetNftResponse
	events: NftTransferEvent[]
}

export type Contracts = keyof NftData['contracts']['eth'] | keyof NftData['contracts']['xtz']

export type ICmsNft = NftData & Pick<CmsNft, '_embedded'>

export async function getAllNftInformation(
	addressId: string,
	nftId: string,
): Promise<GetAllNftInformationResponse> {
	const nftResponse = await getNft({ addressId, nftId })
	const nftEventsReponse = await fetchNftEvents({ addressId, nftId })

	return {
		nft: nftResponse.data,
		events: nftEventsReponse.data.asset_events,
	}
}

export async function requestNfts({
	page,
	currentPage = 1,
	filterParams = '',
	onlyArts = false,
}: RequestNftsProperties): Promise<RequestPortfolioArtsResponse> {
	const promises: Promise<{ data: CmsNft[]; totalPages?: string }>[] = []
	let response: { data: CmsNft[]; totalPages?: string } | undefined = undefined
	let artResponse: { data: CmsNft[]; totalPages?: string } | undefined = undefined

	try {
		// TO-DO: This doesn't make any sense
		switch (page) {
			case 'editions':
				if (!onlyArts) {
					promises.push(
						fetchEditionsNfts(currentPage, filterParams), // TO-DO: why repeat?
						fetchEditionsArts(currentPage, filterParams),
					)
				} else {
					artResponse = await fetchEditionsArts(currentPage, filterParams)
				}
				break

			case '1-1': //TO-DO: fr?
			case 'oneOfOne':
				if (!onlyArts) {
					promises.push(
						fetchOneOfOneNfts(currentPage, filterParams),
						fetchOneOfOneArts(currentPage, filterParams),
					)
				} else {
					artResponse = await fetchOneOfOneArts(currentPage, filterParams)
				}
				break

			case 'portfolio':
				if (!onlyArts) {
					promises.push(
						fetchPortfolioNfts(currentPage, filterParams),
						fetchPortfolioArts(currentPage, filterParams),
					)
				} else {
					artResponse = await fetchPortfolioArts(currentPage, filterParams)
				}
				break

			default:
				throw new Error('Invalid page request')
		}

		if (!onlyArts) {
			[response, artResponse] = await Promise.all(promises)
		}

		const data =
			(response?.data.map((nft) => ({ ...nft.acf, _embedded: nft._embedded })) as ICmsNft[]) ?? []
		const artData = artResponse!.data as CmsArt[]

		const openSeaNftPromises: Promise<GetAllNftInformationResponse>[] = []
		const objktNftPromises: Promise<GetObjktNftQueryResult>[] = []

		const cmsNft = new Map<string, ICmsNft>()

		for (const nftImage of data) {
			if (nftImage.opensea) {
				const [nftIdWithParameters, addressId] = nftImage.opensea.split('/').reverse()
				const [nftId] = nftIdWithParameters.split('?')
				cmsNft.set(`${addressId}:${nftId}`, nftImage)
				openSeaNftPromises.push(getAllNftInformation(addressId, nftId))
			}

			if (Object.values(nftImage.objkt).every((value) => value)) {
				const { id, token } = nftImage.objkt
				cmsNft.set(`${id}:${token}`, nftImage)
				objktNftPromises.push(getObjktNft({ fa2: token, tokenId: id, userAddress: '' }))
			}
		}

		const [allOpenSeaNfts, allObjktNfts] = await Promise.all([
			Promise.all(openSeaNftPromises),
			Promise.all(objktNftPromises),
		])

		const allImages = [
			...formatObjktNfts(allObjktNfts, cmsNft),
			...formatOpenSeaNfts(allOpenSeaNfts, cmsNft),
			...formatArts(artData ?? []),
		].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

		const filters = generateFilters()

		return {
			email: NftClient.email,
			images: allImages,
			filters,
			totalPages: Number(response?.totalPages ?? artResponse?.totalPages ?? 0),
		}
	} catch (error) {
		console.log('#ERROR:', error)

		throw new Error('There was an internal error.')
	}
}

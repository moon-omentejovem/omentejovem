import { CmsArt, CmsNft, GetNftResponse, NftData } from '@/api/@types'
import { getHomeArts, getHomeInfo, getHomeNfts, getNft } from '@/api/requests'
import { decodeRenderedString } from '@/utils/decodeRenderedString'
import { parseDate } from '@/utils/parseDate'
import HomeContent, { HomePageData } from './home/content'
import { GetAllNftInformationResponse, getAllNftInformation } from '@/api/resolver/requestNfts'
import { GetObjktNftQueryResult, getObjktNft } from '@/api/requests/objkt'

type ICmsNft = NftData & Pick<CmsNft, '_embedded'>

async function requestGetHomeInfo() {
	try {
		const response = await getHomeInfo()

		const data = response.data[0].acf

		const imagesResponse = await getHomeNfts()
		const artResponse = await getHomeArts()

		const parsedData = imagesResponse.data.length ? 
			imagesResponse.data.map((nft) => ({
				...nft.acf,
				_embedded: nft._embedded,
			})) : [] as ICmsNft[]

		const openSeaNftPromises: Promise<GetAllNftInformationResponse>[] = []
		const objktNftPromises: Promise<GetObjktNftQueryResult>[] = []

		const cmsNft = new Map<string, ICmsNft>()

		for (const nftImage of parsedData) {
			if (nftImage.opensea) {
				const [nftId, addressId] = nftImage.opensea.split('/').reverse()
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

		const artData = artResponse.data as CmsArt[]

		const backgroundImages = [
			...(allOpenSeaNfts
				.map((nftResponse) => {
					const { nft } = nftResponse.nft

					if (!nft) return undefined

					const cmsData = cmsNft.get(`${nft.contract}:${nft.identifier}`)

					const parsedDate = cmsData?.creation_date.includes('/')
						? cmsData.creation_date
						: parseDate(cmsData?.creation_date ?? '')

					return {
						title: nft.name,
						image_url: cmsData?._embedded?.['wp:featuredmedia'][0].source_url ?? nft.image_url,
						created_at: nft.created_at?.trim()
							? nft.created_at.trim()
							: cmsData?.creation_date
							  ? parsedDate
							  : nft.updated_at,
					}
				})
				.filter(Boolean) as HomePageData['background_images']),
			...allObjktNfts.map((singleNft) => {
				const { token } = singleNft
				const nft = token[0]
				const cmsData = cmsNft.get(`${nft.token_id}:${nft.fa_contract}`)

				const parsedDate = cmsData?.creation_date.includes('/')
					? cmsData.creation_date
					: parseDate(cmsData?.creation_date ?? '')

				const displayUrl = nft.display_uri.split('/').at(-1)

				return {
					title: nft.name,
					image_url:
						cmsData?._embedded?.['wp:featuredmedia'][0].source_url ??
						`https://cloudflare-ipfs.com/ipfs/${displayUrl}`,
					created_at: parsedDate,
				}
			}),
		]

		return {
			...data,
			background_images: [
				...backgroundImages,
				...artData.map((art) => ({
					title: decodeRenderedString(art.title.rendered),
					image_url: art._embedded?.['wp:featuredmedia'][0].source_url,
					created_at: art.acf.creation_date?.includes('/')
						? art.acf.creation_date
						: parseDate(art.acf.creation_date ?? ''),
				})),
			],
		}
	} catch (error) {
		console.log('#ERROR:', error)
	}
}

export default async function Home() {
	const data = {
		title: 'Thales Machado',
		subtitle: 'omentejovem',
		background_images: []
	}

	return <HomeContent data={data} />
}

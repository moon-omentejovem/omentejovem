import { CmsNft } from '@/api/@types'
import { fetchCollections, getNftUrlById } from '@/api/requests'
import { NftClient } from '../nftClient'
import { formatObjktNfts } from './formatObjktNfts'
import { formatOpenSeaNfts } from './formatOpenSeaNfts'
import { generateApiNfts } from './generateApiNfts'
import { ICmsNft } from './requestNfts'
import { NftArt } from './types'

interface RequestCollectionNftsResponse {
	email: string
	images: Omit<NftArt, 'contracts'>[]
}

export async function requestNftsByCollection(
	slug: string,
): Promise<RequestCollectionNftsResponse> {
	try {
		const response = await fetchCollections()

		const allCollections = response.data[0].acf
		const cmsNftPromises: Promise<{ data: CmsNft[] }>[] = []

		for (const collection of Object.values(allCollections)) {
			if (collection.slug !== slug) continue

			for (const id of collection.nfts) {
				cmsNftPromises.push(getNftUrlById(id))
			}
		}

		const allCmsNfts = await Promise.all(cmsNftPromises)

		const parsedCmsNfts = allCmsNfts.map((cmsNft) => cmsNft.data).flat()
		const data = parsedCmsNfts.map((nft) => ({ ...nft.acf, _embedded: nft._embedded })) as ICmsNft[]

		const { allObjktNfts, allOpenSeaNfts, cmsNft } = await generateApiNfts(data)

		const allImages = [
			...formatObjktNfts(allObjktNfts, cmsNft),
			...formatOpenSeaNfts(allOpenSeaNfts, cmsNft),
		].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

		return {
			email: NftClient.email,
			images: allImages.filter(Boolean) as NftArt[],
		}
	} catch (error) {
		console.log('#ERROR:', error)

		throw new Error('There was an internal error.')
	}
}

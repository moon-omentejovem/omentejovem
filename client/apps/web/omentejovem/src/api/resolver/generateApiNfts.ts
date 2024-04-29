import { GetObjktNftQueryResult, getObjktNft } from '../requests/objkt'
import { GetAllNftInformationResponse, ICmsNft, getAllNftInformation } from './requestNfts'

export async function generateApiNfts(data: ICmsNft[]) {
	const openSeaNftPromises: Promise<GetAllNftInformationResponse>[] = []
	const objktNftPromises: Promise<GetObjktNftQueryResult>[] = []

	const cmsNft = new Map<string, ICmsNft>()

	for (const nftImage of data) {
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

	return {
		cmsNft,
		allOpenSeaNfts,
		allObjktNfts,
	}
}

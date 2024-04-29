import { Collection, CollectionsData } from '@/api/@types'
import { fetchCollections } from '@/api/requests'
import { requestNftsByCollection } from '@/api/resolver/requestNftsByCollection'
import CollectionsContent from './content'

async function getNftsCollection(slug: string) {
	const { images } = await requestNftsByCollection(slug)
	return {
		images,
		slug,
	}
}

async function requestFetchCollections(): Promise<CollectionsData> {
	try {
		const response = await fetchCollections()

		const allCollections = response.data[0].acf
		const promises = []

		const collectionMap = new Map<string, Collection>()

		for (const collection of Object.values(allCollections)) {
			collectionMap.set(collection.slug, collection)
			promises.push(getNftsCollection(collection.slug))
		}

		const allCollectionsData = await Promise.all(promises)

		const result = Object.fromEntries(
			allCollectionsData.map((collection) => {
				const cmsCollection = collectionMap.get(collection.slug)!

				return [
					collection.slug,
					{ ...cmsCollection, background_url: collection.images.map((nft) => nft.url) },
				]
			}),
		)

		return result
	} catch (error) {
		console.log('#ERROR:', error)

		throw new Error('There was an internal error.')
	}
}

export default async function Collections() {
	const data = await requestFetchCollections()

	return <CollectionsContent data={data} />
}

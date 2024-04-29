import { requestNftsByCollection } from '@/api/resolver/requestNftsByCollection'
import { InnerCollectionContent } from './content'
import { fetchCollections } from '@/api/requests'

interface CollectionsInProperties {
	params: {
		slug: string
	}
}

export async function generateStaticParams() {
	const response = await fetchCollections()
	const allCollections = response.data[0].acf

	return Object.values(allCollections).map((collection) => ({ slug: collection.slug }))
}

export default async function CollectionsIn({ params }: CollectionsInProperties) {
	const { email, images } = await requestNftsByCollection(params.slug)

	return <InnerCollectionContent email={email} images={images} />
}

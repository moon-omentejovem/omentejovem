import { requestNftsByCollection } from '@/api/resolver/requestNftsByCollection'
import { InnerCollectionContent } from './content'
import { fetchCollections } from '@/api/requests'

interface CollectionsInProperties {
	params: {
		slug: string
	}
}

export default async function CollectionsIn({ params }: CollectionsInProperties) {
	const { email, images } = await requestNftsByCollection(params.slug)

	return <InnerCollectionContent email={email} images={images} />
}

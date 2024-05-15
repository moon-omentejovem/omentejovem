import { CollectionsResponse } from '@/api/@types'
import { CollectionLink } from '@/components/CollectionLink'

export default function CollectionsContent(data: CollectionsResponse) {
	return (
		<main className="grid place-content-center justify-items-center py-40 min-h-screenMinusHeader overflow-hidden scroll-smooth">
			{data.collections.map((collection) => (
				<CollectionLink
					key={collection.name}
					projectName={collection.name}
					year={collection.year}
					redirect={`/collections/${collection.slug}`}
					images={collection.nftImageUrls}
				/>
			))}
		</main>
	)
}

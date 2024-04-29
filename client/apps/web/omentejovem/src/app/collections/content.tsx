import { CollectionsData } from '@/api/@types'
import { CollectionLink } from '@/components/CollectionLink'

export default function CollectionsContent({ data }: { data: CollectionsData }) {
	return (
		<main className="grid place-content-center justify-items-center py-40 min-h-screenMinusHeader overflow-hidden scroll-smooth">
			{Object.values(data).map((collection) => (
				<CollectionLink
					key={collection.slug}
					projectName={collection.title}
					year={String(collection.year)}
					redirect={`/collections/${collection.slug}`}
					images={collection.background_url}
				/>
			))}
		</main>
	)
}

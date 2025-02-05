import { requestNftsByCollection } from '@/api/resolver/requestNftsByCollection'
import InnerCollectionContent from './content'
import { CollectionsContentProvider } from './provider'

interface CollectionsInProperties {
  params: {
    slug: string
  }
}

export default async function CollectionsIn({
  params
}: CollectionsInProperties) {
  const { email, images } = await requestNftsByCollection(params.slug)

  return (
    <CollectionsContentProvider
      email={'email'}
      filters={[]}
      images={images}
      totalPages={1}
      slug={params.slug}
    />
  )
}

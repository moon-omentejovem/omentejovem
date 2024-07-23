import { fetchCollections } from '@/api/requests'
import CollectionsContent from './content'

export default async function Collections() {
  const data = await fetchCollections()

  return <CollectionsContent {...data} />
}

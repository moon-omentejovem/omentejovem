import { SeriesService } from '@/services'
import CollectionsContent from './content'

export default async function SeriesPage() {
  // Use new service architecture
  const collectionsData = await SeriesService.getCollectionsData()

  return <CollectionsContent {...collectionsData} />
}

import { ArtifactService } from '@/services'
import { ArtifactsContent } from './content'

export default async function ArtifactsPage() {
  // Check if we have any artifacts in the database
  const hasArtifacts = await ArtifactService.hasArtifacts()

  if (hasArtifacts) {
    // If we have artifacts, fetch and display only published ones
    const { artifacts, error } =
      await ArtifactService.getPublishedForArtifactsPage()

    if (!error && artifacts && artifacts.length > 0) {
      return <ArtifactsContent artifacts={artifacts} />
    }
  }

  // Simple empty state when there are no artifacts or an error occurred
  return (
    <main className="flex items-center justify-center h-screenMinusHeader px-6 xl:px-20 font-heading">
      <div className="text-center text-secondary-100 opacity-70">
        <p>No artifacts available.</p>
      </div>
    </main>
  )
}

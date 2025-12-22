import { ArtifactService } from '@/services'
import { ArtifactsContent } from './content'

export default async function ArtifactsPage() {
  // Check if we have any artifacts in the database
  const hasArtifacts = await ArtifactService.hasArtifacts()

  if (hasArtifacts) {
    // If we have artifacts, fetch and display only published ones
    const { artifacts, error } =
      await ArtifactService.getPublishedForArtifactsPage()

    if (error) {
      console.error('Error loading artifacts:', error)
      // Fall back to static content if there's an error
      return <ArtifactsContent />
    }

    // Pass artifacts data to the content component
    return <ArtifactsContent artifacts={artifacts} />
  }

  // Default to static artifacts content
  return <ArtifactsContent />
}

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
    const normalizedArtifacts = artifacts.map((a) => ({
      ...a,
      description: a.description === null ? undefined : a.description,
      status:
        a.status === 'published'
          ? ('published' as 'published')
          : ('draft' as 'draft'),
      created_at: a.created_at ?? '',
      updated_at: a.updated_at ?? ''
    }))
    return <ArtifactsContent artifacts={normalizedArtifacts} />
  }

  // Default to static artifacts content
  return <ArtifactsContent />
}

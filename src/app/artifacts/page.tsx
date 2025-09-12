import { ArtifactService } from '@/services'
import { ArtifactsContent } from './content'

export default async function ArtifactsPage() {
  // Check if we have any artifacts in the database
  const hasArtifacts = await ArtifactService.hasArtifacts()
  
  if (hasArtifacts) {
    // If we have artifacts, fetch and display them
    const { artifacts, error } = await ArtifactService.getForArtifactsPage()
    
    if (error) {
      console.error('Error loading artifacts:', error)
      // Fall back to static content if there's an error
      return <ArtifactsContent />
    }
    
    // TODO: Create dynamic artifacts content component
    // For now, return static content but this can be extended
    return <ArtifactsContent />
  }
  
  // Default to static artifacts content
  return <ArtifactsContent />
}

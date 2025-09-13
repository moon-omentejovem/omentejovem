/**
 * Services Module - Centralized Data Fetching for Server Components
 *
 * This module provides server-side data fetching services for all public pages.
 * All services extend BaseService for consistent Supabase client management
 * and include proper error handling and type safety.
 *
 * Usage in Server Components:
 * ```typescript
 * import { ArtworkService } from '@/services'
 *
 * export default async function MyPage() {
 *   const artworks = await ArtworkService.getFeatured({ limit: 6 })
 *   return <MyComponent artworks={artworks} />
 * }
 * ```
 */

export { AboutService } from './about.service'
export { ArtifactService } from './artifact.service'
export { ArtworkService } from './artwork.service'
export { BaseService } from './base.service'
export { SeriesService } from './series.service'

// Type exports
export type {
  ArtworkFilters,
  ArtworkWithRelations,
  ProcessedArtworkData
} from './artwork.service'

export type {
  ProcessedSeriesData,
  SeriesFilters,
  SeriesWithArtworks
} from './series.service'

export type { ProcessedArtifactData } from './artifact.service'

export type { AboutPageData, ProcessedAboutData } from './about.service'

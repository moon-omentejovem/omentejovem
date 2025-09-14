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
export { AuthService } from './auth.service'
export { BaseService } from './base.service'
export { ImageUploadService } from './image-upload.service'
export { SeriesService } from './series.service'
export { StorageService } from './storage.service'

// Type exports
export type {
  ArtworkData,
  ArtworkFilters,
  ArtworkWithRelations
} from './artwork.service'

export type {
  ProcessedSeriesData,
  SeriesFilters,
  SeriesWithArtworks
} from './series.service'

export type { ProcessedArtifactData } from './artifact.service'

export type { AboutPageData, ProcessedAboutData } from './about.service'

export type { 
  AuthUser, 
  AuthState, 
  LoginOptions, 
  OAuthOptions 
} from './auth.service'

export type { ImageUploadResult } from './image-upload.service'

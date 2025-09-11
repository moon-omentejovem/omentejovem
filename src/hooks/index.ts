/**
 * Portfolio Hooks Index
 * Exports all available hooks for easy importing
 */

// Core entity hooks
export * from './useAboutPage'
export * from './useArtifacts'
export * from './useArtworks'
export * from './useSeries'
export * from './useUserRoles'

// Utility hooks
export * from './useDebounce'
export * from './useStorage'

// Composite hooks
export * from './usePortfolio'

// Re-export commonly used hooks with aliases for convenience
export {
  useArtworks as useAllArtworks,
  useArtworkBySlug,
  useArtworksBySeries,
  useArtworksPaginated,
  useFeaturedArtworks,
  useOneOfOneArtworks
} from './useArtworks'

export {
  useSeries as useAllSeries,
  useSeriesArtworks,
  useSeriesBySlug,
  useSeriesWithArtworks
} from './useSeries'

export {
  useArtifacts as useAllArtifacts,
  useArtifactById,
  useArtifactsPaginated
} from './useArtifacts'

export { useCurrentUserRole, useIsAdmin } from './useUserRoles'

export {
  useAvailableTypes,
  useAvailableYears,
  useFilteredArtworks,
  useHomepageData,
  usePortfolioData,
  usePortfolioSearch,
  usePortfolioStats
} from './usePortfolio'

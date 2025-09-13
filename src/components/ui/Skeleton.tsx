'use client'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
}

export function Skeleton({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = false 
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{ width, height }}
    />
  )
}

export function ArtworkSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height="300px" className="aspect-square" />
      <div className="space-y-2">
        <Skeleton height="1.5rem" width="75%" />
        <Skeleton height="1rem" width="50%" />
      </div>
    </div>
  )
}

export function PortfolioGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <ArtworkSkeleton key={i} />
      ))}
    </div>
  )
}

export function SeriesCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height="400px" className="w-full" />
      <div className="space-y-2">
        <Skeleton height="2rem" width="80%" />
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="1rem" width="40%" />
      </div>
    </div>
  )
}

export function SeriesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <SeriesCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="h-16 flex items-center justify-between px-6">
      <Skeleton width="120px" height="2rem" />
      <div className="flex space-x-4">
        <Skeleton width="80px" height="1.5rem" />
        <Skeleton width="80px" height="1.5rem" />
        <Skeleton width="80px" height="1.5rem" />
      </div>
    </div>
  )
}

// Loading spinner otimizado para performance
export function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} animate-spin`}>
      <svg 
        className="w-full h-full" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

// Componente de loading para páginas inteiras
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <HeaderSkeleton />
      <div className="px-6 py-8 space-y-8">
        <Skeleton height="3rem" width="300px" />
        <PortfolioGridSkeleton />
      </div>
    </div>
  )
}

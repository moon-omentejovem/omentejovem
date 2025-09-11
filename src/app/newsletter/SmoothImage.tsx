'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

interface SmoothImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
}

export function SmoothImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  ...props
}: SmoothImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative overflow-hidden">
      {/* Skeleton/placeholder enquanto carrega */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse will-change-auto"
          style={{ width, height }}
        />
      )}

      {/* Imagem principal */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'object-cover transition-all duration-700 ease-out transform opacity-0 scale-105',
          {
            '!opacity-100 !scale-100': isLoaded && !hasError
          },
          className
        )}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />

      {/* Fallback para erro */}
      {hasError && (
        <div
          className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 text-xs"
          style={{ width, height }}
        >
          Erro ao carregar
        </div>
      )}
    </div>
  )
}

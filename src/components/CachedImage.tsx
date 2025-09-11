'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

interface CachedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  sizes?: string
  priority?: boolean
  id?: string
}

export function CachedImage({
  src,
  alt,
  width,
  height,
  className,
  sizes = '100vw',
  priority = false,
  id,
  ...props
}: CachedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400 text-sm',
          className
        )}
        style={{
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined
        }}
      >
        ⚠️
      </div>
    )
  }

  return (
    <Image
      id={id}
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        'transition-opacity duration-300 ease-out',
        isLoading ? 'opacity-0' : 'opacity-100',
        className
      )}
      sizes={sizes}
      priority={priority}
      quality={85}
      placeholder="empty"
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setIsLoading(false)
        setHasError(true)
      }}
      unoptimized={false}
      {...props}
    />
  )
}

'use client'

import { Icons } from '@/components/Icons'
import { LoadingSpinner } from '@/components/ui/Skeleton'
import { getProxiedImageUrl } from '@/lib/utils'
import type { Database } from '@/types/supabase'
import Image from 'next/image'
import type { ReactElement } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import './style.css'

const OVERLAY_GRAY = 'rgba(177, 177, 177, 0.25)'

type ArtifactRow = Database['public']['Tables']['artifacts']['Row']

interface ArtifactsContentProps {
  artifacts?: ArtifactRow[]
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '')
      return `https://www.youtube.com/embed/${id}`
    }
    if (u.searchParams.get('v')) {
      const id = u.searchParams.get('v')
      return `https://www.youtube.com/embed/${id}`
    }
    if (u.pathname.startsWith('/embed/')) {
      return url
    }
    return url
  } catch {
    return url
  }
}

function getVimeoEmbedUrl(url: string) {
  try {
    const u = new URL(url)
    const segments = u.pathname.split('/').filter(Boolean)
    const id = segments[segments.length - 1]
    if (!id) return url
    return `https://player.vimeo.com/video/${id}`
  } catch {
    return url
  }
}

export function ArtifactsContent({
  artifacts = []
}: ArtifactsContentProps): ReactElement {
  const hasArtifacts = artifacts.length > 0

  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [mouseStartX, setMouseStartX] = useState<number | null>(null)
  const [isForegroundLoading, setIsForegroundLoading] = useState(false)
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false)
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const FADE_DURATION = 700

  useEffect(() => {
    if (artifacts.length === 0) {
      setCurrentIndex(0)
      return
    }
    if (currentIndex >= artifacts.length) {
      setCurrentIndex(artifacts.length - 1)
    }
  }, [artifacts.length, currentIndex])

  useEffect(() => {
    if (!hasArtifacts) return
    if (typeof window === 'undefined') return

    const urls = artifacts
      .map((artifact) => artifact.imageurl)
      .filter((url): url is string => !!url)
      .map((url) => getProxiedImageUrl(url))

    urls.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [artifacts, hasArtifacts])

  useEffect(
    () => () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    },
    []
  )

  const currentArtifact = useMemo(
    () => (hasArtifacts ? artifacts[currentIndex] : null),
    [artifacts, currentIndex, hasArtifacts]
  )

  const pageLinkUrl = currentArtifact?.page_link_url || null

  const hasVideo = !!currentArtifact?.highlight_video_url

  useEffect(() => {
    if (!currentArtifact) {
      setIsForegroundLoading(false)
      setIsBackgroundLoading(false)
      return
    }

    if (currentArtifact.imageurl) {
      setIsForegroundLoading(true)
    } else {
      setIsForegroundLoading(false)
    }

    if (currentArtifact.highlight_video_url) {
      setIsBackgroundLoading(true)
    } else {
      setIsBackgroundLoading(false)
    }
  }, [currentArtifact])

  const leftArtifacts = useMemo(
    () =>
      artifacts
        .map((artifact, index) => ({ artifact, index }))
        .filter(({ index }) => index < currentIndex),
    [artifacts, currentIndex]
  )

  const rightArtifacts = useMemo(
    () =>
      artifacts
        .map((artifact, index) => ({ artifact, index }))
        .filter(({ index }) => index > currentIndex),
    [artifacts, currentIndex]
  )

  const foregroundMedia = useMemo(() => {
    if (!currentArtifact || !currentArtifact.imageurl) return null

    return (
      <Image
        src={getProxiedImageUrl(currentArtifact.imageurl)}
        alt={currentArtifact.title}
        width={800}
        height={800}
        className="w-full h-full object-contain"
        draggable={false}
        onLoadingComplete={() => {
          setIsForegroundLoading(false)
        }}
        onError={() => {
          setIsForegroundLoading(false)
        }}
      />
    )
  }, [currentArtifact])

  const backgroundMedia = useMemo(() => {
    if (!currentArtifact || !currentArtifact.highlight_video_url) {
      return <div className="w-full h-full bg-black" />
    }

    const videoUrl = currentArtifact.highlight_video_url
    const lower = videoUrl.toLowerCase()
    const isYouTube =
      lower.includes('youtube.com') || lower.includes('youtu.be')
    const isVimeo = lower.includes('vimeo.com')

    if (isYouTube) {
      const embedUrl = getYouTubeEmbedUrl(videoUrl)
      return (
        <iframe
          key={currentArtifact.id}
          title="YouTube video player"
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => {
            setIsBackgroundLoading(false)
          }}
        />
      )
    }

    if (isVimeo) {
      const embedUrl = getVimeoEmbedUrl(videoUrl)
      return (
        <iframe
          key={currentArtifact.id}
          title="Vimeo video player"
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => {
            setIsBackgroundLoading(false)
          }}
        />
      )
    }

    return (
      <video
        key={currentArtifact.id}
        src={videoUrl}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => {
          setIsBackgroundLoading(false)
        }}
        onError={() => {
          setIsBackgroundLoading(false)
        }}
      />
    )
  }, [currentArtifact])

  const goToIndex = (nextIndex: number) => {
    if (!hasArtifacts) return
    if (nextIndex === currentIndex) return

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }

    setCurrentIndex(nextIndex)
    setIsTransitioning(true)

    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false)
    }, FADE_DURATION)
  }

  const handlePrevious = () => {
    if (!hasArtifacts) return

    const nextIndex =
      currentIndex === 0 ? artifacts.length - 1 : currentIndex - 1

    goToIndex(nextIndex)
  }

  const handleNext = () => {
    if (!hasArtifacts) return

    const nextIndex =
      currentIndex === artifacts.length - 1 ? 0 : currentIndex + 1

    goToIndex(nextIndex)
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0]
    setTouchStartX(touch.clientX)
    setTouchStartY(touch.clientY)
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartX
    const deltaY = touch.clientY - touchStartY

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext()
      } else {
        handlePrevious()
      }
    }

    setTouchStartX(null)
    setTouchStartY(null)
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return
    setMouseStartX(event.clientX)
  }

  const handleMouseUp = (event: React.MouseEvent) => {
    if (mouseStartX === null) return
    const deltaX = event.clientX - mouseStartX

    if (Math.abs(deltaX) > 20) {
      if (deltaX < 0) {
        handleNext()
      } else {
        handlePrevious()
      }
    }

    setMouseStartX(null)
  }

  const handleMouseLeave = () => {
    setMouseStartX(null)
  }

  const transitionClass =
    'transition-opacity duration-700 ease-out will-change-opacity'
  const contentOpacityClass = isTransitioning ? 'opacity-0' : 'opacity-100'

  return (
    <main
      className="flex flex-col justify-center px-6 font-heading xl:px-20 relative h-screenMinusHeader overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="fixed inset-0 z-0 pointer-events-none bg-black">
        {backgroundMedia}
        {hasVideo && isBackgroundLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
            <LoadingSpinner size="md" className="text-primary-50 mb-3" />
            <p className="text-xs uppercase tracking-[0.2em] text-secondary-200">
              Loading
            </p>
          </div>
        )}
      </div>

      <>
        {hasArtifacts && (
            <div
              className={`absolute inset-0 z-10 hidden md:flex flex-col items-center justify-center pointer-events-none ${transitionClass} ${contentOpacityClass}`}
            >
              <button
                type="button"
                className="pointer-events-auto w-[min(70vw,640px)] max-w-[520px] aspect-square flex items-center justify-center relative"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                {foregroundMedia}
                {isForegroundLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    <LoadingSpinner
                      size="md"
                      className="text-primary-50 mb-3"
                    />
                    <p className="text-xs uppercase tracking-[0.2em] text-secondary-200">
                      Loading
                    </p>
                  </div>
                )}
              </button>
              <div className="mt-6 flex flex-col items-center gap-3 pointer-events-auto">
                <div className="inline-flex items-center gap-3">
                  <div className="flex items-center justify-end gap-1 min-w-[72px]">
                    {leftArtifacts.map(({ artifact, index }) => (
                      <button
                        key={`${artifact.id}-left`}
                        type="button"
                        onClick={() => goToIndex(index)}
                        className="transition-colors w-[10px] h-[10px]"
                        style={{ backgroundColor: OVERLAY_GRAY }}
                        aria-label={`Go to artifact ${artifact.title}`}
                      />
                    ))}
                  </div>
                  {currentArtifact?.title ? (
                    pageLinkUrl ? (
                      <a
                        href={pageLinkUrl}
                        className="px-4 py-1.5 tracking-[0.18em] uppercase text-orange-500 hover:text-black font-body cursor-pointer transition-colors"
                        style={{ backgroundColor: OVERLAY_GRAY }}
                      >
                        <span className="text-[16px] leading-none">
                          {currentArtifact.title}
                        </span>
                      </a>
                    ) : (
                      <div
                        className="px-4 py-1.5 tracking-[0.18em] uppercase text-orange-500 font-body"
                        style={{ backgroundColor: OVERLAY_GRAY }}
                      >
                        <span className="text-[16px] leading-none">
                          {currentArtifact.title}
                        </span>
                      </div>
                    )
                  ) : null}
                  <div className="flex items-center justify-start gap-1 min-w-[72px]">
                    {rightArtifacts.map(({ artifact, index }) => (
                      <button
                        key={`${artifact.id}-right`}
                        type="button"
                        onClick={() => goToIndex(index)}
                        className="transition-colors w-[10px] h-[10px]"
                        style={{ backgroundColor: OVERLAY_GRAY }}
                        aria-label={`Go to artifact ${artifact.title}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
        )}

        {hasArtifacts && (
            <div
              className={`relative z-20 w-full flex justify-center md:hidden mt-10 ${transitionClass} ${contentOpacityClass}`}
            >
              <button
                type="button"
                className="pointer-events-auto w-[min(70vw,640px)] max-w-[520px] aspect-square flex items-center justify-center relative"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                {foregroundMedia}
                {isForegroundLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    <LoadingSpinner
                      size="md"
                      className="text-primary-50 mb-3"
                    />
                    <p className="text-xs uppercase tracking-[0.2em] text-secondary-200">
                      Loading
                    </p>
                  </div>
                )}
              </button>
            </div>
        )}

        <div
            className={`relative z-20 w-full max-w-[500px] mt-8 md:mt-[40vh] flex flex-col ${transitionClass} ${contentOpacityClass}`}
          >
            <span className="text-orange-500 text-[16px] font-bold font-body uppercase">
              {currentArtifact?.collection_label}
            </span>
            <h3 className="text-secondary-100 text-[24px] mt-3 font-body flex items-center gap-2">
              {currentArtifact?.title ? (
                pageLinkUrl ? (
                  <a
                    href={pageLinkUrl}
                    className="group flex items-center gap-2 hover:text-black transition-colors"
                  >
                    <span>{currentArtifact.title}</span>
                    <span className="text-secondary-100/70 text-xl group-hover:text-black">
                      &#8594;
                    </span>
                  </a>
                ) : (
                  <>
                    <span>{currentArtifact.title}</span>
                    <span className="text-secondary-100/70 text-xl">
                      &#8594;
                    </span>
                  </>
                )
              ) : null}
            </h3>

            {(() => {
              const descriptionText =
                hasArtifacts && currentArtifact?.description
                  ? currentArtifact.description
                  : ''

              return (
                <>
                  {descriptionText ? (
                    <p className="mt-8 text-secondary-100 opacity-70 font-body hidden md:block">
                      {descriptionText}
                    </p>
                  ) : null}

                  {descriptionText ? (
                    <div className="mt-8 text-secondary-100 opacity-70 font-body text-[14px] leading-[1.5] md:hidden">
                      <p
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {descriptionText}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsDescriptionModalOpen(true)}
                        className="mt-2 text-xs uppercase tracking-[0.2em] text-secondary-100 underline"
                      >
                        Read more..
                      </button>
                    </div>
                  ) : null}
                </>
              )
            })()}

            {hasArtifacts && currentArtifact?.link_url && (
              <a
                href={currentArtifact.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex mt-8 px-4 py-2 rounded-lg text-white bg-primary-100/80 hover:bg-primary-100 transition-colors items-center justify-center w-64 cursor-pointer"
              >
                Watch More
              </a>
            )}

            {hasArtifacts && currentArtifact && (
              <div className="mt-10 flex flex-col items-center gap-3 md:hidden">
                <div className="inline-flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {leftArtifacts.map(({ artifact, index }) => (
                      <button
                        key={`${artifact.id}-bottom-left`}
                        type="button"
                        onClick={() => goToIndex(index)}
                        className="transition-colors w-[10px] h-[10px]"
                        style={{ backgroundColor: OVERLAY_GRAY }}
                        aria-label={`Go to artifact ${artifact.title}`}
                      />
                    ))}
                  </div>
                  {pageLinkUrl ? (
                    <a
                      href={pageLinkUrl}
                      className="px-4 py-1.5 tracking-[0.18em] uppercase text-orange-500 hover:text-black font-body cursor-pointer transition-colors"
                      style={{ backgroundColor: OVERLAY_GRAY }}
                    >
                      <span className="text-[16px] leading-none">
                        {currentArtifact.title}
                      </span>
                    </a>
                  ) : (
                    <div
                      className="px-4 py-1.5 tracking-[0.18em] uppercase text-orange-500 font-body"
                      style={{ backgroundColor: OVERLAY_GRAY }}
                    >
                      <span className="text-[16px] leading-none">
                        {currentArtifact.title}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {rightArtifacts.map(({ artifact, index }) => (
                      <button
                        key={`${artifact.id}-bottom-right`}
                        type="button"
                        onClick={() => goToIndex(index)}
                        className="transition-colors w-[10px] h-[10px]"
                        style={{ backgroundColor: OVERLAY_GRAY }}
                        aria-label={`Go to artifact ${artifact.title}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>

        {hasArtifacts && artifacts.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="hidden md:flex absolute left-8 top-[45%] -translate-y-1/2 z-30 h-12 w-12 items-center justify-center text-secondary-100/80 hover:text-secondary-100 transition-colors"
                aria-label="Previous artifact"
              >
                <span className="text-3xl leading-none">&#8592;</span>
              </button>
            )}

            {currentIndex < artifacts.length - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="hidden md:flex absolute right-8 top-[45%] -translate-y-1/2 z-30 h-12 w-12 items-center justify-center text-secondary-100/80 hover:text-secondary-100 transition-colors"
                aria-label="Next artifact"
              >
                <span className="text-3xl leading-none">&#8594;</span>
              </button>
            )}
          </>
        )}

        {(() => {
          const descriptionText =
            hasArtifacts && currentArtifact?.description
              ? currentArtifact.description
              : 'Collectors can now claim the S&C Package. Each set includes a unique wooden collectible, accompanied by a 48x48cm individually signed fine art print. Claim is made once by the collector that owns it by the release of the artifact.'

          return (
            isDescriptionModalOpen && (
              <div className="fixed inset-0 z-40 bg-black/80 px-6 py-10 overflow-y-auto md:hidden">
                <button
                  type="button"
                  onClick={() => setIsDescriptionModalOpen(false)}
                  className="mb-4 text-secondary-100 flex justify-end"
                  aria-label="Close description"
                >
                  <Icons.X />
                </button>
                {hasArtifacts && currentArtifact && (
                  <>
                    <h3 className="text-secondary-100 text-[20px] font-heading">
                      {currentArtifact.title}
                    </h3>
                    <p className="mt-4 text-secondary-100 font-body text-[14px] leading-[1.5]">
                      {descriptionText}
                    </p>
                  </>
                )}
              </div>
            )
          )
        })()}
      </>
    </main>
  )
}

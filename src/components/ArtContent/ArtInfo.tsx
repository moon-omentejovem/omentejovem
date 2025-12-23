'use client'

import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

import {
  artInfoButtonAnimation,
  resetArtInfo,
  resetButtonInfo
} from '@/animations/client'
import { CustomIcons } from '@/assets/icons'
import { ArtDetails } from '@/components/ArtDetails'
import { ArtLinks } from '@/components/ArtLinks'
import { Icons } from '@/components/Icons'
import { cn } from '@/lib/utils'
import type { Artwork } from '@/types/artwork'
import {
  extractDescriptionText,
  getExplorerLink,
  getMintedOn,
  isArtworkMinted,
  resolveExternalLinks
} from './utils'
import { ArtworkThumbnailCarousel } from './HorizontalInCarousel/ArtworkThumbnailCarousel'
import './styles.css'

interface ArtInfoProps {
  contactEmail: string
  artwork: Artwork
  artworks: Artwork[]
  onSelectArtwork: (index: number, replace?: boolean) => void
}

export function ArtInfo({
  contactEmail,
  artwork,
  artworks,
  onSelectArtwork
}: ArtInfoProps): ReactElement {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const hasVideo = Boolean(artwork.video_url)
  const isMinted = useMemo(() => isArtworkMinted(artwork), [artwork])
  const mintedOn = useMemo(() => getMintedOn(artwork), [artwork])
  const externalLinks = useMemo(() => resolveExternalLinks(artwork), [artwork])
  const explorerLink = useMemo(() => getExplorerLink(artwork), [artwork])
  const descriptionText = useMemo(
    () => extractDescriptionText(artwork.description),
    [artwork.description]
  )
  const currentIndex = useMemo(
    () => artworks.findIndex((item) => item.id === artwork.id),
    [artworks, artwork.id]
  )

  const truncateDescription = useCallback((input: string) => {
    if (input.length <= 600) {
      return input
    }

    return `${input.substring(0, 250)}...`
  }, [])

  const handleSelectFromCarousel = useCallback(
    async (index: number) => {
      onSelectArtwork(index)
      setShowDetails(false)
      setIsDescriptionExpanded(false)
      await resetButtonInfo()
    },
    [onSelectArtwork]
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (window.screen.width >= 1280) {
      setIsVideoOpen(false)
      setShowDetails(false)
      setIsDescriptionExpanded(false)
      void resetArtInfo()
      void resetButtonInfo()
    }
  }, [artwork.id])

  const detailedImage = artwork.imageurl || artwork.imageoptimizedurl
  const displayImage = artwork.imageurl || artwork.imageoptimizedurl || '/placeholder.png'

  return (
    <>
      <section
        className={cn(
          'flex flex-wrap items-end gap-8 xl:max-w-[85%] gap-x-auto w-full'
        )}
      >
        <div className="md:flex-1 min-w-[200px] xl:min-w-[350px] flex flex-col">
          <div className="xl:art-detail-inner-container flex items-end justify-start">
            <ArtDetails
              detailedImage={detailedImage || '/placeholder.png'}
              image={displayImage}
              name={artwork.title || ''}
            />
          </div>
        </div>

        <div className="block w-[100vw] self-center xl:hidden md:order-3">
          <ArtworkThumbnailCarousel
            artworks={artworks}
            selectedIndex={currentIndex}
            onSelect={handleSelectFromCarousel}
          />
        </div>

        {isMinted ? (
          <MintedArtworkDetails
            artworkTitle={artwork.title}
            contactEmail={contactEmail}
            description={descriptionText}
            explorerLink={explorerLink}
            externalLinks={externalLinks}
            isDescriptionExpanded={isDescriptionExpanded}
            mintedOn={mintedOn}
            hasVideo={hasVideo}
            onToggleDescription={() =>
              setIsDescriptionExpanded((previous) => !previous)
            }
            onToggleDetails={async () => {
              if (isAnimating) return

              setIsAnimating(true)
              setShowDetails((previous) => !previous)
              await artInfoButtonAnimation()
              setIsAnimating(false)
            }}
            showDetails={showDetails}
            truncateDescription={truncateDescription}
            onOpenVideo={() => setIsVideoOpen(true)}
          />
        ) : (
          <PlainArtworkDetails
            description={descriptionText}
            title={artwork.title}
          />
        )}

      </section>

      {isVideoOpen ? (
        <button
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 border-none p-0"
          aria-label="Close video modal"
          onClick={() => setIsVideoOpen(false)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsVideoOpen(false)
            }
          }}
        >
          <div
            className="relative w-full max-w-4xl mx-4 max-h-[90vh]"
            role="presentation"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close video"
              className="absolute top-4 right-4 text-white"
              onClick={() => setIsVideoOpen(false)}
            >
              <Icons.X />
            </button>
            <video
              className="w-auto h-auto max-w-full max-h-[90vh] rounded-lg"
              controls
              autoPlay
              src={artwork.video_url || ''}
            >
              <track kind="captions" srcLang="en" label="English" />
              Your browser does not support the video tag.
            </video>
          </div>
        </button>
      ) : null}
    </>
  )
}

interface MintedArtworkDetailsProps {
  artworkTitle?: string | null
  contactEmail: string
  description: string
  explorerLink: string
  externalLinks: Array<{ name: string; url: string }>
  isDescriptionExpanded: boolean
  mintedOn: string
  onToggleDescription: () => void
  onToggleDetails: () => Promise<void>
  showDetails: boolean
  truncateDescription: (value: string) => string
   hasVideo: boolean
   onOpenVideo?: () => void
}

function MintedArtworkDetails({
  artworkTitle,
  contactEmail,
  description,
  explorerLink,
  externalLinks,
  isDescriptionExpanded,
  mintedOn,
  onToggleDescription,
  onToggleDetails,
  showDetails,
  truncateDescription,
  hasVideo,
  onOpenVideo
}: MintedArtworkDetailsProps) {
  const hasLongDescription = description.length > 600

  return (
    <div
      id="art-container"
      className={cn(
        'gap-2 transition-all max-h-[calc(100vh-8rem)] xl:h-full w-full sm:w-auto md:w-[400px] flex-shrink-0 flex flex-col justify-end xl:justify-end ml-auto md:order-2'
      )}
    >
      <div className={cn('overflow-hidden', showDetails ? 'overflow-y-auto' : '')}>
        <div
          id="art-description"
          className={cn(
            'h-fit flex flex-col-reverse gap-4 w-full text-sm text-secondary-100',
            'xl:flex-col xl:max-w-sm xl:mt-auto'
          )}
        >
          <p id="art-description-text" className="break-words">
            {isDescriptionExpanded ? description : truncateDescription(description)}
            {hasLongDescription ? (
              <button
                onClick={onToggleDescription}
                className="text-primary-50 font-extrabold ml-1"
              >
                {isDescriptionExpanded ? '-' : '+'}
              </button>
            ) : null}
          </p>
          <div>
            <p className="text-primary-50 underline mt-4">{artworkTitle}</p>
            {mintedOn ? <p>minted on {mintedOn}</p> : null}
          </div>
        </div>

        <div
          className={cn(
            'fade-up',
            showDetails
              ? 'opacity-100 max-h-screen visible'
              : 'opacity-0 max-h-0 overflow-y-hidden invisible'
          )}
          style={{ transitionProperty: 'opacity, max-height' }}
        >
          <div id="art-info-wrapper" className={cn('flex flex-col')}>
            <div id="art-ownership-collections" className="opacity-0" style={{ display: 'none' }} />
            <div id="art-links" className="mt-12">
              <ArtLinks
                email={contactEmail}
                externalLinks={externalLinks}
                makeOffer={{
                  active: false,
                  buttonText: 'Make Offer'
                }}
                views={explorerLink ? { explorer: explorerLink } : {}}
                hasVideo={hasVideo}
                onOpenVideo={onOpenVideo}
              />
            </div>
          </div>
        </div>
      </div>

      {externalLinks.length > 0 ? (
        <button
          aria-label="Open art infos"
          className="group relative flex items-center justify-center w-10 h-10"
          onClick={() => {
            void onToggleDetails()
          }}
        >
          <CustomIcons.Plus
            className={cn(
              'art-info-button w-6 h-6 transition-all text-secondary-100 group-hover:text-primary-50'
            )}
          />
        </button>
      ) : null}
    </div>
  )
}

interface PlainArtworkDetailsProps {
  description: string
  title?: string | null
}

function PlainArtworkDetails({ description, title }: PlainArtworkDetailsProps) {
  return (
    <div className="flex flex-col w-full max-w-sm justify-end text-sm text-secondary-100 h-full">
      <div className="flex flex-col-reverse mt-4 mb-10 gap-4 xl:flex-col">
        <p className="break-words">{description}</p>
        <p className="text-primary-50 underline">{title}</p>
      </div>
    </div>
  )
}

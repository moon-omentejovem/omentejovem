'use client'

import { ReactElement, useEffect, useState } from 'react'

import {
  artInfoButtonAnimation,
  resetArtInfo,
  resetButtonInfo
} from '@/animations/client'
import { CustomIcons } from '@/assets/icons'
import { ArtDetails } from '@/components/ArtDetails'
import { ArtLinks } from '@/components/ArtLinks'
import { cn } from '@/lib/utils'
import { Artwork } from '@/types/artwork'
import { addHours, format } from 'date-fns'
import { HorizontalInCarouselArtwork } from './HorizontalInCarousel/HorizontalInCarouselArtwork'
import './styles.css'

interface ArtInfosProperties {
  email: string
  selectedArtwork: Artwork
  slides: Artwork[]
  source: 'portfolio' | '1-1' | 'editions' | string
  onChangeSlideIndex: (index: number) => void
}

export function ArtInfosNew({
  email,
  selectedArtwork,
  slides,
  source,
  onChangeSlideIndex
}: ArtInfosProperties): ReactElement {
  const [isOpenVideo, setIsOpenVideo] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  console.log('selectedArtwork', selectedArtwork)

  const hasVideo = !!selectedArtwork.video_url

  const onChangeToOtherSlide = async (index: number) => {
    onChangeSlideIndex(index)
    setShowDetails(false)
    await resetButtonInfo()
  }

  function handleMoreSlides() {
    // Busca mais slides
  }

  function wasMinted(artwork: Artwork) {
    return (
      artwork.token_id &&
      artwork.token_id !== '' &&
      artwork.token_id !== '0x0000000000000000000000000000000000000000'
    )
  }

  const truncate = (input: string) =>
    input?.length > 600 ? `${input.substring(0, 250)}...` : input

  useEffect(() => {
    if (selectedArtwork && window.screen.width >= 1280) {
      setIsOpenVideo(false)
      setIsAnimating(false)
      resetArtInfo()
      setShowDetails(false)
      resetButtonInfo()
    }
  }, [onChangeSlideIndex, selectedArtwork])

  if (!selectedArtwork) {
    throw new Error('Artwork does not exist')
  }

  // Setup external links - use mint_link from backend as single source of truth
  const externalLink = selectedArtwork.mint_link
    ? {
        url: selectedArtwork.mint_link,
        name: 'View NFT'
      }
    : null

  // Format mint date
  let mintedOn = ''
  if (selectedArtwork.mint_date) {
    try {
      mintedOn = format(
        addHours(new Date(selectedArtwork.mint_date), 3),
        'd LLLL, yyyy'
      )
    } catch (error) {
      console.error('Error formatting date:', error)
    }
  }

  // Get description as string - handle both string and Tiptap JSON formats
  const getDescriptionText = (description: any): string => {
    if (!description) return ''

    if (typeof description === 'string') {
      return description
    }

    // Handle Tiptap JSON format
    if (typeof description === 'object' && description.content) {
      const extractTextFromTiptap = (content: any[]): string => {
        return content
          .map((node: any) => {
            if (node.type === 'paragraph' || node.type === 'heading') {
              return (
                node.content
                  ?.map((textNode: any) => textNode.text || '')
                  .join('') || ''
              )
            }
            if (node.type === 'text') {
              return node.text || ''
            }
            if (node.content) {
              return extractTextFromTiptap(node.content)
            }
            return ''
          })
          .join('\n')
          .trim()
      }

      return extractTextFromTiptap(description.content)
    }

    // Fallback to JSON string
    return JSON.stringify(description)
  }

  const descriptionText = getDescriptionText(selectedArtwork.description)
  console.log({ selectedArtwork })

  return (
    <>
      <section
        className={cn(
          'flex flex-wrap gap-8 xl:h-[calc(100vh-4rem)] xl:overflow-scroll xl:max-w-[85%] gap-x-auto w-full scrollbar-hide'
        )}
      >
        <div className="md:flex-1 min-w-[200px] xl:min-w-[350px] flex flex-col max-h-full">
          <div className="xl:art-detail-inner-container overflow-hidden flex flex-1 justify-start xl:justify-end">
            <ArtDetails
              detailedImage={
                selectedArtwork.raw_image_url || selectedArtwork.image_url || ''
              }
              image={selectedArtwork.image_url || ''}
              name={selectedArtwork.title || ''}
            />
          </div>
        </div>

        {hasVideo && (
          <button
            aria-label="Open video process modal"
            onClick={() => setIsOpenVideo(true)}
            className="grid place-content-center h-6 xl:hidden"
          >
            <CustomIcons.Camera />
          </button>
        )}

        <div className="block w-[100vw] self-center xl:hidden md:order-3">
          <HorizontalInCarouselArtwork
            slideIndex={slides.findIndex(
              (slide) => slide.id === selectedArtwork.id
            )}
            onChangeSlideIndex={onChangeToOtherSlide}
            slides={slides}
            getMoreSlides={() => handleMoreSlides()}
          />
        </div>

        {wasMinted(selectedArtwork) ? (
          <div
            id="art-container"
            className={cn(
              'gap-2 transition-all max-h-[calc(100vh-8rem)] xl:h-full w-full sm:w-auto md:w-[400px] flex-shrink-0 flex flex-col justify-end xl:justify-end ml-auto md:order-2'
            )}
          >
            <div
              className={cn(
                'overflow-hidden',
                showDetails ? 'overflow-y-auto' : ''
              )}
            >
              <div
                id="art-description"
                className={cn(
                  'h-fit flex flex-col-reverse gap-4 w-full text-sm text-secondary-100',
                  'xl:flex-col xl:max-w-sm xl:mt-auto'
                )}
              >
                <p id="art-description-text" className="break-words">
                  {isDescriptionExpanded
                    ? descriptionText
                    : truncate(descriptionText)}
                  {(descriptionText?.length || 0) > 600 && (
                    <span>
                      <button
                        onClick={() =>
                          setIsDescriptionExpanded(!isDescriptionExpanded)
                        }
                        className="text-primary-50 font-extrabold ml-1"
                      >
                        {isDescriptionExpanded ? ' -' : ' +'}
                      </button>
                    </span>
                  )}
                </p>
                <div>
                  <p className="text-primary-50 underline mt-4">
                    {selectedArtwork.title}
                  </p>
                  {mintedOn && <p>minted on {mintedOn}</p>}
                </div>
              </div>

              {/* Conditional rendering with fade animation */}
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
                  <div id="art-links" className="mt-12">
                    <ArtLinks
                      email={email}
                      externalLinks={externalLink ? [externalLink] : []}
                      makeOffer={{
                        active: false,
                        buttonText: 'Make Offer'
                      }}
                      views={
                        wasMinted(selectedArtwork)
                          ? {
                              explorer: `https://etherscan.io/token/${selectedArtwork.token_id}`
                            }
                          : {}
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {externalLink && (
              <button
                aria-label="Open art infos"
                className="group relative flex items-center justify-center w-10 h-10"
                onClick={async () => {
                  setShowDetails(!showDetails)
                  await artInfoButtonAnimation()
                }}
                disabled={isAnimating}
              >
                <CustomIcons.Plus
                  className={cn(
                    'art-info-button w-6 h-6 transition-all text-secondary-100 group-hover:text-primary-50'
                  )}
                />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-sm justify-end text-sm text-secondary-100 h-full">
            <div className="flex flex-col-reverse mt-4 mb-10 gap-4 xl:flex-col">
              <p className="break-words">{descriptionText}</p>
              <p className="text-primary-50 underline">
                {selectedArtwork.title}
              </p>
            </div>
          </div>
        )}

        <div className="hidden place-content-center xl:grid">
          {hasVideo ? (
            <button
              aria-label="Open video process modal"
              onClick={() => setIsOpenVideo(true)}
              className="grid place-content-center h-6"
            >
              <CustomIcons.Camera />
            </button>
          ) : (
            <span className="h-6" />
          )}
        </div>
      </section>

      {isOpenVideo && (
        <button
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 border-none p-0"
          aria-label="Close video modal"
          onClick={() => setIsOpenVideo(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpenVideo(false)
            }
          }}
        >
          <div
            className="relative w-full max-w-4xl mx-4 max-h-[90vh]"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <video
              className="w-auto h-auto max-w-full max-h-[90vh] rounded-lg"
              controls
              autoPlay
              src={
                selectedArtwork.video_url ||
                (() => {
                  const baseUrl =
                    selectedArtwork.raw_image_url ||
                    selectedArtwork.image_url ||
                    ''
                  return baseUrl
                    .replace('/new_series/', '/new_series/videos/')
                    .replace('.jpg', '.mp4')
                })()
              }
            >
              <track kind="captions" srcLang="en" label="English" />
              Your browser does not support the video tag.
            </video>
          </div>
        </button>
      )}
    </>
  )
}

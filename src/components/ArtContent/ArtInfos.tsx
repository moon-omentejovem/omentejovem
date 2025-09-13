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
import { VideoProcessModal } from '@/components/Modals/VideoProcessModal'
import { cn } from '@/lib/utils'
import { Artwork } from '@/types/artwork'
import { HorizontalInCarousel } from '../Carousels/HorizontalInCarousel/HorizontalInCarousel'
import { ArtDescription } from './ArtDescription'
import './styles.css'
import { getMintedOn, resolveExternalLinks } from './utils'

interface ArtInfosProperties {
  email: string
  selectedArt: Artwork
  slides: Artwork[]
  source: 'portfolio' | '1-1' | 'editions' | string
  onChangeSlideIndex: (index: number) => void
}

export function ArtInfos({
  email,
  selectedArt,
  slides,
  source,
  onChangeSlideIndex
}: ArtInfosProperties): ReactElement {
  const [isOpenVideo, setIsOpenVideo] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Simplified hasVideo logic - can be enhanced later
  const hasVideo = false

  const onChangeToOtherSlide = (index: number) => {
    onChangeSlideIndex(index)
    setShowDetails(false)
    resetButtonInfo()
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

  useEffect(() => {
    if (selectedArt && window.screen.width >= 1280) {
      setIsOpenVideo(false)
      setIsAnimating(false)
      resetArtInfo()
      setShowDetails(false)
      resetButtonInfo()
    }
  }, [onChangeSlideIndex, selectedArt])

  if (!selectedArt) {
    throw new Error('Image does not exists')
  }

  const {
    externalLinkName,
    externalLinkUrl,
    secondaryExternalLinkName,
    secondaryExternalLinkUrl
  } = resolveExternalLinks(selectedArt)

  const mintedOn = getMintedOn(selectedArt)

  const optimizedImageUrl = selectedArt.image_url
  const rawImageUrl = selectedArt.image_url

  const videoUrl =
    rawImageUrl
      ?.replace('/new_series/', '/new_series/videos/')
      .replace('.jpg', '.mp4') || ''

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
              detailedImage={rawImageUrl}
              image={source === 'portfolio' ? optimizedImageUrl : rawImageUrl}
              name={selectedArt.title || ''}
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
          <HorizontalInCarousel
            onChangeSlideIndex={onChangeToOtherSlide}
            slides={slides}
            getMoreSlides={() => handleMoreSlides()}
          />
        </div>
        {wasMinted(selectedArt) ? (
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
              <ArtDescription
                description={
                  typeof selectedArt.description === 'string'
                    ? selectedArt.description
                    : ''
                }
                name={selectedArt.title || ''}
                mintedOn={mintedOn}
              />

              {/* Conditional rendering with fade animation */}
              <div
                className={cn(
                  'fade-up',
                  showDetails
                    ? 'opacity-100 max-h-screen  visible'
                    : 'opacity-0 max-h-0 overflow-y-hidden invisible'
                )}
                style={{ transitionProperty: 'opacity, max-height' }}
              >
                <div id="art-info-wrapper" className={cn('flex flex-col')}>
                  <div id="art-links" className="mt-12">
                    <ArtLinks
                      email={email}
                      externalLinks={[
                        {
                          url: externalLinkUrl,
                          name: externalLinkName
                        },
                        ...(secondaryExternalLinkName &&
                        secondaryExternalLinkUrl
                          ? [
                              {
                                url: secondaryExternalLinkUrl,
                                name: secondaryExternalLinkName
                              }
                            ]
                          : [])
                      ]}
                      // availableForPurchase={selectedArt.available_purchase}
                      makeOffer={{
                        active: false,
                        buttonText: 'Make Offer'
                      }}
                      views={
                        selectedArt.token_id
                          ? {
                              explorer: `https://etherscan.io/token/${selectedArt.token_id}`
                            }
                          : {}
                      }
                    />
                  </div>

                  {/* <ArtOwnership
                    nftChain={selectedArt.chain?.toLowerCase() as Chain}
                    artAddress={getNftLinks(
                      selectedArt.contract.address,
                      selectedArt.chain?.toLowerCase() as Chain,
                      selectedArt.token_id,
                      'token'
                    )}
                    tokenId={selectedArt.token_id}
                    contractAddress={selectedArt.contract.address}
                    owners={selectedArt.owners}
                    firstEvent={selectedArt.mint}
                    lastEvent={selectedArt.mint}
                    source={source}
                  /> */}
                </div>
              </div>
            </div>

            {externalLinkUrl && (
              <button
                aria-label="Open art infos"
                className="group relative flex items-center justify-center w-10 h-10" // Fixed width and height
                onClick={() => {
                  setShowDetails(!showDetails)
                  artInfoButtonAnimation()
                }}
                disabled={isAnimating}
              >
                <CustomIcons.Plus
                  className={cn(
                    'art-info-button w-6 h-6 transition-all text-secondary-100 group-hover:text-primary-50' // Set size for the SVG
                  )}
                />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-sm justify-end text-sm text-secondary-100 h-full">
            <div className="flex flex-col-reverse mt-4 mb-10 gap-4 xl:flex-col">
              <p className="break-words">
                {typeof selectedArt.description === 'string'
                  ? selectedArt.description
                  : ''}
              </p>

              <p className="text-primary-50 underline">{selectedArt.title}</p>
            </div>
            {/* {!(selectedArt as NFT).availablePurchase && (
              <p className="mt-2 grid content-center justify-start border-y-[1px] border-secondary-100 text-sm h-16 px-8 font-bold text-secondary-100">
                NOT AVAILABLE FOR PURCHASE
              </p>
            )} */}
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
      <VideoProcessModal
        open={isOpenVideo}
        setOpen={setIsOpenVideo}
        videoUrl={videoUrl}
      />
    </>
  )
}

'use client'

import { ReactElement, useEffect, useState } from 'react'

import { ArtDetails } from '@/components/ArtDetails'
import { ArtLinks } from '@/components/ArtLinks'
import { ArtOwnership } from '@/components/ArtOwnership/ArtOwnership'
import { addHours, format, fromUnixTime } from 'date-fns'
import { NftArt, isNftArt } from './types'
import { cn } from '@/lib/utils'
import { CustomIcons } from '@/assets/icons'
import {
  artInfoButtonAnimation,
  resetArtInfo,
  resetButtonInfo
} from '@/animations'
import { HorizontalInCarousel } from '../Carousels/HorizontalInCarousel/HorizontalInCarousel'
import './styles.css'
import { getNftLinks } from './utils'
interface ArtInfosProperties {
  email: string
  selectedArt: NftArt
  slides: NftArt[]
  source: 'portfolio' | '1-1' | 'editions'
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
  const [isOpenInfos, setIsOpenInfos] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // function animateInfos(isOpen: boolean) {
  // 	if (window.screen.width >= 1280) {
  // 		artInfosAnimation(true, setIsAnimating)
  // 	}
  // }

  function handleMoreSlides() {
    // Busca mais slides
  }

  function wasMinted(nft: NftArt) {
    return !!nft.mintedEvent
  }

  const truncate = (input: string) =>
    input?.length > 600 ? `${input.substring(0, 250)}...` : input

  useEffect(() => {
    if (selectedArt && window.screen.width >= 1280) {
      setIsOpenVideo(false)
      setIsOpenInfos(false)
      setIsAnimating(false)
      resetArtInfo()
    }
  }, [onChangeSlideIndex])

  if (!selectedArt) {
    throw new Error('Image does not exists')
  }

  return (
    <section
      className={cn(
        'flex h-full items-end gap-y-8 gap-x-8',
        'grid-cols-[minmax(400px,auto)_minmax(400px,400px)]',
        'xl:grid',
        '2xl:gap-x-20 2xl:mr-[16%] 3xl:mr-0'
      )}
    >
      {/* {!!selectedArt.videoProcess && (
				<VideoProcessModal
					open={isOpenVideo}
					setOpen={setIsOpenVideo}
					videoUrl={selectedArt.videoProcess}
				/>
			)} */}

      <div className="xl:min-h-[708px] content-end">
        <ArtDetails
          detailedImage={selectedArt.nftCompressedUrl}
          image={selectedArt.nftCompressedHdUrl}
          name={selectedArt.name}
        />
      </div>

      {!!selectedArt.videoProcess && (
        <button
          aria-label="Open video process modal"
          onClick={() => setIsOpenVideo(true)}
          className="grid place-content-center h-6 xl:hidden"
        >
          <CustomIcons.Camera />
        </button>
      )}

      <div className="block w-[100vw] self-center xl:hidden">
        <HorizontalInCarousel
          onChangeSlideIndex={onChangeSlideIndex}
          slides={slides}
          getMoreSlides={() => handleMoreSlides()}
        />
      </div>

      {wasMinted(selectedArt) ? (
        <div
          id="art-container"
          className="flex flex-col gap-8 transition-all overflow-y-scroll max-h-full h-full xl:gap-0 w-full md:w-[400px]"
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
                ? selectedArt.description
                : truncate(selectedArt.description)}
              {selectedArt?.description?.length > 600 && (
                <span>
                  <button
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className="text-primary-50 font-extrabold"
                  >
                    {isDescriptionExpanded ? '-' : '+'}
                  </button>
                </span>
              )}
            </p>
            <div>
              <p className="text-primary-50 underline mt-4">
                {selectedArt.name}
              </p>
              <p>
                minted on{' '}
                {format(addHours(selectedArt.mintedDate, 3), 'd LLLL, yyyy')}
              </p>
            </div>
          </div>

          {/* Conditional rendering with fade animation */}
          <div
            className={cn(
              'fade-up overflow-y-auto',
              showDetails ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'
            )}
            style={{ transitionProperty: 'opacity, max-height' }}
          >
            <div id="art-info-wrapper" className={cn('flex flex-col gap-12')}>
              <div id="art-links" className="mt-12">
                <ArtLinks
                  email={email}
                  externalLinks={selectedArt.externalLinks}
                  availableForPurchase={selectedArt.availablePurchase}
                  makeOffer={selectedArt.makeOffer}
                  views={{
                    ...(selectedArt.etherscan && {
                      Etherscan: `https://etherscan.io/token/${selectedArt.address}?a=${selectedArt.id}`
                    })
                  }}
                />
              </div>

              <ArtOwnership
                nftChain={selectedArt.nftChain}
                artAddress={getNftLinks(
                  selectedArt.address,
                  selectedArt.nftChain,
                  selectedArt.id,
                  'token'
                )}
                owners={selectedArt.owners}
                firstEvent={selectedArt.mintedEvent}
                lastEvent={selectedArt.lastEvent}
                source={source}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-sm justify-end text-sm text-secondary-100 h-full">
          <div className="flex flex-col-reverse mt-4 mb-10 gap-4 xl:flex-col">
            <p className="break-words">{selectedArt['description']}</p>

            <p className="text-primary-50 underline">{selectedArt['name']}</p>
          </div>
          {!(selectedArt as NftArt).availablePurchase && (
              <p className="mt-2 grid content-center justify-start border-y-[1px] border-secondary-100 text-sm h-16 px-8 font-bold text-secondary-100">
                NOT AVAILABLE FOR PURCHASE
              </p>
            )}
        </div>
      )}

      <div className="hidden place-content-center xl:grid">
        {!!selectedArt.videoProcess ? (
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

      <button
        aria-label="Open art infos"
        className="group hidden relative place-items-center w-6 h-6 xl:grid"
        onClick={() => {
          setShowDetails(!showDetails)
          artInfoButtonAnimation()
        }}
        disabled={isAnimating}
      >
        <CustomIcons.Plus
          className={cn(
            'art-info-button absolute transition-all text-secondary-100 group-hover:text-primary-50'
          )}
        />
      </button>
    </section>
  )
}

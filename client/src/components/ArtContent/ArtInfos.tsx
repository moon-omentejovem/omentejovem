'use client'

import { ReactElement, useEffect, useState } from 'react'

import { ArtDetails } from '@/components/ArtDetails'
import { ArtLinks } from '@/components/ArtLinks'
import { ArtOwnership } from '@/components/ArtOwnership/ArtOwnership'
import { addHours, format, fromUnixTime } from 'date-fns'
import { Chain, NFT } from './types'
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
  selectedArt: NFT
  slides: NFT[]
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

  function wasMinted(nft: NFT) {
    return true // TODO!!nft.mintedEvent
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
      className={cn('flex p-4 flex-wrap gap-4 h-full p-5 pl-0 xl:pr-[12vw]')}
    >
      {/* {!!selectedArt.videoProcess && (
				<VideoProcessModal
					open={isOpenVideo}
					setOpen={setIsOpenVideo}
					videoUrl={selectedArt.videoProcess}
				/>
			)} */}
      <div className="2xl:flex-1 min-w-[300px] xl:min-w-[350px] flex items-end flex-grow-0 shrink basis-0">
        <div className="art-detail-inner-container">
          <ArtDetails
            detailedImage={selectedArt.image_url || ''}
            image={selectedArt.image_url || ''}
            name={selectedArt.name || ''}
          />
        </div>
      </div>
      {!!selectedArt.video_url && (
        <button
          aria-label="Open video process modal"
          onClick={() => setIsOpenVideo(true)}
          className="grid place-content-center h-6 xl:hidden"
        >
          <CustomIcons.Camera />
        </button>
      )}
      <div className="block w-[75vw] self-center xl:hidden">
        <HorizontalInCarousel
          onChangeSlideIndex={onChangeSlideIndex}
          slides={slides}
          getMoreSlides={() => handleMoreSlides()}
        />
      </div>
      {wasMinted(selectedArt) ? (
        <div
          id="art-container"
          className={cn(
            'px-4 gap-2 transition-all max-h-full h-full w-full xl:w-[400px] flex-shrink-0 flex-grow-0 flex flex-col justify-end'
          )}
        >
          <div
            className={cn(
              'overflow-hidden',
              showDetails ? 'overflow-y-scroll' : ''
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
                  ? selectedArt.description
                  : truncate(selectedArt.description || '')}
                {(selectedArt?.description?.length || 0) > 600 && (
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
                  {format(
                    addHours(selectedArt.created_date || new Date(), 3),
                    'd LLLL, yyyy'
                  )}
                </p>
              </div>
            </div>

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
              <div id="art-info-wrapper" className={cn('flex flex-col gap-12')}>
                <div id="art-links" className="mt-12">
                  <ArtLinks
                    email={email}
                    // externalLinks={[
                    //   {
                    //     url: selectedArt.external_url || '',
                    //     name: 'External URL'
                    //   }
                    // ]}
                    // availableForPurchase={selectedArt.available_purchase}
                    makeOffer={{
                      active: false,
                      buttonText: 'Make Offer'
                    }}
                    views={{
                      Etherscan: `https://etherscan.io/token/${selectedArt.contract_address}?a=${selectedArt.token_id}`
                    }}
                  />
                </div>

                <ArtOwnership
                  nftChain={selectedArt.chain.toLowerCase() as Chain}
                  artAddress={getNftLinks(
                    selectedArt.contract_address,
                    selectedArt.chain.toLowerCase() as Chain,
                    selectedArt.token_id,
                    'token'
                  )}
                  owners={selectedArt.owners}
                  // firstEvent={selectedArt.created_date || new Date()}
                  // lastEvent={selectedArt.last_transfer_date || new Date()}
                  source={source}
                />
              </div>
            </div>
          </div>

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
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-sm justify-end text-sm text-secondary-100 h-full">
          <div className="flex flex-col-reverse mt-4 mb-10 gap-4 xl:flex-col">
            <p className="break-words">{selectedArt['description']}</p>

            <p className="text-primary-50 underline">{selectedArt['name']}</p>
          </div>
          {/* {!(selectedArt as NFT).availablePurchase && (
            <p className="mt-2 grid content-center justify-start border-y-[1px] border-secondary-100 text-sm h-16 px-8 font-bold text-secondary-100">
              NOT AVAILABLE FOR PURCHASE
            </p>
          )} */}
        </div>
      )}
      <div className="hidden place-content-center xl:grid">
        {!!selectedArt.video_url ? (
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
  )
}

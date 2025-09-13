'use client'

import { ReactElement, useCallback, useEffect, useState } from 'react'

import { artInfosCollectionsAnimation } from '@/animations/client'
import { VerticalCarousel } from '../Carousels/VerticalCarousel/VerticalCarousel'
import { ArtInfos } from './ArtInfos'
import './styles.css'
import { Artwork } from './types'

interface ArtInfosCollectionsProperties {
  email: string
  selectedArt: Artwork
  slides: Artwork[]
  onChangeSlideIndex: (index: number) => void
  currentImageIndex: number
}

export function ArtInfosCollections({
  email,
  selectedArt,
  slides,
  onChangeSlideIndex,
  currentImageIndex
}: ArtInfosCollectionsProperties): ReactElement {
  const [isOpenVideo, setIsOpenVideo] = useState(false)
  const [isOpenInfos, setIsOpenInfos] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const truncate = (input: string) =>
    input?.length > 600 ? `${input.substring(0, 250)}...` : input

  function animateInfos(isOpen: boolean) {
    if (window.screen.width >= 1280) {
      artInfosCollectionsAnimation(isOpen, setIsAnimating)
    }
  }

  function handleMoreSlides() {
    // Busca mais slides
  }

  useEffect(() => {
    if (selectedArt && window.screen.width >= 1280) {
      setIsOpenVideo(false)
      setIsOpenInfos(false)
      setIsAnimating(false)
      // resetArtInfo()
    }
  }, [onChangeSlideIndex, selectedArt])

  if (!selectedArt) {
    throw new Error('Image does not exists')
  }

  const renderContent = useCallback((): ReactElement => {
    return (
      <ArtInfos
        email={email}
        selectedArt={selectedArt}
        slides={slides}
        onChangeSlideIndex={onChangeSlideIndex}
        source="collections"
      />
    )
  }, [email, onChangeSlideIndex, selectedArt, slides])

  return (
    <main className="flex flex-col px-6 2xl:pb-16 2xl:px-20 2xl:pb-8 xl:h-screenMinusHeader">
      <VerticalCarousel
        slideIndex={currentImageIndex}
        onChangeSlideIndex={onChangeSlideIndex}
        slides={slides.map((art) => ({
          name: art.title || '',
          nftCompressedHdUrl: art.image_cached_path || ''
        }))}
      />
      {renderContent()}
    </main>
  )

  // return (
  //   <section className={cn('h-full max-h-[calc(100%-168px)]')}>
  //     <div
  //       id="art-up-container"
  //       className={cn(
  //         'h-full',
  //         'flex flex-col gap-x-10 gap-y-8 2xl:gap-x-20',
  //         'xl:grid-cols-[minmax(200px,auto)_minmax(12rem,25rem)_25rem]',
  //         'xl:grid-rows-[minmax(0,100%)_1.5rem]',
  //         'xl:grid xl:items-end'
  //       )}
  //     >
  //       {!!selectedArt.video_url && (
  //         <VideoProcessModal
  //           open={isOpenVideo}
  //           setOpen={setIsOpenVideo}
  //           videoUrl={selectedArt.video_url}
  //         />
  //       )}

  //       <div className="art-detail-inner-container flex flex-col w-full h-full justify-end items-center *:h-full">
  //         <ImageModal detailedImage={selectedArt.image_url} collectionsMode>
  //           <Image
  //             src={selectedArt.image_url ?? ''}
  //             width={0}
  //             height={0}
  //             alt={selectedArt.name ?? ''}
  //             className="w-full h-auto xl:w-auto xl:max-h-[100%]"
  //             id="active-image"
  //           />
  //         </ImageModal>
  //       </div>

  //       {!!selectedArt.video_url && (
  //         <button
  //           aria-label="Open video process modal"
  //           onClick={() => setIsOpenVideo(true)}
  //           className="grid place-content-center h-6 xl:hidden"
  //         >
  //           <CustomIcons.Camera />
  //         </button>
  //       )}

  //       <div className="block w-[100vw] self-center xl:hidden">
  //         <HorizontalInCarousel
  //           onChangeSlideIndex={onChangeSlideIndex}
  //           slides={slides}
  //           getMoreSlides={() => handleMoreSlides()}
  //         />
  //       </div>

  //       <div
  //         id="art-container"
  //         className="gap-2 transition-all max-h-full h-full flex flex-col justify-end"
  //       >
  //         <div
  //           className={cn(
  //             'overflow-hidden',
  //             showDetails ? 'overflow-y-scroll' : ''
  //           )}
  //         >
  //           <div
  //             id="art-description"
  //             className={cn(
  //               'h-fit flex flex-col-reverse gap-4 w-full text-sm text-secondary-100',
  //               'xl:flex-col xl:max-w-sm xl:mt-auto'
  //             )}
  //           >
  //             <p id="art-description-text" className="break-words">
  //               {isDescriptionExpanded
  //                 ? selectedArt.description
  //                 : truncate(selectedArt.description ?? '')}
  //               {(selectedArt?.description?.length ?? 0) > 600 && (
  //                 <span>
  //                   <button
  //                     onClick={() =>
  //                       setIsDescriptionExpanded(!isDescriptionExpanded)
  //                     }
  //                     className="text-primary-50 font-extrabold"
  //                   >
  //                     {isDescriptionExpanded ? '-' : '+'}
  //                   </button>
  //                 </span>
  //               )}
  //             </p>

  //             <div>
  //               <a
  //                 target="_blank"
  //                 rel="noreferrer"
  //                 href={selectedArt.external_url ?? ''}
  //                 className="text-primary-50 underline mt-4"
  //               >
  //                 {selectedArt.name}
  //               </a>
  //               <p>
  //                 minted on{' '}
  //                 {selectedArt.created_date &&
  //                   format(
  //                     addHours(new Date(selectedArt.created_date), 3),
  //                     'd LLLL, yyyy'
  //                   )}
  //               </p>
  //             </div>
  //           </div>

  //           {/* Conditional rendering with fade animation */}
  //           <div
  //             id="art-info-wrapper"
  //             className={cn(
  //               'fade-up',
  //               showDetails
  //                 ? 'opacity-100 max-h-screen  visible'
  //                 : 'opacity-0 max-h-0 overflow-y-hidden invisible'
  //             )}
  //             style={{ transitionProperty: 'opacity, max-height' }}
  //           >
  //             <div id="art-links">
  //               <ArtLinks
  //                 email={email}
  //                 // externalLinks={selectedArt.externalLinks}
  //                 makeOffer={{
  //                   active: false,
  //                   buttonText: 'Make Offer'
  //                 }}
  //                 // availableForPurchase={selectedArt.availablePurchase}
  //                 views={{
  //                   Etherscan: `https://etherscan.io/token/${selectedArt.contract_address}?a=${selectedArt.token_id}`
  //                 }}
  //               />

  //               <ArtOwnership
  //                 collectionsMode
  //                 nftChain={selectedArt.chain.toLowerCase() as Chain}
  //                 artAddress={getNftLinks(
  //                   selectedArt.contract_address,
  //                   selectedArt.chain.toLowerCase() as Chain,
  //                   selectedArt.token_id,
  //                   'token'
  //                 )}
  //                 owners={selectedArt.owners}
  //                 firstEvent={selectedArt.first_created}
  //                 lastEvent={selectedArt.last_sale}
  //               />
  //             </div>
  //           </div>
  //         </div>
  //         <button
  //           aria-label="Open art infos"
  //           className="group relative flex items-center justify-center w-10 h-10" // Fixed width and height
  //           onClick={() => {
  //             setShowDetails(!showDetails)
  //             artInfoButtonAnimation()
  //           }}
  //           disabled={isAnimating}
  //         >
  //           <CustomIcons.Plus
  //             className={cn(
  //               'art-info-button w-6 h-6 transition-all text-secondary-100 group-hover:text-primary-50' // Set size for the SVG
  //             )}
  //           />
  //         </button>
  //       </div>

  //       {/* (
  // 			<div className="flex flex-col w-full max-w-sm justify-end text-sm text-secondary-100">
  // 				<div className="flex flex-col-reverse mt-4 mb-10 gap-4 xl:flex-col">
  // 					<p>{selectedArt.description}</p>

  // 					<p className="text-primary-50 underline">{selectedArt.name}</p>
  // 				</div>

  // 				{selectedArt.available_purchase?.active && !selectedArt.available_purchase.status && (
  // 					<p className="mt-2 grid content-center justify-start border-y-[1px] border-secondary-100 text-sm h-16 px-8 font-bold text-secondary-100">
  // 						NOT AVAILABLE FOR PURCHASE
  // 					</p>
  // 				)}
  // 			</div>
  // 		) */}

  //       <div className="hidden place-content-center xl:grid">
  //         {!!selectedArt.video_url ? (
  //           <button
  //             aria-label="Open video process modal"
  //             onClick={() => setIsOpenVideo(true)}
  //             className="grid place-content-center h-6"
  //           >
  //             <CustomIcons.Camera />
  //           </button>
  //         ) : (
  //           <span className="h-6" />
  //         )}
  //       </div>
  //     </div>

  //     <div className="block w-[90vw] self-center xl:block">
  //       <HorizontalInCarousel
  //         onChangeSlideIndex={onChangeSlideIndex}
  //         slides={slides}
  //         getMoreSlides={() => handleMoreSlides()}
  //         slideIndex={currentImageIndex}
  //       />
  //     </div>
  //   </section>
  // )
}

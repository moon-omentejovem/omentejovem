'use client'

import { ReactElement, useEffect, useState } from 'react'

import { ArtDetails } from '@/components/ArtDetails'
import { ArtLinks } from '@/components/ArtLinks'
import { ArtOwnership } from '@/components/ArtOwnership/ArtOwnership'
import { addHours, format, fromUnixTime } from 'date-fns'
import { ArtImage, NftArt, isNftArt } from './types'
import { cn } from '@/lib/utils'
import { CustomIcons } from '@/assets/icons'
import { VideoProcessModal } from '../Modals/VideoProcessModal'
import {
	artInfoButtonAnimation,
	resetArtInfo,
	resetButtonInfo,
} from '@/animations'
import { HorizontalInCarousel } from '../Carousels/HorizontalInCarousel/HorizontalInCarousel'
import './styles.css'
import { omentejovemAddress } from '../ArtOwnership/ArtTransaction'
import { getNftLinks } from './utils'
interface ArtInfosProperties {
	email: string
	selectedArt: NftArt
	slides: (ArtImage | NftArt)[]
	onChangeSlideIndex: (index: number) => void
}

export function ArtInfos({
	email,
	selectedArt,
	slides,
	onChangeSlideIndex,
}: ArtInfosProperties): ReactElement {
	const [isOpenVideo, setIsOpenVideo] = useState(false)
	const [isOpenInfos, setIsOpenInfos] = useState(false)
	const [isAnimating, setIsAnimating] = useState(false)

	// function animateInfos(isOpen: boolean) {
	// 	if (window.screen.width >= 1280) {
	// 		artInfosAnimation(true, setIsAnimating)
	// 	}
	// }

	function handleMoreSlides() {
		// Busca mais slides
	}

	useEffect(() => {
		if (selectedArt && window.screen.width >= 1280) {
			setIsOpenVideo(false)
			setIsOpenInfos(false)
			setIsAnimating(false)
			resetArtInfo()
			resetButtonInfo()
		}
	}, [onChangeSlideIndex])

	if (!selectedArt) {
		throw new Error('Image does not exists')
	}

	return (
		<section
			className={cn(
				'flex flex-col h-full gap-y-8 gap-x-8',
				'grid-cols-[minmax(400px,max-content)_minmax(65ch,max-content)]',
				'3xl:grid-cols-[minmax(400px,max-content)_minmax(40ch,max-content)]',
				'xl:grid-rows-[minmax(100px,100%)_minmax(min-content,max-content)]',
				'xl:grid xl:items-end',
				'2xl:gap-x-20 2xl:mr-[15%] 3xl:mr-0',
			)}
		>
			{!!selectedArt.videoProcess && (
				<VideoProcessModal
					open={isOpenVideo}
					setOpen={setIsOpenVideo}
					videoUrl={selectedArt.videoProcess}
				/>
			)}

			<ArtDetails
				detailedImage={isNftArt(selectedArt) ? selectedArt.nftUrl : undefined}
				image={selectedArt.url}
				name={selectedArt.name}
			/>

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

			{isNftArt(selectedArt) ? (
				<div
					id="art-container"
					className="flex flex-col w-fit gap-8 transition-all overflow-y-scroll max-h-full h-full xl:gap-0"
				>
					<div
						id="art-description"
						className={cn(
							'h-fit flex flex-col-reverse gap-4 w-full text-sm text-secondary-100',
							'xl:flex-col xl:max-w-sm xl:mt-auto',
						)}
					>
						<p id="art-description-text" className="break-words">
							{selectedArt.description}
						</p>

						<div>
							<p className="text-primary-50 underline mt-4">{selectedArt.name}</p>
							<p>minted on {format(addHours(selectedArt.mintedDate, 3), 'd LLLL, yyyy')}</p>
						</div>
					</div>

					<div id="art-info-wrapper" className={cn('flex flex-col gap-12')}>
						<div id="art-links" className="mt-12">
							<ArtLinks
								email={email}
								availableOn={selectedArt.contracts}
								availableForPurchase={selectedArt.availablePurchase}
								makeOffer={selectedArt.makeOffer}
								views={{
									...(selectedArt.etherscan && {
										Etherscan: `https://etherscan.io/token/${selectedArt.address}?a=${selectedArt.id}`,
									}),
								}}
							/>
						</div>

						<ArtOwnership
							nftChain={selectedArt.nftChain}
							artAddress={getNftLinks(
								selectedArt.address,
								selectedArt.nftChain,
								selectedArt.id,
								'token',
							)}
							owner={
								selectedArt.owner ||
								!omentejovemAddress[selectedArt.transactions?.[0]?.toAddress ?? '']
									? {
											name: selectedArt.transactions?.[0]?.toAddress ?? '',
											profileUrl: getNftLinks(
												selectedArt.transactions?.[0]?.toAddress ?? '',
												selectedArt.nftChain,
												selectedArt.id,
												'address',
											),
									  }
									: undefined
							}
							transactions={
								selectedArt.transactions?.map((transaction) => ({
									date: fromUnixTime(transaction.eventTimestamp).toISOString(),
									nextOwner: {
										name: transaction.toAddress,
										profileUrl: getNftLinks(
											transaction.toAddress,
											selectedArt.nftChain,
											selectedArt.id,
											'address',
										),
									},
									previousOwner: {
										name: transaction.fromAddress,
										profileUrl: getNftLinks(
											transaction.fromAddress,
											selectedArt.nftChain,
											selectedArt.id,
											'address',
										),
									},
									transactionUrl: getNftLinks(
										transaction.transaction,
										selectedArt.nftChain,
										selectedArt.id,
										'transaction',
									),
								})) ?? []
							}
						/>
					</div>
				</div>
			) : (
				<div className="flex flex-col w-full max-w-sm justify-end text-sm text-secondary-100">
					<div className="flex flex-col-reverse mt-4 mb-10 gap-4 xl:flex-col">
						<p className="break-words">{selectedArt['description']}</p>

						<p className="text-primary-50 underline">{selectedArt['name']}</p>
					</div>

					{selectedArt['availablePurchase']['active'] && !selectedArt['availablePurchase']['status'] && (
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

			{isNftArt(selectedArt) && (
				<button
					aria-label="Open art infos"
					className="group hidden relative place-items-center w-6 h-6 xl:grid"
					// onClick={() => {
					// 	animateInfos(!isOpenInfos)
					// 	setIsOpenInfos((oldValue) => !oldValue)
					// 	artInfoButtonAnimation()
					// }}
					disabled={isAnimating}
				>
					<CustomIcons.Plus
						className={cn(
							'art-info-button absolute transition-all text-secondary-100 group-hover:text-primary-50',
						)}
					/>
				</button>
			)}
		</section>
	)
}

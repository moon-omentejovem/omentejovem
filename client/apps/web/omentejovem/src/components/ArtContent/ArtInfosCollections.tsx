'use client'

import { ReactElement, useEffect, useState } from 'react'

import { ArtLinks } from '@/components/ArtLinks'
import { ArtOwnership } from '@/components/ArtOwnership/ArtOwnership'
import { addHours, format, fromUnixTime } from 'date-fns'
import { ArtImage, NftArt, isNftArt } from './types'
import { cn } from '@/lib/utils'
import { CustomIcons } from '@/assets/icons'
import { VideoProcessModal } from '../Modals/VideoProcessModal'
import {
	artInfoButtonAnimation,
	artInfosCollectionsAnimation,
	resetArtInfo,
	resetButtonInfo,
} from '@/animations'
import { HorizontalInCarousel } from '../Carousels/HorizontalInCarousel/HorizontalInCarousel'
import './styles.css'
import { omentejovemAddress } from '../ArtOwnership/ArtTransaction'
import { ImageModal } from '../Modals/ImageModal'
import Image from 'next/image'
import { getNftLinks } from './utils'

interface ArtInfosCollectionsProperties {
	email: string
	selectedArt: NftArt | ArtImage
	slides: (ArtImage | NftArt)[]
	onChangeSlideIndex: (index: number) => void
}

export function ArtInfosCollections({
	email,
	selectedArt,
	slides,
	onChangeSlideIndex,
}: ArtInfosCollectionsProperties): ReactElement {
	const [isOpenVideo, setIsOpenVideo] = useState(false)
	const [isOpenInfos, setIsOpenInfos] = useState(false)
	const [isAnimating, setIsAnimating] = useState(false)

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
				'flex flex-col h-full max-h-[calc(100%-168px)] gap-x-10 gap-y-8 2xl:gap-x-20',
				'xl:grid-cols-[minmax(200px,max-content)_minmax(12rem,25rem)_25rem]',
				'xl:grid-rows-[minmax(0,100%)_1.5rem]',
				'xl:grid xl:items-end',
			)}
		>
			{!!selectedArt.video_process && (
				<VideoProcessModal
					open={isOpenVideo}
					setOpen={setIsOpenVideo}
					videoUrl={selectedArt.video_process}
				/>
			)}

			<div className="flex flex-col w-full h-full justify-end *:h-full">
				<ImageModal
					detailedImage={isNftArt(selectedArt) ? selectedArt.nft_url : selectedArt.url}
					collectionsMode
				>
					<Image
						src={selectedArt.url}
						width={0}
						height={0}
						alt={selectedArt.name}
						className="w-full h-auto xl:w-auto xl:max-h-[100%]"
						id="active-image"
					/>
				</ImageModal>
			</div>

			{!!selectedArt.video_process && (
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
				<>
					<div
						id="art-container"
						className="flex flex-col gap-12 transition-all overflow-y-scroll max-h-full h-full"
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
								<a
									target="_blank"
									rel="noreferrer"
									href={selectedArt.url}
									className="text-primary-50 underline mt-4"
								>
									{selectedArt.name}
								</a>
								<p>minted on {format(addHours(selectedArt.mintedDate, 3), 'd LLLL, yyyy')}</p>
							</div>
						</div>

						<div id="art-info-wrapper" className={'flex flex-col xl:hidden'}>
							<div id="art-links">
								<ArtLinks
									email={email}
									availableOn={selectedArt.contracts}
									makeOffer={selectedArt.makeOffer}
									availableForPurchase={selectedArt.available_purchase}
									views={{
										...(selectedArt.etherscan && {
											Etherscan: `https://etherscan.io/token/${selectedArt.address}?a=${selectedArt.id}`,
										}),
									}}
								/>
							</div>
						</div>
					</div>

					<div id="art-ownership-collections" className="flex w-full overflow-y-scroll max-h-full">
						<ArtOwnership
							collectionsMode
							nftChain={selectedArt.nftChain}
							artAddress={getNftLinks(
								selectedArt.address,
								selectedArt.nftChain,
								selectedArt.id,
								'token',
							)}
							owner={
								selectedArt.owner ||
								!omentejovemAddress[selectedArt.transactions?.[0]?.to_address ?? '']
									? {
											name: selectedArt.transactions?.[0]?.to_address ?? '',
											profileUrl: getNftLinks(
												selectedArt.transactions?.[0]?.to_address ?? '',
												selectedArt.nftChain,
												selectedArt.id,
												'address',
											),
									  }
									: undefined
							}
							transactions={
								selectedArt.transactions?.map((transaction) => ({
									date: fromUnixTime(transaction.event_timestamp).toISOString(),
									nextOwner: {
										name: transaction.to_address,
										profileUrl: getNftLinks(
											transaction.to_address,
											selectedArt.nftChain,
											selectedArt.id,
											'address',
										),
									},
									previousOwner: {
										name: transaction.from_address,
										profileUrl: getNftLinks(
											transaction.from_address,
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
				</>
			) : (
				<div className="flex flex-col w-full max-w-sm justify-end text-sm text-secondary-100">
					<div className="flex flex-col-reverse mt-4 mb-10 gap-4 xl:flex-col">
						<p>{selectedArt.description}</p>

						<p className="text-primary-50 underline">{selectedArt.name}</p>
					</div>

					{selectedArt.available_purchase?.active && !selectedArt.available_purchase.status && (
						<p className="mt-2 grid content-center justify-start border-y-[1px] border-secondary-100 text-sm h-16 px-8 font-bold text-secondary-100">
							NOT AVAILABLE FOR PURCHASE
						</p>
					)}
				</div>
			)}

			<div className="hidden place-content-center xl:grid">
				{!!selectedArt.video_process ? (
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
					onClick={() => {
						animateInfos(!isOpenInfos)
						setIsOpenInfos((oldValue) => !oldValue)
						artInfoButtonAnimation()
					}}
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

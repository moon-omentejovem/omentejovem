'use client'

import 'swiper/css'
import 'swiper/css/pagination'
import './style.css'

import Image from 'next/image'
import { Mousewheel, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperType } from 'swiper/types'
import { ArtImage, NftArt } from '@/components/ArtContent/types'
import { cn } from '@/lib/utils'

interface VerticalCarouselProperties {
	slideIndex?: number
	onChangeSlideIndex: (index: number) => void
	slides: (ArtImage | NftArt)[]
	getMoreSlides?: () => void
}

export function VerticalCarousel({
	slideIndex,
	onChangeSlideIndex,
	slides,
	getMoreSlides,
}: VerticalCarouselProperties) {
	function handleGetMoreslides(swiperInstance: SwiperType) {
		const currentIndex = swiperInstance.activeIndex
		const totalSlides = swiperInstance.slides.length

		if (currentIndex >= totalSlides / 2) {
			getMoreSlides?.()
		}
	}

	return (
		<div
			className={cn(
				'hidden fixed h-[calc(100vh-6.5rem)] top-[6.5rem] right-0 z-20',
				'xl:flex',
				'2xl:h-[100vh] 2xl:top-0 2xl:right-[10vw]',
				'min-[2000px]:right-[15vw] min-[2350px]:right-[5vw]',
			)}
		>
			<Swiper
				direction="vertical"
				slidesPerView={'auto'}
				grabCursor={true}
				modules={[Mousewheel, Pagination]}
				watchSlidesProgress={true}
				loop={true}
				mousewheel={true}
				slideToClickedSlide={true}
				initialSlide={slideIndex}
				className="vertical-slider"
				onSlideChange={(e) => {
					onChangeSlideIndex(e.realIndex % slides.length)
				}}
				onSlideChangeTransitionEnd={(swiperInstance) => {
					handleGetMoreslides(swiperInstance)
				}}
			>
				{[...slides].map((art, index) => (
					<SwiperSlide key={`${art.name}.${index}`} className="h-[150px] max-h-[150px]">
						<div aria-label={art.name} className="flex h-[150px] w-[150px]">
							<Image
								src={art.url}
								alt={art.name}
								width={0}
								height={0}
								className="h-full w-full object-cover"
								loading="lazy"
							/>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	)
}

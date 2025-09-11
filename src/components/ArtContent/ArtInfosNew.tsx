'use client'

import { ReactElement, useEffect, useState } from 'react'

import { ArtLinks } from '@/components/ArtLinks'
import { ProcessedArtwork } from '@/types/artwork'
import { cn } from '@/lib/utils'
import {
  artInfoButtonAnimation,
  resetArtInfo,
  resetButtonInfo
} from '@/animations'
import { HorizontalInCarousel } from '../Carousels/HorizontalInCarousel/HorizontalInCarousel'
import './styles.css'
import { ArtDescription } from './ArtDescription'
import { ArtDetails } from '@/components/ArtDetails'
import { NFT } from './types'

interface ArtInfosProperties {
  email: string
  selectedArtwork: ProcessedArtwork
  slides: ProcessedArtwork[]
  source: 'portfolio' | '1-1' | 'editions' | string
  onChangeSlideIndex: (index: number) => void
}

// Component for artwork technical details
function ArtworkDetails({ artwork }: { artwork: ProcessedArtwork }) {
  return (
    <div className="rounded-lg border border-gray-700 p-4">
      <h3 className="mb-4 text-lg font-medium">Artwork Details</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-400">Type</h4>
          <p className="text-sm">
            {artwork.type === 'single' ? '1/1' : 'Edition'}
          </p>
        </div>
        
        {artwork.editionsTotal && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-400">
              Edition Size
            </h4>
            <p className="text-sm">{artwork.editionsTotal}</p>
          </div>
        )}

        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-400">Token ID</h4>
          <p className="text-sm font-mono">{artwork.tokenId}</p>
        </div>

        {artwork.series.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-400">Series</h4>
            <p className="text-sm">
              {artwork.series.map(s => s.name).join(', ')}
            </p>
          </div>
        )}

        {artwork.mintDate && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-400">
              Mint Date
            </h4>
            <p className="text-sm">
              {new Date(artwork.mintDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Convert ProcessedArtwork to NFT format for carousel compatibility
function convertToNFTFormat(artwork: ProcessedArtwork): NFT {
  return {
    nft_id: artwork.id,
    chain: 'ethereum' as const,
    contract: {
      address: artwork.tokenId,
      name: artwork.title,
      symbol: artwork.slug,
      totalSupply: artwork.editionsTotal?.toString() || '1',
      tokenType: artwork.type === 'single' ? 'ERC721' : 'ERC1155',
      contractDeployer: 'omentejovem',
      deployedBlockNumber: 0,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: artwork.title,
        collectionSlug: artwork.slug,
        safelistRequestStatus: 'verified',
        imageUrl: artwork.image.url,
        description: typeof artwork.description === 'string' ? artwork.description : '',
        externalUrl: artwork.mintLink || null,
        twitterUsername: 'omentejovem',
        discordUrl: '',
        bannerImageUrl: artwork.image.url,
        lastIngestedAt: artwork.updatedAt
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: artwork.tokenId,
    tokenType: artwork.type === 'single' ? 'ERC721' : 'ERC1155',
    name: artwork.title,
    description: typeof artwork.description === 'string' ? artwork.description : '',
    tokenUri: artwork.image.originalUrl,
    image: {
      cachedUrl: artwork.image.url,
      thumbnailUrl: artwork.image.thumbnailUrl || artwork.image.url,
      pngUrl: artwork.image.url,
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: artwork.image.originalUrl,
      displayUrl: artwork.image.url
    },
    raw: {
      tokenUri: artwork.image.originalUrl,
      metadata: {
        image: artwork.image.originalUrl,
        createdBy: 'omentejovem',
        yearCreated: artwork.mintDate
          ? new Date(artwork.mintDate).getFullYear().toString()
          : '',
        name: artwork.title,
        description: typeof artwork.description === 'string' ? artwork.description : '',
        media: null,
        tags: artwork.series.map(s => s.name)
      },
      error: null
    },
    collection: {
      name: artwork.series[0]?.name || 'Omentejovem Collection',
      slug: artwork.series[0]?.slug || 'omentejovem',
      externalUrl: null,
      bannerImageUrl: artwork.image.url
    },
    mint: {
      mintAddress: artwork.tokenId || null,
      blockNumber: null,
      timestamp: artwork.mintDate || null,
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: artwork.updatedAt
  }
}

export function ArtInfosNew({
  email,
  selectedArtwork,
  slides,
  source,
  onChangeSlideIndex
}: ArtInfosProperties): ReactElement {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const onChangeToOtherSlide = (index: number) => {
    onChangeSlideIndex(index)
    setShowDetails(false)
    resetButtonInfo()
  }

  function handleMoreSlides() {
    // Busca mais slides
  }

  useEffect(() => {
    if (selectedArtwork && window.screen.width >= 1280) {
      setIsAnimating(false)
      resetArtInfo()
      setShowDetails(false)
      resetButtonInfo()
    }
  }, [onChangeSlideIndex, selectedArtwork])

  if (!selectedArtwork) {
    throw new Error('Artwork does not exist')
  }

  // Convert slides to NFT format for carousel compatibility
  const nftSlides: NFT[] = slides.map(convertToNFTFormat)
  const selectedNFT = convertToNFTFormat(selectedArtwork)

  function handleToggleAnimation(): void {
    if (isAnimating) {
      setIsAnimating(false)
      resetArtInfo()
      resetButtonInfo()
    } else {
      setIsAnimating(true)
      artInfoButtonAnimation()
    }
  }

  function handleToggleDetails(): void {
    setShowDetails(!showDetails)
  }

  return (
    <section
      className={cn(
        'flex flex-wrap gap-8 xl:h-[calc(100vh-4rem)] xl:overflow-scroll xl:max-w-[85%] gap-x-auto w-full scrollbar-hide'
      )}
    >
      <div className="md:flex-1 min-w-[200px] xl:min-w-[350px] flex flex-col max-h-full">
        <div className="xl:art-detail-inner-container overflow-hidden flex flex-1 justify-start xl:justify-end">
          <ArtDetails
            detailedImage={selectedArtwork.image.originalUrl}
            image={source === 'portfolio' ? selectedArtwork.image.url : selectedArtwork.image.originalUrl}
            name={selectedArtwork.title || ''}
          />
        </div>
      </div>
      
      <div className="block w-[100vw] self-center xl:hidden md:order-3">
        <HorizontalInCarousel
          slideIndex={slides.findIndex(slide => slide.id === selectedArtwork.id)}
          onChangeSlideIndex={onChangeToOtherSlide}
          getMoreSlides={handleMoreSlides}
          slides={nftSlides}
        />
      </div>

      <div className="flex flex-col w-full md:w-[48%] xl:w-[35%] gap-y-4 xl:gap-y-8">
        <div className="flex flex-row items-center gap-x-6">
          <h1 className="text-xl font-semibold lg:text-2xl 2xl:text-4xl">
            {selectedArtwork.title}
          </h1>
        </div>

        <ArtDescription
          description={typeof selectedArtwork.description === 'string' ? selectedArtwork.description : ''}
          name={selectedArtwork.title}
        />

        <div className="grid w-full grid-cols-2 grid-rows-1 gap-x-4 lg:gap-x-6">
          <ArtLinks
            email={email}
            externalLinks={selectedArtwork.mintLink ? [
              { 
                name: 'View on Marketplace', 
                url: selectedArtwork.mintLink 
              }
            ] : []}
            makeOffer={{
              active: false,
              buttonText: ''
            }}
            views={{}}
          />
        </div>

        <div className="flex w-full flex-row items-center justify-between">
          <button
            id="art-info-button"
            type="button"
            onClick={handleToggleAnimation}
            className={cn(
              'art-info-icon-container flex cursor-pointer flex-row items-center gap-x-2 border-b-2 border-transparent pb-1 text-sm transition-all hover:border-white lg:text-base'
            )}
          >
            Art Info
            <span className="art-info-icon h-4 w-4">↓</span>
          </button>

          <button
            type="button"
            onClick={handleToggleDetails}
            className={cn(
              'flex cursor-pointer flex-row items-center gap-x-2 border-b-2 border-transparent pb-1 text-sm transition-all hover:border-white lg:text-base'
            )}
          >
            Details
            <span
              className={cn('h-4 w-4', {
                'rotate-180': showDetails
              })}
            >
              ↓
            </span>
          </button>
        </div>

        <div
          id="art-info"
          className={cn(
            'art-info-container fade-up w-full opacity-0'
          )}
        >
          <ArtworkDetails artwork={selectedArtwork} />
        </div>

        {showDetails && (
          <div className="w-full">
            <ArtworkDetails artwork={selectedArtwork} />
          </div>
        )}
      </div>

      <div className="hidden xl:block w-full">
        <HorizontalInCarousel
          slideIndex={slides.findIndex(slide => slide.id === selectedArtwork.id)}
          onChangeSlideIndex={onChangeToOtherSlide}
          getMoreSlides={handleMoreSlides}
          slides={nftSlides}
        />
      </div>
    </section>
  )
}
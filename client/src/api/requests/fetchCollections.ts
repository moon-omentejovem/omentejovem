'use server'

import tokenMetadata from '../../../public/token-metadata.json'

const THE_CYCLE_COLLECTION = {
  name: 'The Cycle',
  year: '2023',
  slug: 'the3cycle',
  nftImageUrls: [] as string[]
}

const SHAPES_AND_COLORS_COLLECTION = {
  name: 'Shapes & Colors',
  year: '2022',
  slug: 'shapesncolors',
  nftImageUrls: [] as string[]
}

const STORIES_ON_CIRCLES_COLLECTION = {
  name: 'Stories on Circles',
  year: '2025',
  slug: 'storiesoncircles',
  nftImageUrls: [] as string[]
}

export async function fetchCollections() {
  try {
    // Process each NFT and add its image URL to the appropriate collection
    tokenMetadata.forEach((nft) => {
      if (
        nft.contract.address?.toLowerCase() ===
        '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43'.toLowerCase()
      ) {
        THE_CYCLE_COLLECTION.nftImageUrls.push(
          nft.image.pngUrl || nft.image.cachedUrl || nft.image.originalUrl || ''
        )
      }
      if (
        nft.contract.address?.toLowerCase() ===
        '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50'.toLowerCase()
      ) {
        SHAPES_AND_COLORS_COLLECTION.nftImageUrls.push(
          nft.image.pngUrl || nft.image.cachedUrl || nft.image.originalUrl || ''
        )
      }
    })

    // Return collections in the desired order
    return {
      collections: [
        STORIES_ON_CIRCLES_COLLECTION,
        THE_CYCLE_COLLECTION,
        SHAPES_AND_COLORS_COLLECTION
      ]
    }
  } catch (error) {
    console.error('Error in fetchCollections:', error)
    return { collections: [] }
  }
}

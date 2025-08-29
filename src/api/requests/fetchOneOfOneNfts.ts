'use server'

import { NFT, Chain } from '../resolver/types'
import {
  FAKE_TOKENS,
  STORIES_ON_CIRCLES_COLLECTION_ADDRESS
} from '@/utils/constants'
import mintDates from '../../../public/mint-dates.json'
import tokenMetadata from '../../../public/token-metadata.json'
import tezosData from '../../../public/tezos-data.json'

interface MintDate {
  contractAddress: string
  tokenId: string
  mintDate: string
}

export async function fetchOneOfOneNfts() {
  try {
    // Add required fields to all NFTs and ensure all required fields are non-null
    const ethereumNfts = tokenMetadata.map((nft) => ({
      ...nft,
      nft_id: `${nft.contract.address}:${nft.tokenId}`,
      chain: 'ethereum' as Chain,
      contract: {
        ...nft.contract,
        openSeaMetadata: {
          ...nft.contract.openSeaMetadata,
          twitterUsername: nft.contract.openSeaMetadata.twitterUsername || '',
          discordUrl: nft.contract.openSeaMetadata.discordUrl || '',
          externalUrl: nft.contract.openSeaMetadata.externalUrl || ''
        }
      }
    })) as NFT[]

    // Process Tezos NFTs
    const tezosNfts = tezosData
      .filter((nft) => parseInt(nft.contract.totalSupply) === 1) // Only include NFTs with totalSupply === 1
      .map((nft) => ({
        nft_id: `${nft.contract.address}:${nft.tokenId}`,
        chain: 'tezos' as Chain,
        contract: {
          address: nft.contract.address,
          name: nft.contract.name,
          symbol: nft.contract.symbol,
          totalSupply: nft.contract.totalSupply,
          tokenType: nft.contract.tokenType,
          contractDeployer: nft.contract.contractDeployer || '',
          deployedBlockNumber: nft.contract.deployedBlockNumber || 0,
          openSeaMetadata: {
            floorPrice: nft.contract.openSeaMetadata.floorPrice || 0,
            collectionName: nft.contract.openSeaMetadata.collectionName || '',
            collectionSlug: nft.contract.openSeaMetadata.collectionSlug || '',
            safelistRequestStatus:
              nft.contract.openSeaMetadata.safelistRequestStatus || '',
            imageUrl: nft.contract.openSeaMetadata.imageUrl || '',
            description: nft.contract.openSeaMetadata.description || '',
            externalUrl: nft.contract.openSeaMetadata.externalUrl || '',
            twitterUsername: nft.contract.openSeaMetadata.twitterUsername || '',
            discordUrl: nft.contract.openSeaMetadata.discordUrl || '',
            bannerImageUrl: nft.contract.openSeaMetadata.bannerImageUrl || '',
            lastIngestedAt: nft.contract.openSeaMetadata.lastIngestedAt || ''
          },
          isSpam: nft.contract.isSpam || false,
          spamClassifications: nft.contract.spamClassifications || []
        },
        tokenId: nft.tokenId,
        tokenType: nft.tokenType,
        name: nft.name || '',
        description: nft.description || '',
        tokenUri: nft.tokenUri || '',
        image: {
          cachedUrl:
            nft.image.cachedUrl ||
            nft.image.pngUrl ||
            nft.image.originalUrl ||
            '',
          thumbnailUrl:
            nft.image.thumbnailUrl ||
            nft.image.cachedUrl ||
            nft.image.pngUrl ||
            '',
          pngUrl:
            nft.image.pngUrl ||
            nft.image.cachedUrl ||
            nft.image.originalUrl ||
            '',
          contentType: nft.image.contentType || '',
          size: nft.image.size || 0,
          originalUrl:
            nft.image.originalUrl ||
            nft.image.cachedUrl ||
            nft.image.pngUrl ||
            ''
        },
        raw: {
          tokenUri: nft.raw.tokenUri || '',
          metadata: {
            image: nft.raw.metadata.image || '',
            createdBy: nft.raw.metadata.creators?.[0] || '',
            yearCreated: nft.raw.metadata.date
              ? new Date(nft.raw.metadata.date).getFullYear().toString()
              : '',
            name: nft.raw.metadata.name || '',
            description: nft.raw.metadata.description || '',
            media: nft.raw.metadata.formats || [],
            tags: nft.raw.metadata.tags || []
          },
          error: nft.raw.error
        },
        collection: {
          name: nft.collection.name || '',
          slug: nft.collection.slug || '',
          externalUrl: nft.collection.externalUrl || '',
          bannerImageUrl: nft.collection.bannerImageUrl || ''
        },
        mint: {
          mintAddress: nft.mint.mintAddress,
          blockNumber: nft.mint.blockNumber,
          timestamp: nft.mint.timestamp,
          transactionHash: nft.mint.transactionHash
        },
        owners: nft.owners,
        timeLastUpdated: nft.timeLastUpdated
      })) as NFT[]

    console.log('Processing NFTs...')

    // Add fake tokens
    const allNfts = [...ethereumNfts, ...tezosNfts, ...FAKE_TOKENS]

    // Order by mint date newest first
    allNfts.sort((a, b) => {
      let aMintDate = a.contract.address.startsWith('KT')
        ? a.mint.timestamp
        : mintDates.find(
            (mint: MintDate | null) =>
              mint &&
              mint.contractAddress.toLowerCase() ===
                a.contract.address.toLowerCase() &&
              mint.tokenId === a.tokenId
          )?.mintDate

      let bMintDate = b.contract.address.startsWith('KT')
        ? b.mint.timestamp
        : mintDates.find(
            (mint: MintDate | null) =>
              mint &&
              mint.contractAddress.toLowerCase() ===
                b.contract.address.toLowerCase() &&
              mint.tokenId === b.tokenId
          )?.mintDate

      // If it is the fake tokens then get the date from mint.timestamp
      if (a.contract.address === STORIES_ON_CIRCLES_COLLECTION_ADDRESS) {
        aMintDate = a.mint.timestamp || ''
      }

      if (b.contract.address === STORIES_ON_CIRCLES_COLLECTION_ADDRESS) {
        bMintDate = b.mint.timestamp || ''
      }

      if (!aMintDate) return 1
      if (!bMintDate) return -1

      a.mint.timestamp = aMintDate
      b.mint.timestamp = bMintDate

      return new Date(bMintDate).getTime() - new Date(aMintDate).getTime()
    })

    // Only return if contract.type === 'ERC721' or FA2 with totalSupply === 1
    const filteredNfts = allNfts.filter((nft) => {
      if (nft.contract.address.startsWith('KT')) {
        return (
          nft.tokenType === 'FA2' && parseInt(nft.contract.totalSupply) === 1
        )
      }
      return nft.contract.tokenType === 'ERC721'
    })

    return { nfts: filteredNfts }
  } catch (error) {
    console.error('Error in fetchOneOfOneNfts:', error)
    return { nfts: [] }
  }
}

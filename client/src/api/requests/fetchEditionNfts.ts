'use server'

import { NFT, Chain } from '../resolver/types'
import mintDates from '../../../public/mint-dates.json'
import tokenMetadata from '../../../public/token-metadata.json'

interface MintDate {
  contractAddress: string
  tokenId: string
  mintDate: string
}

export async function fetchEditionNfts() {
  try {
    // Add required fields to all NFTs and ensure all required fields are non-null
    const nfts = tokenMetadata.map((nft) => ({
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

    console.log('Processing NFTs...')

    // Order by mint date newest first
    nfts.sort((a, b) => {
      const aMintDate = mintDates.find(
        (mint: MintDate | null) =>
          mint &&
          mint.contractAddress.toLowerCase() ===
            a.contract.address.toLowerCase() &&
          mint.tokenId === a.tokenId
      )?.mintDate

      const bMintDate = mintDates.find(
        (mint: MintDate | null) =>
          mint &&
          mint.contractAddress.toLowerCase() ===
            b.contract.address.toLowerCase() &&
          mint.tokenId === b.tokenId
      )?.mintDate

      if (!aMintDate) return 1
      if (!bMintDate) return -1

      a.mint.timestamp = aMintDate
      b.mint.timestamp = bMintDate

      return new Date(bMintDate).getTime() - new Date(aMintDate).getTime()
    })

    // Only return if contract.type === 'ERC1155'
    const filteredNfts = nfts.filter((nft) => {
      if (nft.contract.address.startsWith('KT')) {
        return nft.tokenType !== 'ERC1155'
      }
      return nft.contract.tokenType === 'ERC1155'
    })

    // Add the chain to the nft
    const finalNfts = filteredNfts.map((nft) => {
      // @ts-ignore
      nft.chain = nft.contract.address.startsWith('KT') ? 'tezos' : 'ethereum'
      return nft
    })

    return { nfts: finalNfts }
  } catch (error) {
    console.error('Error in fetchEditionNfts:', error)
    return { nfts: [] }
  }
}

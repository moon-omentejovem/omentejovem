// Tipos legados mantidos apenas para compatibilidade temporal
// Estes tipos serão removidos quando o refator estiver completo

export type Chain = 'ethereum' | 'tezos'

export interface Owner {
  owner_address: string
  quantity: number
  first_acquired_date: string
  last_acquired_date: string
}

export interface ExternalLink {
  name: string
  url: string
}

export interface NftTransferEvent {
  fromAddress: string
  toAddress: string
  eventDate: string
  eventType: string
  transactionUrl?: string
}

export interface Mint {
  mintAddress: string
  blockNumber: number
  timestamp: string
  transactionHash: string
}

export interface TransferFromAPI {
  batch_transfer_index: number
  block_hash: string
  block_number: number
  chain: string
  collection_id: string
  contract_address: string
  event_type: string
  from_address: string
  log_index: number
  nft_id: string
  quantity: number
  quantity_string: string
  sale_details: null | unknown
  timestamp: string
  to_address: string
  token_id: string
  transaction: string
  transaction_fee: number
  transaction_index: number
  transaction_initiator: string
  transaction_to_address: string
  transaction_value: number
}

export interface NFT {
  nft_id: string
  chain: Chain
  contract: {
    address: string
    name: string
    symbol: string
    totalSupply: string
    tokenType: string
    contractDeployer: string
    deployedBlockNumber: number
    openSeaMetadata: {
      floorPrice: number
      collectionName: string
      collectionSlug: string
      safelistRequestStatus: string
      imageUrl: string
      description: string
      externalUrl: string
      twitterUsername: string
      discordUrl: string
      bannerImageUrl: string
      lastIngestedAt: string
    }
    isSpam: boolean
    spamClassifications: string[]
  }
  tokenId: string
  tokenType: string
  name: string
  description: string
  tokenUri: string
  image: {
    cachedUrl: string
    thumbnailUrl: string
    pngUrl: string
    contentType: string
    size: number
    originalUrl: string
    displayUrl?: string
  }
  raw: {
    tokenUri: string
    metadata: {
      image: string
      createdBy: string
      yearCreated: string
      name: string
      description: string
      media: any[]
      tags: string[]
    }
    error?: any
  }
  collection: {
    name: string
    slug: string
    externalUrl: string
    bannerImageUrl: string
  }
  mint: Mint
  owners: Owner[]
  timeLastUpdated: string
}

// Tipos específicos para componentes
// FirstCreated e Sale foram movidos para artwork.ts

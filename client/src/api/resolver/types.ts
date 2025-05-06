import { HomeImage } from '@/types/home'

export interface NftContractButton {
  label: string
  status: boolean
}

export interface NftOwner {
  address: string
  url: string
}

export interface NftTransferEvent {
  fromAddress: string
  toAddress: string
  eventDate: string
  eventType: string
  transactionUrl?: string
}

export interface ExternalLink {
  name: string
  url: string
}

export interface CollectionRes {
  name: string
  year: string
  slug: string
  nftImageUrls: string[]
}

export interface CollectionsResponse {
  collections: CollectionRes[]
}

export interface HomeData {
  title: string
  subtitle: string
  nfts: HomeImage[]
}

// FROM SIMPLEHASH

export type Chain =
  | 'ethereum'
  | 'polygon'
  | 'solana'
  | 'optimism'
  | 'arbitrum'
  | 'bitcoin'
  | 'arbitrum-nova'
  | 'avalanche'
  | 'base'
  | 'bsc'
  | 'celo'
  | 'flow'
  | 'gnosis'
  | 'godwoken'
  | 'linea'
  | 'loot'
  | 'palm'
  | 'polygon-zkevm'
  | 'scroll'
  | 'zksync-era'
  | 'zora'
  | 'ethereum-goerli'
  | 'ethereum-rinkeby'
  | 'ethereum-sepolia'
  | 'solana-devnet'
  | 'solana-testnet'
  | 'polygon-mumbai'
  | 'arbitrum-goerli'
  | 'avalanche-fuji'
  | 'base-goerli'
  | 'bsc-testnet'
  | 'frame-testnet'
  | 'godwoken-testnet'
  | 'linea-testnet'
  | 'manta-testnet'
  | 'optimism-goerli'
  | 'palm-testnet'
  | 'palm-testnet-edge'
  | 'polygon-zkevm-testnet'
  | 'scroll-testnet'
  | 'scroll-sepolia'
  | 'zksync-era-testnet'
  | 'zora-testnet'

export interface FirstCreated {
  block_number: string
  minted_to: string
  quantity: number
  quantity_string: string
  timestamp: string
  transaction: string
  transaction_initiator: string
}

export interface SaleDetails {
  marketplace_name: string
  is_bundle_sale: boolean
  payment_token: PaymentToken
  unit_price: number
  total_price: number
}

export interface Transfer {
  nft_id: string
  chain: Chain
  contract_address: string
  token_id: null
  from_address?: string
  to_address: string
  quantity: number
  timestamp: string
  block_number: number
  block_hash?: string
  transaction: string
  log_index: number
  batch_transfer_index: number
  sale_details?: SaleDetails
}

export interface PaymentToken {
  payment_token_id: string
  name: string
  symbol: string
  address?: string
  decimals: number
}

export interface Sale {
  from_address?: string
  to_address?: string
  quantity: number
  timestamp: string
  transaction: string
  marketplace_name: string
  is_bundle_sale: boolean
  payment_token: PaymentToken
  unit_price: number
  total_price: number
}

export interface CollectionInfo {
  id: string
  name: string
  description: string
  chain: Chain
}

export interface Owner {
  nft_id?: string
  owner_address: string
  quantity: number
  first_acquired_date: string
  last_acquired_date: string
}

export interface Collection {
  collection_id: string
  name: string
  description: string
  image_url?: string
  banner_image_url?: string
  external_url?: string
  twitter_username?: string
  discord_url?: string
  marketplace_pages: {
    marketplace_name: string
    marketplace_collection_id: string
    collection_url: string
    verified: boolean
  }[]
  metaplex_mint?: string
  metaplex_first_verified_creator?: string
  spam_score: number
  floor_prices: FloorPrice[]
  top_contracts: string[]
}

export interface FloorPrice {
  marketplace_id: string
  value: number
  payment_token: PaymentToken
  value_usd_cents: number
}

export interface TokenQuantity {
  address: string
  quantity: number
  quantity_string: string
  first_acquired_date: string
  last_acquired_date: string
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
      externalUrl: string | null
      twitterUsername: string
      discordUrl: string
      bannerImageUrl: string
      lastIngestedAt: string
    }
    isSpam: boolean
    spamClassifications: any[]
  }
  tokenId: string
  tokenType: string
  name?: string
  description?: string
  tokenUri?: string
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
      media: any
      tags: any[]
    }
    error: null | string
  }
  collection: {
    name: string
    slug: string
    externalUrl: string | null
    bannerImageUrl: string
  }
  mint: Mint
  owners: any | null
  timeLastUpdated: string
}

export interface Mint {
  mintAddress: string | null
  blockNumber: number | null
  timestamp: string | null
  transactionHash: string | null
}

export interface TokenQuantityFungible extends TokenQuantity {
  value_usd_cents: number | null
  value_usd_cents_string: string | null
}

export interface FungiblePrice {
  marketplace_id: string
  marketplace_name: string
  value_usd_cents: number
  value_usd_cents_string: string
}

export interface FungibleToken {
  fungible_id: string
  name: string
  symbol: string
  decimals: number
  chain: Chain
  token_address: string
  prices: FungiblePrice[]
  total_quantity: bigint
  total_quantity_string: string
  total_value_usd_cents: number | null
  total_value_usd_cents_string: string | null
  queried_wallet_balances: TokenQuantityFungible[]
}

export interface FungibleTokenTransfer {
  fungible_id: string
  chain: Chain
  from_address: string
  to_address: string
  quantity: number
  quantity_string: string
  timestamp: string
  block_number: number
  block_hash: string
  transaction_index: number
  log_index: number
  batch_transfer_index: bigint
  transaction_hash: string
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

// FROM SIMPLEHASH

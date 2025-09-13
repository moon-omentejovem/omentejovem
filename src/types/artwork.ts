import type { Database } from './supabase'

// Base Supabase types
export type ArtworkRow = Database['public']['Tables']['artworks']['Row']
export type SeriesRow = Database['public']['Tables']['series']['Row']
export type SeriesArtworkRow =
  Database['public']['Tables']['series_artworks']['Row']

// Extended artwork with series relationship for portfolio display
export interface ArtworkWithSeries extends ArtworkRow {
  /**
   * Optimized image path stored on Supabase (optional while schema evolves)
   */
  image_cached_path?: string | null
  series_artworks: (SeriesArtworkRow & {
    series: SeriesRow
  })[]
}

// Image information for artwork display
export interface ArtworkImage {
  /**
   * Primary image URL for display (cached or original)
   */
  url: string
  /**
   * Original image URL from source (OpenSea, etc.)
   */
  originalUrl: string
  /**
   * Cached/optimized version URL
   */
  cachedUrl?: string
  /**
   * Thumbnail URL for previews
   */
  thumbnailUrl?: string
}

// Main artwork type for frontend (using Supabase as source of truth)
export type Artwork = ArtworkWithSeries

// Simple external link interface (Backend-Oriented approach)
export interface ExternalLink {
  name: string
  url: string
}

// Owner information (simplified from legacy NFT system)
export interface Owner {
  owner_address: string
  quantity: number
  first_acquired_date: string
  last_acquired_date: string
}

// Chain types for NFT data
export type Chain = 'ethereum' | 'tezos'

// Mint information from blockchain
export interface Mint {
  mintAddress: string
  blockNumber: number
  timestamp: string
  transactionHash: string
}

// Transfer information (for future backend implementation)
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

// Additional types for component compatibility
export interface NftTransferEvent {
  fromAddress: string
  toAddress: string
  eventDate: string
  eventType: string
  transactionUrl?: string
}

export type FirstCreated = Mint
export type Sale = TransferFromAPI

// Types for future API integration (NFT ownership and transfers)
// These will be populated when the external NFT API is implemented

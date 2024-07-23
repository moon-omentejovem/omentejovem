'use client'

import { NftArt } from '@/api/resolver/types'

export interface ChainedFilter {
  label: string
  filterApply?: (nft: NftArt) => boolean
  sortApply?: SortOption
  children?: ChainedFilter[]
}

export interface SortOption {
  key: keyof NftArt
  option: 'asc' | 'desc'
}

const filters: ChainedFilter[] = [
  {
    label: 'minted',
    filterApply: (n) => !!n.mintedDate,
    children: [
      {
        label: 'eth',
        filterApply: (n) => n.nftChain == 'ethereum',
        children: []
      },
      {
        label: 'xtz',
        filterApply: (n) => n.nftChain == 'tezos',
        children: [
          {
            label: 'year',
            sortApply: {
              key: 'createdAt',
              option: 'desc'
            }
          }
        ]
      }
    ]
  },
  {
    label: 'non minted',
    filterApply: (n) => !n.mintedDate,
    children: [
      {
        label: 'eth',
        filterApply: (n) => n.nftChain == 'ethereum',
        children: []
      },
      {
        label: 'xtz',
        filterApply: (n) => n.nftChain == 'tezos',
        children: [
          {
            label: 'year',
            sortApply: {
              key: 'createdAt',
              option: 'desc'
            }
          }
        ]
      }
    ]
  }
]

export default filters

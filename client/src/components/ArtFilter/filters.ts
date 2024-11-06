'use client'

import { NFT } from '@/api/resolver/types'
import {
  MANIFOLD_NFTS,
  POAP_NFTS,
  RARIBLE_NFTS,
  SUPERRARE_NFTS,
  TRANSIENT_NFTS
} from '@/utils/constants'

export interface ChainedFilter {
  label?: string
  filterApply?: (nft: NFT) => boolean
  sortApply?: SortOption
  children: ChainedFilter[]
  inPlace?: boolean
}

export interface SortOption {
  key: keyof NFT
  option: 'asc' | 'desc'
}

export function getLastFilterHistoryParent(
  filterHistory: ChainedFilter[]
): ChainedFilter {
  if (filterHistory.length === 0) {
    throw new Error('Filter history cannot be empty')
  }

  for (let i = filterHistory.length - 1; i >= 0; i--) {
    if (filterHistory[i].children.length > 0) {
      return filterHistory[i]
    }
  }
  return filterHistory[filterHistory.length - 1] // Return last filter if none have children
}

function extractYearFromISO(dateString: string): number {
  const date = new Date(dateString)
  return date.getFullYear()
}
function getNftYearFilter(year: number) {
  return (n: NFT) => {
    return new Date(n.created_date ?? '').getFullYear() === year
  }
}

const latestFilter: ChainedFilter = {
  label: 'latest',
  sortApply: {
    key: 'created_date',
    option: 'desc'
  },
  children: []
}

const availableFilter: ChainedFilter = {
  label: 'available',
  filterApply: (n) => true, // todo n.available_purchase != null,
  inPlace: true,
  children: []
}

const ethContractFilter: ChainedFilter = {
  label: 'contract',
  children: [
    {
      label: 'manifold',
      inPlace: true,
      filterApply: (n) =>
        MANIFOLD_NFTS.map((nft) => nft.toLowerCase()).includes(
          n.contract_address?.toLowerCase() ?? ''
        ),
      children: []
    },
    {
      label: 'transient labs',
      inPlace: true,
      filterApply: (n) =>
        TRANSIENT_NFTS.map((nft) => nft.toLowerCase()).includes(
          n.contract_address?.toLowerCase() ?? ''
        ),
      children: []
    },
    {
      label: 'superrare',
      inPlace: true,
      filterApply: (n) =>
        SUPERRARE_NFTS.map((nft) => nft.toLowerCase()).includes(
          n.contract_address?.toLowerCase() ?? ''
        ),
      children: []
    },
    {
      label: 'opensea',
      inPlace: true,
      filterApply: (n) =>
        POAP_NFTS.map((nft) => nft.toLowerCase()).includes(
          n.contract_address?.toLowerCase() ?? ''
        ),
      children: []
    },
    {
      label: 'rarible',
      inPlace: true,
      filterApply: (n) =>
        RARIBLE_NFTS.map((nft) => nft.toLowerCase()).includes(
          n.contract_address?.toLowerCase() ?? ''
        ),
      children: []
    }
  ]
}

const xtzContractFilter: ChainedFilter = {
  label: 'contract',
  children: [
    {
      label: 'hen',
      inPlace: true,
      filterApply: (n) => true, //  n.availablePurchase?.text === 'Hen',
      children: []
    },
    {
      label: 'objkt',
      inPlace: true,
      filterApply: (n) => true, //  n.availablePurchase?.text === 'objkt Labs',
      children: []
    },
    {
      label: 'objkt.one',
      inPlace: true,
      filterApply: (n) => true, //  n.availablePurchase?.text === 'objkt.one',
      children: []
    }
  ]
}

const yearFilter: ChainedFilter = {
  label: 'year',
  children: [
    {
      label: '2024',
      filterApply: getNftYearFilter(2024),
      inPlace: true,
      children: []
    },
    {
      label: '2023',
      filterApply: getNftYearFilter(2023),
      inPlace: true,
      children: []
    },
    {
      label: '2022',
      filterApply: getNftYearFilter(2022),
      inPlace: true,
      children: []
    },
    {
      label: '2021',
      filterApply: getNftYearFilter(2021),
      inPlace: true,
      children: []
    }
  ]
}

const filters: ChainedFilter[] = [
  {
    children: [
      {
        label: 'minted',
        filterApply: (n) => !!n.created_date,
        children: [
          {
            label: 'eth',
            filterApply: (n) => n.chain.toLowerCase() === 'ethereum',
            children: [
              latestFilter,
              availableFilter,
              ethContractFilter,
              yearFilter
            ]
          }
          // {
          //   label: 'xtz',
          //   filterApply: (n) => n.chain.toLowerCase() === 'tezos',
          //   children: [
          //     latestFilter,
          //     availableFilter,
          //     xtzContractFilter,
          //     yearFilter
          //   ]
          // }
        ]
      }
      // {
      //   label: 'non minted',
      //   filterApply: (n) => !n.created_date,
      //   children: [latestFilter, availableFilter, yearFilter]
      // }
    ]
  }
]

export default filters

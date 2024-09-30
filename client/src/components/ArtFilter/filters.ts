'use client'

import { NftArt } from '@/api/resolver/types'

export interface ChainedFilter {
  label?: string
  filterApply?: (nft: NftArt) => boolean
  sortApply?: SortOption
  children: ChainedFilter[]
  inPlace?: boolean
}

export interface SortOption {
  key: keyof NftArt
  option: 'asc' | 'desc'
}

export function getLastFilterHistoryParent(filterHistory: ChainedFilter[]): ChainedFilter {
  if (filterHistory.length > 1) {
    for (let i = filterHistory.length - 1; i > 0; i--) {
      if (filterHistory[i].children.length > 0) {
        return filterHistory[i]
      }
    }
  }
  return filterHistory[0]
}

function extractYearFromISO(dateString: string): number {
  const date = new Date(dateString);
  return date.getFullYear();
}
function getNftYearFilter(year: number) {
  return (n: NftArt) => extractYearFromISO(n.mintedEvent?.eventDate ?? n.createdAt) === year;
}

const latestFilter: ChainedFilter = {
  label: "latest",
  sortApply: {
    key: 'createdAt',
    option: 'desc'
  },
  children: []
};

const availableFilter: ChainedFilter = {
  label: "available",
  filterApply: (n) => n.availablePurchase != null,
  inPlace: true,
  children: []
};

const ethContractFilter: ChainedFilter = {
  label: "contract",
  children: [
    { label: "manifold", inPlace: true, filterApply: (n) => n.availablePurchase?.text === "Manifold", children: [] },
    { label: "transient labs", inPlace: true, filterApply: (n) => n.availablePurchase?.text === "Transient Labs", children: [] },
    { label: "superrare", inPlace: true, filterApply: (n) => n.availablePurchase?.text === "SuperRare", children: [] },
    { label: "opensea", inPlace: true, filterApply: (n) => n.availablePurchase?.text === "OpenSea", children: [] },
    { label: "rarible", inPlace: true, filterApply: (n) => n.availablePurchase?.text === "Rarible", children: [] }
  ]
};

const xtzContractFilter: ChainedFilter = {
  label: "contract",
  children: [
    { label: "hen", inPlace: true, filterApply: (n) => n.availablePurchase?.text === "Hen", children: [] },
    { label: "objkt", inPlace: true, filterApply: (n) => n.availablePurchase?.text === "objkt Labs", children: [] },
    { label: "objkt.one", inPlace: true, filterApply: (n) => n.availablePurchase?.text === "objkt.one", children: [] }
  ]
};

const yearFilter: ChainedFilter = {
  label: "year",
  children: [
    { label: "2024", filterApply: getNftYearFilter(2024), inPlace: true, children: [] },
    { label: "2023", filterApply: getNftYearFilter(2023), inPlace: true, children: [] },
    { label: "2022", filterApply: getNftYearFilter(2022), inPlace: true, children: [] },
    { label: "2021", filterApply: getNftYearFilter(2021), inPlace: true, children: [] }
  ]
};

const filters: ChainedFilter[] = [
  {
    children: [
      {
        label: 'minted',
        filterApply: (n) => !!n.mintedDate,
        children: [
          {
            label: 'eth',
            filterApply: (n) => n.nftChain === 'Ethereum',
            children: [
              latestFilter,
              availableFilter,
              ethContractFilter,
              yearFilter
            ]
          },
          {
            label: 'xtz',
            filterApply: (n) => n.nftChain == 'Tezos',
            children: [
              latestFilter,
              availableFilter,
              xtzContractFilter,
              yearFilter
            ]
          }
        ]
      },
      {
        label: 'non minted',
        filterApply: (n) => !n.mintedDate,
        children: [
          latestFilter,
          availableFilter,
          yearFilter
        ]
      },
    ]
  }
]

export default filters

import { Artwork } from '@/types/artwork'

export const COLLECTION_NFTS = [
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:5',
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:6',
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:4',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:1',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:2',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:3',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:4',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:5',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:6',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:7',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:8',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:9',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:10'
]

export const STORIES_ON_CIRCLES_COLLECTION_ADDRESS =
  '0xDE3229D33cB8513ffb717f870efd71c0C5ddbcF7'

export const STORIES_ON_CIRCLES_SLUG = 'storiesoncircles'

export const FAKE_TOKENS: Artwork[] = []

export const ALL_NFTS = async () => {
  try {
    const response = await fetch(
      `${process.env.VERCEL_URL || 'http://localhost:3000'}/nfts.json`
    )
    const data = await response.json()
    return data.nfts
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return ['0xfda33af4770d844dc18d8788c7bf84accfac79ad:14']
  }
}

export const MANIFOLD_NFTS = [
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c',
  '0xe70659b717112ac4e14284d0db2f5d5703df8e43'
]
export const TRANSIENT_NFTS = ['0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43']
export const SUPERRARE_NFTS = ['0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0']
export const POAP_NFTS = ['0x22c1f6050e56d2876009903609a2cc3fef83b415']
export const GRAILS_NFTS = ['0x92a50fe6ede411bd26e171b97472e24d245349b8']
export const RARIBLE_NFTS = ['0x60f80121c31a0d46b5279700f9df786054aa5ee5']
export const OPEN_SEA_NFTS = ['0x495f947276749ce646f68ac8c248420045cb7b5e']

export const OVERRIDE_EXTERNAL_LINKS: Record<
  string,
  { name: string; link: string }
> = {
  '0xe70659b717112ac4e14284d0db2f5d5703df8e43:343': {
    name: 'pepe.wtf',
    link: 'https://pepe.wtf/asset/omentepepe'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:14': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/we-always-find-a-way/'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:15': {
    name: 'SuperRare',
    link: 'https://superrare.com/artwork/eth/0xfdA33af4770D844DC18D8788C7Bf84accfac79aD/15'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:13': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/my-desires/'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:12': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/between-the-sun-and-moon/'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:11': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/ups-and-downs/'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:11': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/11'
  },
  '0x92a50fe6ede411bd26e171b97472e24d245349b8': {
    name: 'Grails',
    link: 'https://www.proof.xyz/grails/season-5/a-black-dot-with-a-white-dot-on-a-green-background'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:10': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/10'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:8': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/cheap-problems/'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:9': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/9'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:6': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/6-dots/'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:5': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/musician-at-ipanemas-beach/'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:8': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/8'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:4': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/the-search/'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:7': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/7'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:10': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/10'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:9': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/9'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:8': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/8'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:7': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/7'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:6': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/6'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:5': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/5'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:4': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/4'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:3': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/3'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:2': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/2'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:1': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/1'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:5': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/5'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:4': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/4'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:3': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/3'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:2': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/2'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:1': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/1'
  },
  '0x60f80121c31a0d46b5279700f9df786054aa5ee5:19434': {
    name: 'Rarible',
    link: 'https://rarible.com/token/0x60f80121c31a0d46b5279700f9df786054aa5ee5:19434'
  }
}

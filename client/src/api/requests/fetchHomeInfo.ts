'use server'

export const dynamic = 'force-dynamic'

import { HomeData, NFT } from '../resolver/types'
import { api } from '../client'

const ALL_NFTS = [
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:5',
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:6',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:13',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:12',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:11',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:10',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:9',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:5',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:2',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:1',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:10',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:6',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:5',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:4',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:3',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:2',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:1',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:11',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:10',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:9',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:5',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:8',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:7',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:6',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:4',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:2',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:19626',
  'KT1NvaAU5oqfvhBcapnE9BbSiWHNVVnKjmHB:13',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:135137',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:135200',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:476826',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:510906',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:39205',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:38031',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:37442',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:37138',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:36750',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:36350',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:35923',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:35595',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:33475',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:33228',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:32201',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:31463',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:30838',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:48623',
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:4',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:14',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:8',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:7',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:6',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:4',
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:3',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:44262',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:29364',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:28486',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:9',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:8',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:27843',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:7',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:27513',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:26074',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:23026',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:17115',
  '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0:44198',
  '0x22c1f6050e56d2876009903609a2cc3fef83b415:4310017',
  '0x92a50fe6ede411bd26e171b97472e24d245349b8:206',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:3',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:1',
  '0x60f80121c31a0d46b5279700f9df786054aa5ee5:19434',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:240867',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:448564',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:135181'
]

export async function fetchHomeInfo() {
  // Pick 3 random from ALL_NFTS that start with 0x
  const randomNfts = ALL_NFTS.filter((nft) => nft.startsWith('0x'))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  const formattedQuery = randomNfts
    .map((nft) => {
      const tokenAddress = nft.split(':')[0]
      const tokenId = nft.split(':')[1]
      return `ethereum.${tokenAddress}.${tokenId}`
    })
    .filter((nft) => nft !== '')
    .join(',')

  const data = await fetch(`${api.baseURL}?nft_ids=${formattedQuery}`, {
    method: 'GET',
    headers: {
      'X-API-KEY': api.apiKey || '',
      Accept: 'application/json'
    }
  })

  const jsonData = (await data.json()) as { nfts: NFT[] }

  const formattedNfts = jsonData.nfts.map((nft) => ({
    title: nft.name,
    createdAt: nft.created_date?.toString() || '',
    imageUrl: nft.image_url
  }))

  return {
    title: 'Thales Machado',
    subtitle: 'omentejovem',
    nfts: formattedNfts
  } as HomeData
}

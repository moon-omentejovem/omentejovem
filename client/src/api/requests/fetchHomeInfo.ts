'use server'

import { HomeData } from '../resolver/types'

export async function fetchHomeInfo() {
  return {
    title: 'Thales Machado',
    subtitle: 'omentejovem',
    nfts: [
      {
        title: 'The Flower',
        createdAt: '2023-10-17T02:39:35Z',
        imageUrl:
          'https://d35fci5byogucz.cloudfront.net/66faecd4fa218d744f6a536a/resized_1280_the-flower.jpeg'
      },
      {
        title: 'The Seed',
        createdAt: '2023-10-17T02:43:11Z',
        imageUrl:
          'https://d35fci5byogucz.cloudfront.net/66faed51fa218d744f6a536e/resized_1280_the-seed.jpeg'
      },
      {
        title: 'My Desires Take Me Places My Eclipse Can’t',
        createdAt: '2024-07-30T15:16:35Z',
        imageUrl:
          'https://d35fci5byogucz.cloudfront.net/66faed66fa218d744f6a5371/resized_1280_my-desires-take-me-places-my-eclipse-can’t.jpeg'
      }
    ]
  } as HomeData
}

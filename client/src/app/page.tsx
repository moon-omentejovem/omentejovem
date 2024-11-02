'use client'

import { fetchHomeInfo } from '@/api/requests/fetchHomeInfo'
import HomeContent from './home/content'

export default async function Home() {
  const data = await fetchHomeInfo()

  return <HomeContent data={data} />
}

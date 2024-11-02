import { fetchHomeInfo } from '@/api/requests/fetchHomeInfo'
import HomeContent from './home/content'

// Disable caching - fetch fresh data on every request
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const data = await fetchHomeInfo()

  return <HomeContent data={data} />
}

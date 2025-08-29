import { fetchHomeInfo } from '@/api/requests/fetchHomeInfo'
import HomeContent from './home/content'
import { cookies } from 'next/headers'
import NewsletterPage from './newsletter/page'

// Disable caching - fetch fresh data on every request
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const data = await fetchHomeInfo()
  const closeNewsletter = cookies().get('newsletter_dismissed')

  if (closeNewsletter) {
    return <HomeContent data={data} />
  }

  console.log('closeNewsletter', closeNewsletter)

  return (
    <div className="fixed sm:z-50 bg-background w-full h-full max-w-[1920px]">
      <NewsletterPage />
      <HomeContent data={data} />
    </div>
  )
}

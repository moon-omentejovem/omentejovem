import { HomeData } from '@/api/resolver/types'
import type { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/server'
import HomeContent from './content'

type Artwork = Database['public']['Tables']['artworks']['Row']

async function getHomeData() {
  const supabase = await createClient()

  // Get featured artworks for home page
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('is_featured', true)
    .order('posted_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching home data:', error)
  }

  // Convert to HomeData format
  const homeData: HomeData = {
    title: 'Thales Machado',
    subtitle: 'omentejovem',
    nfts: (artworks || []).map((artwork: Artwork) => ({
      title: artwork.title || '',
      imageUrl: artwork.image_url || '',
      createdAt: artwork.created_at || new Date().toISOString()
    }))
  }

  return { homeData, error }
}

export default async function HomePage() {
  const { homeData, error } = await getHomeData()

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Home</h1>
          <p className="text-neutral-400">{error.message}</p>
        </div>
      </div>
    )
  }

  return <HomeContent data={homeData} />
}

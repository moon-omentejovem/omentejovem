import { createClient } from '@/utils/supabase/server'
import { AboutData, PressTalk } from './@types/wordpress'
import { AboutContent } from './content'

interface AboutPageData {
  id: string
  content: any
  socials?: Array<{
    platform: string
    handle: string
    url: string
  }>
  exhibitions?: Array<{
    title: string
    venue: string
    location: string
    year: string
    type: 'solo' | 'group' | 'online'
    description?: string
  }>
  press?: Array<{
    title: string
    publication: string
    date: string
    url?: string
    type: 'feature' | 'interview' | 'review' | 'news'
  }>
  created_at: string | null
  updated_at: string | null
}

async function getAboutData() {
  const supabase = await createClient()

  try {
    // Fetch about page data from Supabase
    const { data: aboutPageData, error } = await supabase
      .from('about_page')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const typedAboutPageData = aboutPageData as AboutPageData | null

    // Transform database data to expected format
    const aboutData: AboutData = {
      title: 'Thales Machado',
      subtitle: 'omentejovem',
      subtitle_art: '',
      bio: '', // Will be handled in content component
      social_media: {
        twitter: '',
        instagram: '',
        aotm: '',
        superrare: '',
        foundation: '',
        opensea: '',
        objkt: ''
      },
      contact: {
        'e-mail': 'contact@omentejovem.com'
      }
    }

    // Transform socials from database format
    if (typedAboutPageData?.socials && Array.isArray(typedAboutPageData.socials)) {
      typedAboutPageData.socials.forEach((social) => {
        const platform = social.platform?.toLowerCase()
        if (platform && aboutData.social_media.hasOwnProperty(platform)) {
          (aboutData.social_media as any)[platform] = social.url
        }
      })
    }

    // Transform press to PressTalk format
    const press: PressTalk[] = typedAboutPageData?.press?.map((pressItem) => ({
      title: {
        rendered: pressItem.title
      },
      acf: {
        link: pressItem.url || '#'
      }
    })) || []

    // Transform exhibitions to PressTalk format
    const exhibitions: PressTalk[] = typedAboutPageData?.exhibitions?.map((exhibition) => ({
      title: {
        rendered: `${exhibition.title} - ${exhibition.venue} (${exhibition.year})`
      },
      acf: {
        link: '#'
      }
    })) || []

    return {
      aboutData,
      aboutPageData: typedAboutPageData,
      press,
      exhibitions,
      error: null
    }
  } catch (error) {
    console.error('Error fetching about data:', error)
    
    // Fallback to static data if database fails
    const aboutData: AboutData = {
      title: 'Thales Machado',
      subtitle: 'omentejovem',
      subtitle_art: '',
      bio: '',
      social_media: {
        twitter: 'https://twitter.com/omentejovem',
        instagram: 'https://instagram.com/omentejovem',
        aotm: 'https://aotm.gallery/artist/omentejovem',
        superrare: 'https://superrare.com/omentejovem',
        foundation: 'https://foundation.app/@omentejovem',
        opensea: 'https://opensea.io/omentejovem',
        objkt: 'https://objkt.com/@omentejovem'
      },
      contact: {
        'e-mail': 'contact@omentejovem.com'
      }
    }

    return {
      aboutData,
      aboutPageData: null,
      press: [],
      exhibitions: [],
      error: null // Don't show error to user, just use fallback
    }
  }
}

export default async function AboutPage() {
  const { aboutData, aboutPageData, press, exhibitions, error } = await getAboutData()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading About</h1>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <AboutContent 
      data={aboutData} 
      aboutPageData={aboutPageData}
      press={press} 
      exhibitions={exhibitions} 
    />
  )
}

import { createClient } from '@/utils/supabase/server'
import { AboutData, PressTalk } from './@types/wordpress'
import { AboutContent } from './content'

async function getAboutData() {
  const supabase = await createClient()

  // For now, we'll use static data since we don't have WordPress integration
  // In the future, this could be fetched from a CMS or stored in Supabase

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

  const press: PressTalk[] = []
  const exhibitions: PressTalk[] = []

  return {
    aboutData,
    press,
    exhibitions,
    error: null
  }
}

export default async function AboutPage() {
  const { aboutData, press, exhibitions, error } = await getAboutData()

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading About</h1>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <AboutContent data={aboutData} press={press} exhibitions={exhibitions} />
  )
}

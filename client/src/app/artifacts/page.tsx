import { AboutContent } from './content'
import { AboutData } from './@types/wordpress'

async function requestGetAboutInfo() {
  try {
    const data = {
      title: 'omentejovem',
      subtitle: '',
      subtitle_art: '',
      bio: '',
      social_media: {
        twitter: 'https://x.com/omentejovem',
        instagram: 'https://www.instagram.com/omentejovem',
        aotm: 'https://aotm.gallery/artist/omentejovem',
        superrare: 'https://superrare.com/omentejovem',
        foundation: 'https://foundation.app/@omentejovem',
        opensea: 'https://opensea.io/omentejovem',
        objkt: 'https://objkt.com/@omentejovem'
      },
      contact: {
        'e-mail': 'moon@omentejovem.com'
      }
    } as AboutData

    return {
      ...data,
      talks: [],
      press: [],
      exhibitions: []
    }
  } catch (error) {
    console.log('#ERROR:', error)
  }
}

export default async function About() {
  const data = await requestGetAboutInfo()

  return (
    <AboutContent
      data={data}
      press={data?.press ?? []}
      talks={data?.talks ?? []}
      exhibitions={data?.exhibitions ?? []}
    />
  )
}

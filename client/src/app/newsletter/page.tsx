import { Newsletter } from './content'
import { AboutData } from './@types/wordpress'

async function requestGetAboutInfo() {
  try {
    const data = {
      title: '',
      subtitle: '',
      subtitle_art: '',
      bio: '',
      social_media: {
        twitter: 'string',
        instagram: 'string',
        aotm: 'string',
        superrare: 'string',
        foundation: 'string',
        opensea: 'string',
        objkt: 'string'
      },
      contact: {
        'e-mail': ''
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

export default async function NewsletterPage() {
  const data = await requestGetAboutInfo()

  return (
    <Newsletter
      data={data}
      press={data?.press ?? []}
      talks={data?.talks ?? []}
      exhibitions={data?.exhibitions ?? []}
    />
  )
}

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
      press: [
        {
          title: {
            rendered:
              "The Cycles of Creation: 'Ups and Downs' and the Art of Embracing Change"
          },
          acf: {
            link: 'https://aotm.gallery/the-cycles-of-creation-omentejovems-ups-and-downs-and-the-art-of-embracing-change/'
          }
        },
        {
          title: {
            rendered: "Exploring omentejovem's Poignant Perspective"
          },
          acf: {
            link: 'https://aotm.gallery/abstract-visuals-concrete-truths-exploring-omentejovems-poignant-perspective/'
          }
        },
        {
          title: {
            rendered: "omentejovem's Interview"
          },
          acf: {
            link: 'https://www.dalosdov.com/writing/omentejovem-interview'
          }
        },
        {
          title: {
            rendered: 'World of WEB3 Summit (Dubai)'
          },
          acf: {
            link: 'https://superrare.com/features'
          }
        },
        {
          title: {
            rendered: 'Exhibition in honor of Hispanic Heritage Month'
          },
          acf: {
            link: 'https://x.com/crypt_gallery/status/1709610052716282185'
          }
        }
      ],
      exhibitions: [
        {
          title: {
            rendered: 'Omente Orange Exhibition (2022)'
          },
          acf: {
            link: 'https://oncyber.io/spaces/piAkYMyCUXm6DGrTAH5U?coords=-6.90x2.90x15.31x-3.11'
          }
        },
        {
          title: {
            rendered: 'The Day I Found Out'
          },
          acf: {
            link: 'https://oncyber.io/omentejovemaotm'
          }
        },
        {
          title: {
            rendered: 'Des/Conectados'
          },
          acf: {
            link: 'https://oncyber.io/desconectados'
          }
        }
      ]
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
      exhibitions={data?.exhibitions ?? []}
    />
  )
}

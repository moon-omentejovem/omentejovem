'use client'

import Image from 'next/image'
import type { ReactElement } from 'react'
import { AboutData, PressTalk } from './@types/wordpress'

import { aboutAnimations } from '@/animations'
import { FooterProperties } from '@/components/Footer'
import { decodeRenderedString } from '@/utils/decodeRenderedString'
import { useCallback, useEffect, useMemo, useState } from 'react'

import parse from 'html-react-parser'
import './style.css'
import { fetchHomeInfo } from '@/api/requests/fetchHomeInfo'
import Cookies from 'js-cookie'

const KIT_API_KEY = 'kit_af59c54039b362cacce7f0f13aec4b6f'

interface AboutContentProperties {
  data: AboutData | undefined
  talks: PressTalk[]
  press: PressTalk[]
  exhibitions: PressTalk[]
}

interface SubscriberData {
  email_address: string
  state: 'active'
  fields?: {
    // Add any custom fields you want to collect
    Source?: string
  }
}

function AboutBio({ text }: { text: string }): ReactElement {
  return (
    <>
      <div id="bio-content" className="bio">
        {parse(text)}
      </div>
      <br />
    </>
  )
}

async function fetchRandomImages() {
  const data = await fetchHomeInfo()
  // Assuming the data contains an images array
  return data.nfts.map((nft) => nft.imageUrl)
}

function ImageBanner(): ReactElement {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    const loadImages = async () => {
      const randomImages = await fetchRandomImages()
      setImages(randomImages)
    }
    loadImages()
  }, [])

  return (
    <div className="fixed left-0 top-0 h-full flex flex-col justify-center">
      {images.map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={`Banner image ${index + 1}`}
          width={200}
          height={200}
          className="object-cover"
        />
      ))}
    </div>
  )
}

export function Newsletter({
  data,
  talks,
  press,
  exhibitions
}: AboutContentProperties): ReactElement {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    // Check for existing cookie on component mount
    const hasUserDismissed = Cookies.get('newsletter_dismissed')
    if (hasUserDismissed) {
      setIsHidden(true)
    }
  }, [])

  const handleDismiss = () => {
    // Set cookie for 7 days
    Cookies.set('newsletter_dismissed', 'true', { expires: 7 })
    setIsHidden(true)
  }

  const handleSubmit = async () => {
    if (isValidEmail) {
      try {
        const subscriberData: SubscriberData = {
          email_address: email,
          state: 'active',
          fields: {
            Source: 'newsletter page'
          }
        }

        const response = await fetch('https://api.kit.com/v4/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Kit-Api-Key': KIT_API_KEY
          },
          body: JSON.stringify(subscriberData)
        })

        if (!response.ok) {
          throw new Error('Failed to subscribe')
        }

        setIsSubmitted(true)
        setEmail('')
        handleDismiss()

        // refresh page
        window.location.reload()

        setTimeout(() => {
          setIsSubmitted(false)
        }, 3000)
      } catch (error) {
        console.error('Error subscribing:', error)
        // You might want to add error state handling here
      }
    }
  }

  useEffect(() => {
    aboutAnimations()
  }, [])

  const parsedTalks = useMemo<FooterProperties['talks']>(
    () =>
      talks.map((talk) => ({
        talkName: decodeRenderedString(talk.title.rendered),
        talkUrl: talk.acf.link
      })),
    []
  )

  const parsedPress = useMemo<FooterProperties['interviews']>(
    () =>
      press.map((interview) => ({
        interviewName: decodeRenderedString(interview.title.rendered),
        interviewUrl: interview.acf.link
      })),
    []
  )

  const parsedExhibitions = useMemo<FooterProperties['exhibitions']>(
    () =>
      exhibitions.map((exhibition) => ({
        exhibitionName: decodeRenderedString(exhibition.title.rendered),
        exhibitionUrl: exhibition.acf.link
      })),
    []
  )

  const renderAboutInfo = useCallback((aboutString: string): ReactElement => {
    return <AboutBio key={'about-bio'} text={aboutString} />
  }, [])

  useEffect(() => {
    const anchorElements = document.getElementsByTagName(
      'a'
    ) as HTMLCollectionOf<HTMLAnchorElement>
    const parsedElements = [...anchorElements]

    const filtered = parsedElements.filter(
      (element) => element.className === '' || element.id === 'image-reference'
    )

    for (const element of filtered) {
      element.id = `image-reference-${element.innerText}`
      element.className = 'bio-link'
      element.setAttribute('target', '_blank')

      const overlayImage = document.createElement('img')
      overlayImage.classList.add('overlay-image')
      overlayImage.src = element.href
      overlayImage.alt = ''
      overlayImage.style.minWidth = '500px'
      overlayImage.style.maxWidth = '500px'
      overlayImage.style.position = 'absolute'

      document.getElementById('about-page')?.appendChild(overlayImage)

      element.addEventListener('mouseover', () => {
        overlayImage.style.display = 'block'
      })

      element.addEventListener('mouseout', () => {
        overlayImage.style.display = 'none'
      })

      element.addEventListener('mousemove', (event) => {
        const parentRect = document
          .getElementById('about-page')
          ?.getBoundingClientRect()

        if (parentRect) {
          const headerHeight = 104

          const x = event.clientX - parentRect.left - overlayImage.width / 2
          const y =
            event.clientY -
            parentRect.top +
            headerHeight -
            overlayImage.height / 2
          overlayImage.style.transform = `translate(${x}px, ${y}px)`
        }
      })
    }
  }, [])

  return (
    <div className="relative">
      <ImageBanner />
      <main
        id="about-page"
        className="fixed left-[20%] top-0 h-full w-full flex flex-col bg-background justify-center"
      >
        <div className="flex flex-col items-start max-w-3xl ml-[10vw]">
          <h1
            id="newsletter-title"
            className="mb-8 text-[5vw] leading-none overflow-hidden xl:mb-16 text-left"
          >
            <span className="block text-base text-gray-500">NEWSLETTER</span>
            <span className="block text-primary-100 text-4xl">omentejovem</span>
          </h1>

          <div className="mb-24 flex flex-col gap-8 max-w-md">
            <p className="text-base text-secondary-100">
              Receive exclusive insights on new art drops, collaborations,
              exhibitions, and upcoming talks from OMENTEJOVEM. Enter your email
              to connect with the vision and evolution behind the art.
            </p>

            <div className="relative w-[50vw] max-w-2xl">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email here"
                className="w-full text-4xl bg-transparent border-b border-secondary-100 text-secondary-100 placeholder-secondary-100/50 outline-none pr-14"
              />
              {isValidEmail && !isSubmitted && (
                <button
                  onClick={handleSubmit}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bottom-auto bg-primary-100 rounded-lg w-12 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <span className="text-white text-lg">→</span>
                </button>
              )}
              {isSubmitted && (
                <div className="absolute -bottom-8 left-0 text-green-500">
                  Thank you for subscribing!
                </div>
              )}

              <button
                onClick={handleDismiss}
                className="mt-16 mx-auto px-4 py-2 border border-gray-400 rounded-lg text-secondary-100 hover:bg-gray-100/10 transition-colors"
              >
                {isSubmitted ? 'Close' : 'Not now'}
              </button>
            </div>
          </div>

          <hr className="bg-secondary-100 w-full" />
        </div>
      </main>
    </div>
  )
}

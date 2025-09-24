'use client'

import Image from 'next/image'
import type { ReactElement } from 'react'

import { aboutAnimations } from '@/animations/client'
import { AboutArt } from '@/assets/images'
import { Footer, FooterProperties } from '@/components/Footer'
import { useEffect, useMemo } from 'react'

import { BioRenderer } from './bio-renderer'
import './style.css'

interface AboutPageData {
  id: string
  content: any
  socials: Array<{
    platform: string
    handle: string
    url: string
  }>
  exhibitions: Array<{
    title: string
    venue: string
    location: string
    year: string
    type: 'solo' | 'group' | 'online'
    description?: string
  }>
  press: Array<{
    title: string
    publication: string
    date: string
    url?: string
    type: 'feature' | 'interview' | 'review' | 'news'
  }>
  created_at: string | null
  updated_at: string | null
}

interface AboutContentProperties {
  aboutPageData?: AboutPageData | null
}

export function AboutContent({
  aboutPageData
}: AboutContentProperties): ReactElement {
  useEffect(() => {
    aboutAnimations()
  }, [])

  const parsedPress = useMemo<FooterProperties['interviews']>(
    () =>
      (aboutPageData?.press || []).map((press) => ({
        interviewName: press.title,
        interviewUrl: press.url || '#'
      })),
    [aboutPageData?.press]
  )

  const parsedExhibitions = useMemo<FooterProperties['exhibitions']>(
    () =>
      (aboutPageData?.exhibitions || []).map((exhibition) => ({
        exhibitionName: exhibition.title,
        exhibitionUrl: '#'
      })),
    [aboutPageData?.exhibitions]
  )

  // Removido: renderAboutInfo e uso de data

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
    <main
      id="about-page"
      className="flex flex-col px-6 pt-12 font-heading xl:px-20 xl:pt-16"
    >
      <h1
        id="about-title"
        className="mb-1 text-[7vw] leading-none overflow-hidden xl:mb-8"
      >
        <span className="block invisible">THALES MACHADO</span>
        <span className="block invisible">
          {'’omentejovem‘'}
          <p
            id="about-spans"
            className="inline font-heading text-[7vw] invisible xl:hidden"
          >
            ↘
          </p>
        </span>
      </h1>

      <div className="mb-14 flex flex-row justify-end gap-2 overflow-hidden xl:gap-12 xl:mb-40">
        <h2
          id="about-subtitle"
          className="block text-xs min-w-[10rem] text-secondary-100 invisible sm:text-base xl:text-lg"
        >
          <span id="about-subtitle">
            &quot;Late Night Love&quot; is an artwork created by him in late
            2021, in which he strongly identified with the moon and decided to
            make it part of his identity.
          </span>
        </h2>

        <p
          id="about-spans"
          className="hidden -mt-[30px] font-heading text-9xl invisible xl:block"
        >
          ↘
        </p>

        <div className="flex">
          <Image
            id="about-spans"
            src={AboutArt}
            alt={'omentejovem'}
            layout="responsive"
            objectFit="contain"
            className="flex w-full h-auto invisible"
          />
        </div>
      </div>

      <hr className="bg-secondary-100" />

      <section className="relative flex flex-col justify-between px-4 py-10 gap-8 overflow-hidden xl:flex-row xl:px-20 xl:py-32 xl:gap-24">
        <div className="flex flex-col sm:flex-row gap-6 xl:gap-24">
          <p className="bio font-heading text-xs min-w-[4.5rem] text-secondary-100 sm:text-base sm:min-w-[6rem] xl:text-lg xl:min-w-[7rem]">
            Bio
          </p>
          {aboutPageData?.content ? (
            <BioRenderer content={aboutPageData.content} />
          ) : (
            <div className="text-gray-500 italic">
              Bio content not available. Please add content through the admin
              panel.
            </div>
          )}
        </div>

        <div className="flex flex-row gap-6 w-full max-w-sm xl:gap-24">
          <p className="socials font-heading text-xs min-w-[4.5rem] text-secondary-100 sm:text-base sm:min-w-[6rem] xl:text-lg xl:min-w-[7rem]">
            Socials
          </p>
          <div className="flex flex-col gap-2">
            {aboutPageData?.socials && aboutPageData.socials.length > 0 ? (
              aboutPageData.socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-100 hover:text-orange-400 transition-colors text-sm"
                >
                  {social.platform}: {social.handle}
                </a>
              ))
            ) : (
              <span className="text-gray-500 text-sm">
                No social media profiles added yet.
              </span>
            )}
          </div>
        </div>
      </section>

      <hr className="bg-secondary-100" />

      <Footer
        interviews={parsedPress}
        exhibitions={parsedExhibitions}
        email={undefined}
      />
    </main>
  )
}

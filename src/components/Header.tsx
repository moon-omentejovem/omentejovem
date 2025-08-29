'use client'

import { useSelectedLayoutSegment } from 'next/navigation'
import { useEffect, useState } from 'react'
import { headerAnimations } from '@/animations'
import { logo } from '@/assets/images'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Icons } from './Icons'
import Image from 'next/image'

const tabs = [
  {
    name: 'portfolio',
    link: '/portfolio'
  },
  {
    name: '1/1',
    link: '/1-1'
  },
  {
    name: 'editions',
    link: '/editions'
  },
  {
    name: 'series',
    link: '/series'
  },
  {
    name: 'artifacts',
    link: '/artifacts'
  }
]

export function Header() {
  const segment = useSelectedLayoutSegment()

  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false)

  useEffect(() => {
    headerAnimations()
  }, [])

  return (
    <header className="sticky top-0 flex w-full justify-between bg-background z-20 max-w-[1920px] mx-auto md:bg-transparent p-8 md:px-12 lg:px-20 md:py-10 md:gap-16">
      <Link
        href="/"
        className="header-tab min-w-fit overflow-hidden"
        onClick={() => {
          document.cookie = 'newsletter_dismissed=true; path=/; max-age=3600' // 1 hour expiry
        }}
      >
        <Image
          src={logo}
          className={cn(
            'opacity-20 hover:opacity-100',
            !segment && 'opacity-100'
          )}
          alt="Omentejovem Artwork"
          height={23}
        />
      </Link>

      <div
        id="header-tabs"
        className="flex-row justify-between w-full max-w-[640px] md:flex"
      >
        {tabs.map((tab, index) => (
          <Link
            key={index}
            href={tab.link}
            onClick={() => {
              if (`/${segment}` === tab.link && segment !== 'series') {
                window.location.reload()
              }
            }}
            className="header-tab min-w-fit overflow-hidden"
          >
            <p
              className={cn(
                'font-heading text-secondary-100 hover:text-secondary-200 hover:underline',
                tab.link.startsWith(`/${segment}`) &&
                  'text-secondary-200 underline'
              )}
            >
              {tab.name}
            </p>
          </Link>
        ))}
      </div>

      <Link
        href="/about"
        className="header-tab min-w-fit overflow-hidden md:flex"
        id="about-link"
      >
        <p
          className={cn(
            'font-heading  text-secondary-100 hover:text-secondary-200 hover:underline',
            segment === 'about' && 'text-secondary-200 underline'
          )}
        >
          about
        </p>
      </Link>

      <button
        aria-label="Filter Menu"
        className="group grid relative place-items-center w-6 md:hidden"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <Icons.X
          className={cn(
            showMobileMenu ? 'scale-100' : 'scale-0',
            'absolute stroke-secondary-100 transition-all group-hover:opacity-60 w-8 h-8'
          )}
        />
        <Icons.Menu
          className={cn(
            showMobileMenu ? 'scale-0' : 'scale-100',
            'absolute stroke-secondary-100 transition-all group-hover:opacity-60 w-8 h-8'
          )}
        />
      </button>

      {showMobileMenu && (
        <button
          className="fixed inset-0 top-[4.5rem] z-10 bg-black/[40%] max-w-[100vw]"
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            className="h-fit z-20 flex w-full flex-col px-6 py-6 gap-2 bg-background absolute"
            style={{ top: 0 }}
          >
            {tabs.map((tab, index) => (
              <Link
                key={index}
                href={tab.link}
                className="header-tab flex justify-end"
              >
                <p
                  className={cn(
                    'font-heading text-secondary-100',
                    tab.link.startsWith(`/${segment}`) &&
                      'text-secondary-200 underline'
                  )}
                >
                  {tab.name}
                </p>
              </Link>
            ))}
            <Link href="/about" className="header-tab flex justify-end">
              <p
                className={cn(
                  ' font-heading text-secondary-100',
                  segment === 'about' && 'text-secondary-200 underline'
                )}
              >
                about
              </p>
            </Link>
          </div>
        </button>
      )}
    </header>
  )
}

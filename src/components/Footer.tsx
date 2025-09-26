'use client'

import { footerAnimations } from '@/animations/client'
import { OrbitIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactElement } from 'react'
import { useEffect } from 'react'

export interface FooterProperties {
  interviews: {
    interviewUrl: string
    interviewName: string
  }[]
  exhibitions: {
    exhibitionUrl: string
    exhibitionName: string
  }[]
  email?: string
}

export function Footer({
  interviews,
  exhibitions
}: FooterProperties): ReactElement {
  useEffect(() => {
    footerAnimations()
  }, [])

  return (
    <footer id="about-footer">
      <div className="flex w-full flex-col-reverse justify-between gap-12 px-4 pt-8 pb-12 xl:flex-row xl:gap-24 xl:px-20 xl:py-36">
        <div className="flex flex-col gap-12">
          <div className="flex flex-row gap-6 xl:gap-24">
            <p className="footer-items text-xs min-w-[4.5rem] text-secondary-100 sm:text-base sm:min-w-[6rem] xl:text-lg xl:min-w-[7rem]">
              Exhibitions
            </p>
            <div className="flex flex-col gap-2">
              {!!exhibitions.length &&
                exhibitions.map((exhibition, index) => {
                  return (
                    <a
                      key={`${exhibition.exhibitionUrl}.${index}`}
                      target="_blank"
                      rel="noreferrer"
                      href={exhibition.exhibitionUrl}
                      className="footer-items text-xs text-secondary-100 hover:text-primary-50 sm:text-base xl:text-lg"
                    >
                      {exhibition.exhibitionName}
                    </a>
                  )
                })}
            </div>
          </div>

          <div className="flex flex-row gap-6 xl:gap-24">
            <p className="footer-items text-xs min-w-[4.5rem] text-secondary-100 sm:text-base sm:min-w-[6rem] xl:text-lg xl:min-w-[7rem]">
              Press
            </p>
            <div className="flex flex-col gap-2">
              {!!interviews.length &&
                interviews.map((interview, index) => {
                  return (
                    <a
                      key={`${interview.interviewUrl}.${index}`}
                      target="_blank"
                      rel="noreferrer"
                      href={interview.interviewUrl}
                      className="footer-items text-xs text-secondary-100 hover:text-primary-50 sm:text-base xl:text-lg"
                    >
                      {interview.interviewName}
                    </a>
                  )
                })}
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-6 w-full max-w-sm xl:gap-24">
          <p className="footer-email text-xs min-w-[4.5rem] text-secondary-100 sm:text-base sm:min-w-[6rem] xl:text-lg xl:min-w-[7rem]">
            E-mail
          </p>
          <a
            className="footer-email text-xs w-[13ch] break-words text-secondary-100 hover:text-primary-50 sm:text-base xl:text-lg xl:w-[13ch]"
            href="mailto:moon@omentejovem.com?subject=Contact"
          >
            moon@omentejovem.com
          </a>
        </div>
      </div>
      <div className=" border-secondary-100  py-1 px-2  text-right fixed bottom-0 right-10">
        <Link
          href="/admin"
          className="inline-flex items-baseline gap-1 text-xs underline text-secondary-100"
        >
          Orbit Admin
          <OrbitIcon className="size-3" />
        </Link>
      </div>
    </footer>
  )
}

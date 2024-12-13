'use client'

import Image from 'next/image'
import type { ReactElement } from 'react'

import parse from 'html-react-parser'
import './style.css'

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

export function ArtifactsContent(): ReactElement {
  return (
    <main
      id="about-page"
      className="flex flex-col px-6 font-heading xl:px-20 xl:pt-6"
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

      <hr className="bg-secondary-100" />

      <div className="relative">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image
            src="/crate.png"
            alt="Crate background"
            layout="fill"
            objectFit="cover"
          />
        </div>

        <div className="relative z-10">
          <h2 className="text-orange-500 text-2xl font-bold mt-6">
            claimable for collectors
          </h2>
          <h3 className="text-gray-500 text-xl mt-3">
            Shapes&Colors: Collectible Crates
          </h3>
          <p className="mt-4 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ut
            neque vel enim bibendum semper. Nunc at lobortis massa. Suspendisse
            at nulla vel metus blandit venenatis. Aenean aliquet lectus a
            condimentum consectetur.
          </p>
        </div>
      </div>
    </main>
  )
}

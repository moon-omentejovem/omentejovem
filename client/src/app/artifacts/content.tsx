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
      className="flex flex-col justify-end px-6 font-heading xl:px-20 xl:pb-20 relative min-h-screen"
    >
      <div className="fixed inset-0 z-0">
        <Image
          src="/crate.png"
          alt="Crate background"
          layout="fill"
          objectFit="cover"
          objectPosition="center 45%"
          priority
        />
      </div>

      <div className="relative z-10 w-1/4">
        <h2 className="text-orange-500 text-2xl font-bold">
          claimable for collectors
        </h2>
        <h3 className="text-gray-500 text-xl mt-3">
          Shapes&Colors: Collectible Crates
        </h3>
        <p className="mt-4 text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ut
          neque vel enim bibendum semper. Nunc at lobortis massa. Suspendisse at
          nulla vel metus blandit venenatis. Aenean aliquet lectus a condimentum
          consectetur.
        </p>
      </div>
    </main>
  )
}

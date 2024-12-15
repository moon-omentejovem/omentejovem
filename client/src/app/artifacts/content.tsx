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
    <main className="flex flex-col justify-center px-6 font-heading xl:px-20 relative h-screen overflow-hidden">
      <div className="fixed inset-0 z-0">
        <video
          src="/crate.mp4"
          className="object-cover w-full h-full"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <div className="relative z-10 w-full xl:w-1/4 mt-[45vh] sm:mt-20 flex flex-col">
        <h2 className="text-orange-500 text-base font-bold uppercase">
          claimable for collectors
        </h2>
        <h3 className="text-gray-500 text-2xl mt-3">
          Shapes&Colors:
          <br />
          Collectible Crates
        </h3>
        <p className="mt-8 text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ut
          neque vel enim bibendum semper. Nunc at lobortis massa. Suspendisse at
          nulla vel metus blandit venenatis. Aenean aliquet lectus a condimentum
          consectetur.
        </p>
      </div>
    </main>
  )
}

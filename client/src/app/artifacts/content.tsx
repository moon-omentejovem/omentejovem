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
    <main className="flex flex-col justify-center px-6 font-heading xl:px-20 relative h-full overflow-hidden">
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

      <div className="relative z-10 w-full max-w-[500px]  mt-[40vh] sm:mt-[40vh] flex flex-col">
        <span className="text-orange-500 text-base font-bold font-body uppercase">
          claimable for collectors
        </span>
        <h3 className="text-secondary-100 text-2xl mt-3 font-body">
          Shapes&Colors:
          <br />
          Collectible Crates
        </h3>
        <p className="mt-8 text-secondary-100 opacity-70 font-body">
          Collectors can now claim the “S&C Package”.
          Each set includes a unique wooden collectible, accompanied by a 48x48cm individually signed fine art print. Claim is made once by the collector that owns it by the release of the artifact.
        </p>
        <a
          href="https://www.youtube.com/playlist?list=PLk9K75kTXfFMkh0yLeJTlHWAjfS3zeSDw"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 px-4 py-2 rounded-lg text-white bg-primary-100/80 hover:bg-primary-100 transition-colors flex items-center justify-center inline flex w-64"
        >
          Watch More
        </a>
      </div>
    </main>
  )
}

'use client'

import Image from 'next/image'
import type { ReactElement } from 'react'

import './style.css'

interface ArtifactData {
  id: string
  title: string
  description?: string
  image_url?: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

interface ArtifactsContentProps {
  artifacts?: ArtifactData[]
}

export function ArtifactsContent({
  artifacts = []
}: ArtifactsContentProps): ReactElement {
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

      <div className="relative z-10 w-full max-w-[500px] mt-[40vh] sm:mt-[40vh] flex flex-col">
        <span className="text-orange-500 text-base font-bold font-body uppercase">
          claimable for collectors
        </span>
        <h3 className="text-secondary-100 text-2xl mt-3 font-body">
          Shapes&Colors:
          <br />
          Collectible Crates
        </h3>
        <p className="mt-8 text-secondary-100 opacity-70 font-body">
          Collectors can now claim the "S&C Package". Each set includes a unique
          wooden collectible, accompanied by a 48x48cm individually signed fine
          art print. Claim is made once by the collector that owns it by the
          release of the artifact.
        </p>

        {/* Dynamic artifacts section */}
        {artifacts.length > 0 && (
          <div className="mt-8 space-y-4">
            <h4 className="text-secondary-100 text-lg font-body">
              Available Artifacts:
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {artifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center space-x-4">
                    {artifact.image_url && (
                      <Image
                        src={artifact.image_url}
                        alt={artifact.title}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h5 className="text-secondary-100 font-body text-sm font-semibold">
                        {artifact.title}
                      </h5>
                      {artifact.description && (
                        <p className="text-secondary-100/70 font-body text-xs mt-1">
                          {artifact.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <a
          href="https://www.youtube.com/playlist?list=PLk9K75kTXfFMkh0yLeJTlHWAjfS3zeSDw"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 px-4 py-2 rounded-lg text-white bg-primary-100/80 hover:bg-primary-100 transition-colors flex items-center justify-center w-64"
        >
          Watch More
        </a>
      </div>
    </main>
  )
}

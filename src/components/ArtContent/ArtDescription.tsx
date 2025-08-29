import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ArtDescriptionProps {
  description?: string
  name?: string
  mintedOn?: string
}

export function ArtDescription({
  description = '',
  name = '',
  mintedOn = ''
}: ArtDescriptionProps) {
  const [expanded, setExpanded] = useState(false)

  const truncate = (input: string) =>
    input.length > 600 ? `${input.substring(0, 250)}...` : input

  return (
    <div
      id="art-description"
      className={cn(
        'h-fit flex flex-col-reverse gap-4 w-full text-sm text-secondary-100',
        'xl:flex-col xl:max-w-sm xl:mt-auto'
      )}
    >
      <p id="art-description-text" className="break-words">
        {expanded ? description : truncate(description)}
        {description.length > 600 && (
          <span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-primary-50 font-extrabold"
            >
              {expanded ? '-' : '+'}
            </button>
          </span>
        )}
      </p>
      <div>
        <p className="text-primary-50 underline mt-4">{name}</p>
        {mintedOn && <p>minted on {mintedOn}</p>}
      </div>
    </div>
  )
}

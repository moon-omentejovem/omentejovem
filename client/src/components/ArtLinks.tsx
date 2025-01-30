/* eslint-disable jsx-a11y/click-events-have-key-events */
import { CustomIcons } from '@/assets/icons'
import { useState } from 'react'
import { OfferModal } from './Modals/OfferModal'
import { cn } from '@/lib/utils'
import { ExternalLink, NFT } from '@/api/resolver/types'

interface ArtLinkProperties {
  email: string
  externalLinks?: ExternalLink[]
  availableForPurchase?: {
    text: string
    url: string
  }
  makeOffer: {
    active: boolean
    buttonText: string
  }
  views: Record<string, string>
}

export function ArtLinks({
  email,
  externalLinks,
  availableForPurchase,
  makeOffer,
  views
}: ArtLinkProperties) {
  const [isOpenOffer, setIsOpenOffer] = useState(false)

  return (
    <div className="flex w-full flex-col justify-end max-w-sm sm:max-w-xl">
      {/* {[0, 0, 0, 0].map((contract, index) => (
				<a
					target="_blank"
					rel="noreferrer"
					key={index}
					href='#'
					className={cn(
						'grid content-center border-t-[1px] border-secondary-100 text-sm h-16 px-4 font-bold text-secondary-100 hover:text-primary-50',
						'sm:px-8 last:border-b-[1px]',
					)}
				>
					AVAILABLE FOR 
				</a>
			))}    */}

      {!!availableForPurchase && (
        <p
          className={cn(
            'mt-2 grid content-center justify-start border-y-[1px] border-secondary-100 text-sm h-16 sm:px-8 px-4 font-bold text-secondary-100',
            !!makeOffer?.active && 'border-b-0'
          )}
          style={{
            textAlign: 'left'
          }}
        >
          {!availableForPurchase.url ? (
            availableForPurchase.text
          ) : (
            <a
              target="_blank"
              rel="noreferrer"
              href={(availableForPurchase.url as string) ?? '#'}
              className={cn('text-secondary-100 hover:text-primary-50')}
            >
              AVAILABLE FOR PURCHASE
            </a>
          )}
        </p>
      )}

      {!!makeOffer?.active && (
        <OfferModal email={email} open={isOpenOffer} setOpen={setIsOpenOffer}>
          <button
            onClick={() => setIsOpenOffer(true)}
            style={{
              textAlign: 'left'
            }}
            className={cn(
              'grid content-center border-t-[1px] border-secondary-100 text-sm h-16 px-4 font-bold text-secondary-100 hover:text-primary-50',
              'sm:px-8 last:border-b-[1px]'
            )}
          >
            {makeOffer.buttonText
              ? makeOffer.buttonText.toUpperCase()
              : 'MAKE OFFER'}
          </button>
        </OfferModal>
      )}

      {externalLinks?.map((externalLink, index) => (
        <div
          key={index}
          className={cn(
            'flex justify-between items-center border-t-[1px] border-secondary-100 text-sm h-16 px-4 font-bold',
            'sm:px-8 last:border-b-[1px]'
          )}
        >
          <a
            href={externalLink.url}
            target="_blank"
            rel="noreferrer"
            className="text-secondary-100 hover:text-primary-50"
          >
            VIEW ON {externalLink.name.toUpperCase()}
          </a>
          <a
            href={views['explorer']}
            target="_blank"
            rel="noreferrer"
            className="text-secondary-100 hover:text-primary-50"
          >
            <CustomIcons.ArrowUpRight />
          </a>
        </div>
      ))}
    </div>
  )
}

import { CustomIcons } from '@/assets/icons'
import Objkt from '@/assets/icons/objkt'
import OpenSea from '@/assets/icons/open-sea'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { NftArt, NftOwner, NftTransferEvent } from '../ArtContent/types'
import { ArtTransaction, formatOwnerAddress } from './ArtTransaction'
import type { ArtOwner, ArtTransaction as TArtTransaction } from './types'
import { useState } from 'react'
import { OwnersModal } from '../Modals/OwnersModal'

interface ArtOwnershipProperties {
  nftChain: NftArt['nftChain']
  collectionsMode?: boolean
  artAddress: string
  owners: NftOwner[]
  firstEvent?: NftTransferEvent
  lastEvent?: NftTransferEvent
}

export function ArtOwnership({
  nftChain,
  collectionsMode,
  artAddress,
  owners,
  firstEvent,
  lastEvent
}: ArtOwnershipProperties) {
  const pathname = usePathname()

  const owner = owners.length === 1 ? owners[0] : null
  const [isOwnersModalOpen, setIsOwnersModalOpen] = useState(false)

  return (
    <div
      className={cn(
        'flex flex-col gap-12',
        collectionsMode ? 'w-full' : 'max-w-xl',
        nftChain === 'unknown' && 'hidden'
      )}
    >
      {owner && nftChain !== 'unknown' && (
        <div
          id="art-owned-by"
          className={cn(
            'flex flex-row border-y-[1px] mt-auto border-secondary-100 items-center justify-between text-sm min-h-[4rem] px-8 font-bold text-secondary-100'
          )}
        >
          <p>OWNED BY</p>
          {pathname.includes('editions') ? (
            nftChain === 'ethereum' ? (
              <a target="_blank" rel="noreferrer" href={artAddress}>
                <OpenSea />
              </a>
            ) : (
              <a target="_blank" rel="noreferrer" href={artAddress}>
                <Objkt />
              </a>
            )
          ) : (
            <a
              target="_blank"
              rel="noreferrer"
              href={owner.address}
              className="text-primary-50 hover:underline"
            >
              {formatOwnerAddress(owner.address)}
            </a>
          )}
        </div>
      )}
      {collectionsMode && owners.length && owners.length > 1 && (
        <button
          onClick={() => setIsOwnersModalOpen(true)}
          className="text-primary-50 underline"
        >
          View All Owners
        </button>
      )}
      <OwnersModal
        owners={owners}
        open={isOwnersModalOpen}
        setOpen={setIsOwnersModalOpen}
      />
      {!owner && nftChain !== 'unknown' && (
        <div
          id="art-owned-by"
          className={cn(
            'flex flex-row border-y-[1px] mt-auto border-secondary-100 items-center justify-between text-sm min-h-[4rem] px-8 font-bold text-secondary-100'
          )}
        >
          <p>{owners.length} OWNERS</p>
        </div>
      )}

      {(firstEvent || lastEvent) && (
        <div id="art-provenance" className="flex-col">
          <div className="flex flex-row border-b-[1px] border-secondary-100 items-center justify-between text-lg h-16 px-8 text-secondary-100">
            <p>PROVENANCE | LAST</p>

            <a
              target="_blank"
              rel="noreferrer"
              href={artAddress}
              className="hover:fill-primary-50"
              aria-label="Transaction page"
            >
              <CustomIcons.Info />
            </a>
          </div>

          <ul className="list-none">
            <ArtTransaction
              transaction={firstEvent}
              collectionsMode={collectionsMode}
            />
            <ArtTransaction
              transaction={lastEvent}
              collectionsMode={collectionsMode}
            />
          </ul>
        </div>
      )}
    </div>
  )
}

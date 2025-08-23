import { CustomIcons } from '@/assets/icons'
import Objkt from '@/assets/icons/objkt'
import OpenSea from '@/assets/icons/open-sea'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import {
  Chain,
  FirstCreated,
  Mint,
  Owner,
  Sale,
  TransferFromAPI
} from '../ArtContent/types'
import { ArtTransaction, formatOwnerAddress } from './ArtTransaction'
import { useEffect, useState } from 'react'
import { OwnersModal } from '../Modals/OwnersModal'
import { ArtMint } from './ArtMint'
import { fetchTransfersForToken } from '@/api/requests/fetchTransfersForToken'

interface ArtOwnershipProperties {
  nftChain: Chain
  tokenId: string
  contractAddress: string
  collectionsMode?: boolean
  artAddress: string
  owners: Owner[]
  firstEvent?: Mint
  lastEvent?: Mint
  source?: 'portfolio' | '1-1' | 'editions' | string
}

export function ArtOwnership({
  nftChain,
  tokenId,
  contractAddress,
  collectionsMode,
  artAddress,
  owners,
  firstEvent,
  lastEvent,
  source
}: ArtOwnershipProperties) {
  const pathname = usePathname()
  const [transfers, setTransfers] = useState<TransferFromAPI[]>([])

  const owner = owners?.length === 1 ? owners[0] : null
  const [isOwnersModalOpen, setIsOwnersModalOpen] = useState(false)

  useEffect(() => {
    const fetchTransfers = async () => {
      const transfers = await fetchTransfersForToken(
        nftChain,
        contractAddress,
        tokenId
      )
      setTransfers(transfers)
    }
    fetchTransfers()
  }, [contractAddress, tokenId, nftChain])

  return (
    <div
      className={cn(
        'flex flex-col gap-12',
        collectionsMode ? 'w-full' : 'max-w-xl'
      )}
    >
      {owner && owners.length === 1 && (
        <div
          id="art-owned-by"
          className={cn(
            'flex flex-row border-b-[1px] mt-auto border-secondary-100 items-center justify-between text-sm min-h-[4rem] px-8 font-bold text-secondary-100'
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
          ) : nftChain === 'ethereum' ? (
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://etherscan.io/address/${owner.owner_address}`}
              className="text-primary-50 hover:underline"
            >
              {formatOwnerAddress(owner.owner_address)}
            </a>
          ) : (
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://tzkt.io/${owner.owner_address}`}
              className="text-primary-50 hover:underline"
            >
              {formatOwnerAddress(owner.owner_address)}
            </a>
          )}
        </div>
      )}
      {owners?.length > 1 && (
        <div
          id="art-owned-by"
          className={cn(
            'flex flex-row border-b-[1px] mt-auto border-secondary-100 items-center justify-between text-sm min-h-[4rem] px-8 font-bold text-secondary-100'
          )}
        >
          <OwnersModal
            owners={owners}
            open={isOwnersModalOpen}
            setOpen={setIsOwnersModalOpen}
          >
            <button
              onClick={() => setIsOwnersModalOpen(true)}
              style={{
                textAlign: 'left'
              }}
              className={cn('hover:text-primary-50')}
            >
              VIEW ALL OWNERS
            </button>
          </OwnersModal>
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

          <ul className="list-none max-h-[320px] overflow-y-auto">
            {transfers?.map((transfer) => (
              <ArtTransaction
                key={transfer.transaction}
                chain={nftChain === 'ethereum' ? 'ethereum' : 'tezos'}
                transaction={transfer}
                collectionsMode={collectionsMode}
              />
            ))}
            <ArtMint
              chain={nftChain === 'ethereum' ? 'ethereum' : 'tezos'}
              transaction={firstEvent}
              collectionsMode={collectionsMode}
            />
          </ul>
        </div>
      )}
    </div>
  )
}

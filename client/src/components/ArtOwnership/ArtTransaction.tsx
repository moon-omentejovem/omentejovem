import { ReactElement } from 'react'
import { type ArtTransaction } from './types'
import { addHours, format } from 'date-fns'
import { CustomIcons } from '@/assets/icons'
import { cn } from '@/lib/utils'
import {
  FirstCreated,
  NftTransferEvent,
  Sale,
  TransferFromAPI
} from '../ArtContent/types'

interface ArtTransactionProperties {
  transaction?: TransferFromAPI
  collectionsMode?: boolean
  chain: 'ethereum' | 'tezos'
}

export const omentejovemAddress: Record<string, string> = {
  '0x116723a14c7ee8ac3647d37bb5e9f193c29b3489': 'omentejovem.eth',
  '0x3a3548e060be10c2614d0a4cb0c03cc9093fd799': 'Manifold: Marketplace',
  '0xcda72070e455bb31c7690a170224ce43623d0b6f': 'Foundation: Market'
}

const nullAddress = '0x0000000000000000000000000000000000000000'

function formattedDate(date: string): string {
  return format(addHours(date, 3), 'LLL d, yyyy hh:mmaaa')
}

export function formatOwnerAddress(ownerName?: string): string {
  return `${ownerName?.slice(0, 6) ?? ''}...${ownerName?.slice(-4) ?? ''}`
}

export function ArtTransaction({
  transaction,
  chain,
  collectionsMode
}: ArtTransactionProperties): ReactElement {
  if (
    transaction &&
    'minted_to' in transaction &&
    transaction.minted_to === nullAddress
  ) {
    return (
      <li
        className={cn(
          'flex flex-row border-b-[1px] border-secondary-100 items-center gap-4 justify-between text-sm px-4 text-secondary-100',
          collectionsMode
            ? 'h-fit py-4 sm:py-4'
            : 'py-2 sm:py-0 sm:h-16 sm:px-8'
        )}
      >
        <div className="flex flex-col">
          <p className="font-bold">
            Minted by&nbsp;
            <a
              target="_blank"
              rel="noreferrer"
              href={transaction.minted_to}
              className="text-primary-50 hover:underline"
              aria-label={`${transaction.minted_to} seller profile`}
            >
              {formatOwnerAddress(transaction.minted_to)}ayo
            </a>
          </p>
          <p>{formattedDate(transaction.timestamp)}</p>
        </div>

        <a
          target="_blank"
          rel="noreferrer"
          href={`https://${chain === 'ethereum' ? 'etherscan.io/tx' : 'tzkt.io'}/${transaction.transaction}`}
          className="hover:fill-primary-50"
          aria-label="Transaction page"
        >
          <CustomIcons.ArrowUpRight />
        </a>
      </li>
    )
  }

  return (
    <li
      className={cn(
        'flex flex-row border-b-[1px] border-secondary-100 items-center gap-4 justify-between text-sm px-4 text-secondary-100',
        collectionsMode ? 'h-fit py-4 sm:py-4' : 'py-2 sm:py-0 sm:h-16 sm:px-8'
      )}
    >
      <div className="flex flex-col">
        <p className="font-bold">
          Transferred from{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://${chain === 'ethereum' ? 'etherscan.io/address' : 'tzkt.io/address'}/${transaction?.from_address}`}
            className="text-primary-50 hover:underline"
            aria-label={`${transaction?.from_address} seller profile`}
          >
            {formatOwnerAddress(transaction?.from_address)}
          </a>{' '}
          to{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://${chain === 'ethereum' ? 'etherscan.io/address' : 'tzkt.io/address'}/${transaction?.to_address}`}
            className="text-primary-50 hover:underline"
            aria-label={`${transaction?.to_address} seller profile`}
          >
            {formatOwnerAddress(transaction?.to_address)}
          </a>
        </p>
        <p>{formattedDate(transaction?.timestamp || '2020-01-01')}</p>
      </div>

      <a
        target="_blank"
        rel="noreferrer"
        href={`https://${chain === 'ethereum' ? 'etherscan.io/tx' : 'tzkt.io'}/${transaction?.transaction}`}
        className="hover:fill-primary-50"
        aria-label="Transaction page"
      >
        <CustomIcons.ArrowUpRight />
      </a>
    </li>
  )
}

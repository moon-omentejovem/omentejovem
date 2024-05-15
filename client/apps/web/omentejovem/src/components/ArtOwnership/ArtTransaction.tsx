import { ReactElement } from 'react'
import { type ArtTransaction } from './types'
import { addHours, format } from 'date-fns'
import { CustomIcons } from '@/assets/icons'
import { cn } from '@/lib/utils'

interface ArtTransactionProperties {
	transaction: ArtTransaction
	collectionsMode?: boolean
}

export const omentejovemAddress: Record<string, string> = {
	'0x116723a14c7ee8ac3647d37bb5e9f193c29b3489': 'omentejovem.eth',
	'0x3a3548e060be10c2614d0a4cb0c03cc9093fd799': 'Manifold: Marketplace',
	'0xcda72070e455bb31c7690a170224ce43623d0b6f': 'Foundation: Market',
} 

function formattedDate(date: string): string {
	return format(addHours(date, 3), 'LLL d, yyyy hh:mmaaa')
}

export function formatOwnerAddress(ownerName: string): string {
	return `${ownerName?.slice(0, 6) ?? ''}...${ownerName?.slice(-4) ?? ''}`
}

export function ArtTransaction({
	transaction,
	collectionsMode,
}: ArtTransactionProperties): ReactElement {
	if (/0x[0]{40}/gm.test(transaction.previousOwner.name)) {
		return (
			<li
				className={cn(
					'flex flex-row border-b-[1px] border-secondary-100 items-center gap-4 justify-between text-sm px-4 text-secondary-100',
					collectionsMode ? 'h-fit py-4 sm:py-4' : 'py-2 sm:py-0 sm:h-16 sm:px-8',
				)}
			>
				<div className="flex flex-col">
					<p className="font-bold">
						Minted by&nbsp;
						<a
							target="_blank"
							rel="noreferrer"
							href={transaction.nextOwner.profileUrl}
							className="text-primary-50 hover:underline"
							aria-label={`${transaction.nextOwner.name} seller profile`}
						>
							{omentejovemAddress[transaction.nextOwner.name] ??
								formatOwnerAddress(transaction.nextOwner.name)}
						</a>
					</p>
					<p>{formattedDate(transaction.date)}</p>
				</div>

				<a
					target="_blank"
					rel="noreferrer"
					href={transaction.transactionUrl}
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
				collectionsMode ? 'h-fit py-4 sm:py-4' : 'py-2 sm:py-0 sm:h-16 sm:px-8',
			)}
		>
			<div className="flex flex-col">
				<p className="font-bold">
					Transferred from{' '}
					<a
						target="_blank"
						rel="noreferrer"
						href={transaction.previousOwner.profileUrl}
						className="text-primary-50 hover:underline"
						aria-label={`${transaction.previousOwner.name} seller profile`}
					>
						{omentejovemAddress[transaction.previousOwner.name] ??
							formatOwnerAddress(transaction.previousOwner.name)}
					</a>{' '}
					to{' '}
					<a
						target="_blank"
						rel="noreferrer"
						href={transaction.nextOwner.profileUrl}
						className="text-primary-50 hover:underline"
						aria-label={`${transaction.nextOwner.name} seller profile`}
					>
						{omentejovemAddress[transaction.nextOwner.name] ??
							formatOwnerAddress(transaction.nextOwner.name)}
					</a>
				</p>
				<p>{formattedDate(transaction.date)}</p>
			</div>

			<a
				target="_blank"
				rel="noreferrer"
				href={transaction.transactionUrl}
				className="hover:fill-primary-50"
				aria-label="Transaction page"
			>
				<CustomIcons.ArrowUpRight />
			</a>
		</li>
	)
}

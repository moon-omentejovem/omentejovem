import { CustomIcons } from '@/assets/icons'
import Objkt from '@/assets/icons/objkt'
import OpenSea from '@/assets/icons/open-sea'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { NftArt } from '../ArtContent/types'
import { ArtTransaction, formatOwnerAddress } from './ArtTransaction'
import type { ArtOwner, ArtTransaction as TArtTransaction } from './types'

interface ArtOwnershipProperties {
	nftChain: NftArt['nftChain']
	collectionsMode?: boolean
	artAddress: string
	owner?: ArtOwner
	transactions: TArtTransaction[]
}

export function ArtOwnership({
	nftChain,
	collectionsMode,
	artAddress,
	owner,
	transactions,
}: ArtOwnershipProperties) {
	const pathname = usePathname()

	return (
		<div
			className={cn(
				'flex flex-col gap-12',
				collectionsMode ? 'w-full' : 'max-w-xl',
				nftChain === 'unknown' && 'hidden',
			)}
		>
			{owner && nftChain !== 'unknown' && (
				<div
					id="art-owned-by"
					className={cn(
						'flex flex-row border-y-[1px] mt-auto border-secondary-100 items-center justify-between text-sm min-h-[4rem] px-8 font-bold text-secondary-100',
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
							href={owner.profileUrl}
							className="text-primary-50 hover:underline"
						>
							{formatOwnerAddress(owner.name)}
						</a>
					)}
				</div>
			)}

			{transactions.length > 0 && (
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
						{transactions.slice(0, 2).map((transaction, index) => (
							<ArtTransaction
								key={`${Date.now()}:${index}`}
								transaction={transaction}
								collectionsMode={collectionsMode}
							/>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

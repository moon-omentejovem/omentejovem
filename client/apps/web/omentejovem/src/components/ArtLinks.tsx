import { CustomIcons } from '@/assets/icons'
import { useMemo, useState } from 'react'
import { OfferModal } from './Modals/OfferModal'
import { cn } from '@/lib/utils'
import { NftContractButton, NftData } from '@/api/@types'

interface ArtLinkProperties {
	email: string
	availableOn?: NftData['contracts']
	availableForPurchase?: NftData['available_purchase']
	makeOffer: NftData['make_offer']
	views: Record<string, string>
}

export function ArtLinks({
	email,
	availableOn,
	availableForPurchase,
	makeOffer,
	views,
}: ArtLinkProperties) {
	const [isOpenOffer, setIsOpenOffer] = useState(false)

	const allAvailableOn = useMemo(() => {
		const available = []

		if (availableOn?.eth) {
			const allKeys = Object.keys(availableOn.eth).filter((key) => key.includes('_button'))

			for (const key of allKeys) {
				const typedKey = key as keyof (typeof availableOn)['eth']
				const [contractKey] = typedKey.split('_button')

				const cmsButton = availableOn.eth[typedKey] as unknown as NftContractButton

				if (cmsButton?.status) {
					available.push({
						label: cmsButton.label,
						url: availableOn.eth[`${contractKey}_url`],
					})
				}
			}
		}

		if (availableOn?.xtz) {
			const allKeys = Object.keys(availableOn.xtz).filter((key) => key.includes('_button'))

			for (const key of allKeys) {
				const typedKey = key as keyof (typeof availableOn)['xtz']
				const [contractKey] = typedKey.split('_button')
				const cmsButton = availableOn.xtz[typedKey] as unknown as NftContractButton

				if (cmsButton?.status) {
					available.push({
						label: cmsButton.label,
						url: availableOn.xtz[`${contractKey}_url`],
					})
				}
			}
		}

		return available
	}, [availableOn])

	return (
		<div className="flex w-full flex-col justify-end max-w-sm sm:max-w-xl">
			{allAvailableOn.map((contract, index) => (
				<a
					target="_blank"
					rel="noreferrer"
					key={index}
					href={(contract.url as string) ?? '#'}
					className={cn(
						'grid content-center border-t-[1px] border-secondary-100 text-sm h-16 px-4 font-bold text-secondary-100 hover:text-primary-50',
						'sm:px-8 last:border-b-[1px]',
					)}
				>
					{contract.label.toUpperCase()}
				</a>
			))}

			{availableForPurchase?.active &&
				((!availableForPurchase.status && !!availableForPurchase.text) ||
					(availableForPurchase.status && !!availableForPurchase.text_available)) && (
					<p
						className={cn(
							'mt-2 grid content-center justify-start border-y-[1px] border-secondary-100 text-sm h-16 px-8 font-bold text-secondary-100',
							!!makeOffer?.active && 'border-b-0',
						)}
					>
						{!availableForPurchase.status ? (
							availableForPurchase.text
						) : (
							<a
								target="_blank"
								rel="noreferrer"
								href={(availableForPurchase.url as string) ?? '#'}
								className={cn('text-secondary-100 hover:text-primary-50')}
							>
								{availableForPurchase.text_available?.toUpperCase()}
							</a>
						)}
					</p>
				)}

			{!!makeOffer?.active && (
				<OfferModal email={email} open={isOpenOffer} setOpen={setIsOpenOffer}>
					<p
						onClick={() => setIsOpenOffer(true)}
						className={cn(
							'grid content-center border-t-[1px] border-secondary-100 text-sm h-16 px-4 font-bold text-secondary-100 hover:text-primary-50',
							'sm:px-8 last:border-b-[1px]',
						)}
					>
						{makeOffer.button_text ? makeOffer.button_text.toUpperCase() : 'MAKE OFFER'}
					</p>
				</OfferModal>
			)}

			{Object.entries(views).map(([key, value]) => (
				<a
					key={key}
					target="_blank"
					rel="noreferrer"
					href={value}
					className={cn(
						'flex justify-between items-center border-t-[1px] border-secondary-100 text-sm h-16 px-4 font-bold text-secondary-100 hover:text-primary-50',
						'sm:px-8 last:border-b-[1px]',
					)}
				>
					VIEW ON {key.toUpperCase()} <CustomIcons.ArrowUpRight />
				</a>
			))}
		</div>
	)
}

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { collectionLinksAnimations } from '@/animations'

interface CollectionLinkProperties {
	projectName: string
	redirect: string
	year: string
	images: string[]
	onMouseOver: Function
}

interface Coordinates {
	x: number
	y: number
}

export function CollectionLink({ projectName, redirect, year, images, onMouseOver }: CollectionLinkProperties) {

	return (
		<div className="flex flex-row" onMouseOver={() => onMouseOver()} onFocus={() => {}}>
			<Link
				className="group/collection relative flex flex-row items-center justify-between text-java-800 cursor-none"
				id={`collection-${projectName}`}
				href={redirect}
			>
				<div className="collection-link group overflow-hidden sm:group-hover/collection:z-[1001]">
					<p className="font-heading text-[4vw] text-secondary-100 group-hover:text-secondary-200 sm:text-[1.8vw] sm:text-secondary-50">
						{`(${year})`}
						<span className="leading-[1.1] text-[8vw] inline-block tracking-[-0.3vw] sm:text-[5.4vw] sm:leading-none">
							{projectName}
						</span>
					</p>
				</div>
			</Link>
			<p className="font-heading text-[4vw] invisible sm:text-[1.8vw]">{`(${year})`}</p>
		</div>
	)
}

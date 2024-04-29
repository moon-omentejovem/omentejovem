'use client'

import { ReactElement, useEffect, useMemo, useState } from 'react'
import { Icons } from './Icons'
import { filterAnimations } from '@/animations'
import { cn } from '@/lib/utils'

export interface Filter {
	name: string
	subfilters?: {
		name: string
	}[]
}

interface FilterProperties {
	filter: Filter[]
	onChangeFilter?: (filter: string) => void
}

export function Filter({ filter, onChangeFilter }: FilterProperties): ReactElement {
	const initialFilter = useMemo(() => filter, [filter])
	const [open, setOpen] = useState(false)
	const [filters, setFilters] = useState<Filter[]>(initialFilter)
	const [filterHistory, setFilterHistory] = useState<Filter[][]>([])
	const [filterStep, setFilterStep] = useState(1)
	const [selected, setSelected] = useState<string>('latest')

	useEffect(() => {
		if (filters && open) {
			filterAnimations(false)
		}
	}, [filters])

	function updateFilters(content: Filter[]) {
		setFilterHistory([...filterHistory, filters])
		setFilters(
			content
				.filter((filter) => !filter.name.includes('_url') && !filter.name.includes('_button'))
				.map((filter) => ({ ...filter, name: filter.name.replace(/_/g, ' ') })),
		)
	}

	function leaveFilter() {
		const previousFilters = filterHistory.pop()
		setFilterHistory(filterHistory.slice())
		if (previousFilters) {
			setFilters(previousFilters)
		}
		setFilterStep(filterStep - 1)
	}

	return (
		<div className="flex flex-col gap-2 mt-8 items-center">
			<button
				onClick={() => {
					if (filterStep === 1) {
						filterAnimations(open)
						setOpen(!open)
					} else {
						leaveFilter()
					}
				}}
				aria-label="Filter Menu"
				className="group grid relative place-items-center w-12 h-12 cursor-none hover:cursor-none"
			>
				<Icons.X
					className={cn(
						open ? 'scale-100' : 'scale-0',
						'absolute stroke-secondary-100 transition-all group-hover:opacity-60 w-8 h-8',
					)}
				/>
				<Icons.Menu
					className={cn(
						open ? 'scale-0' : 'scale-100',
						'absolute stroke-secondary-100 transition-all group-hover:opacity-60 w-8 h-8',
					)}
				/>
			</button>

			<div
				className={cn(
					'grid grid-cols-[repeat(auto-fit,140px)] place-content-center w-full max-w-[100vw] gap-x-12 gap-y-8 px-4 overflow-hidden',
					'md:gap-x-20',
					!open && 'pointer-events-none',
				)}
			>
				{filters.map((filter, index) => (
					<button
						key={index}
						onClick={(event) => {
							const filterName = event.currentTarget.ariaLabel as string

							if (filter?.subfilters) {
								updateFilters(filter.subfilters)
								setFilterStep(filterStep + 1)
							} else {
								setSelected(filterName)
							}

							onChangeFilter?.(filterName)
						}}
						className={cn(
							'filter-option text-secondary-100 text-sm uppercase body-variant overflow-y-hidden md:text-base',
							selected === filter.name && 'text-secondary-200 underline',
						)}
						aria-label={filter.name}
					>
						<p className="translate-y-12">{filter.name}</p>
					</button>
				))}
			</div>
		</div>
	)
}

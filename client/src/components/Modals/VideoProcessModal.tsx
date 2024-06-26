import { modalAnimations } from '@/animations'
import * as Dialog from '@radix-ui/react-dialog'
import { Dispatch, SetStateAction, useState } from 'react'

interface VideoProcessModalProperties {
	open: boolean
	setOpen: Dispatch<SetStateAction<boolean>>
	videoUrl: string
}

export function VideoProcessModal({ open, setOpen, videoUrl }: VideoProcessModalProperties) {
	const [isAnimating, setIsAnimating] = useState(false)

	return (
		<Dialog.Root open={open} modal={true}>
			<Dialog.Portal>
				<Dialog.Overlay className="modal-overlay fixed inset-0 bg-black/[30%] backdrop-blur-sm z-20" />
				<Dialog.Content
					className="modal-content fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
					onOpenAutoFocus={() => {
						if (!isAnimating) {
							modalAnimations(setIsAnimating)
						}
					}}
					onInteractOutside={() => {
						setOpen(false)
					}}
				>
					<div className="flex w-[100vw] h-auto sm:w-full sm:h-full">
						<video autoPlay loop width={640}>
							<track src='' kind='captions' srcLang='en' label='english_captions'/>
							<source src={videoUrl} />
							Your browser does not support HTML5 video.
						</video>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

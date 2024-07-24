import { SyntheticEvent } from 'react'

export function addLoadedClass(
  loadedEvent: SyntheticEvent<HTMLImageElement, Event>
) {
  loadedEvent.currentTarget.classList.add('loaded')

  console.log(loadedEvent.currentTarget)
}

import { useContext } from 'react'
import {
  CollectionsContext,
  type CollectionsContextProperties
} from './CollectionsContent'

export function useCollectionsContext(): CollectionsContextProperties {
  const values = useContext(CollectionsContext)

  if (!values) {
    throw new Error('CollectionsContext should be called inside a provider')
  }

  return values
}

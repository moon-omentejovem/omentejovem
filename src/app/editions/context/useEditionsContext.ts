import { useContext } from 'react'
import {
  EditionsContext,
  type EditionsContextProperties
} from './EditionsContext'

export function useEditionsContext(): EditionsContextProperties {
  const values = useContext(EditionsContext)

  if (!values) {
    throw new Error('EditionsContext should be called inside a provider')
  }

  return values
}
